const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Token không được cung cấp hoặc không đúng định dạng' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Token không hợp lệ' 
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists and is active
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Người dùng không tồn tại' 
            });
        }

        if (user.status !== 'active') {
            return res.status(401).json({ 
                success: false,
                message: 'Tài khoản đã bị vô hiệu hóa' 
            });
        }

        // Check if account is locked
        if (user.isAccountLocked) {
            return res.status(423).json({ 
                success: false,
                message: 'Tài khoản đã bị khóa tạm thời do đăng nhập sai quá nhiều lần' 
            });
        }

        // Update last active time
        user.lastActive = Date.now();
        await user.save();

        // Attach user info to request
        req.user = {
            userId: user._id,
            email: user.email,
            name: user.name,
            subscription: user.subscription
        };

        next();

    } catch (error) {
        logger.error(`Auth middleware error: ${error.message}`);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token không hợp lệ' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token đã hết hạn' 
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Lỗi xác thực' 
        });
    }
};

// Optional auth middleware (doesn't require token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.status === 'active') {
            req.user = {
                userId: user._id,
                email: user.email,
                name: user.name,
                subscription: user.subscription
            };
        }

        next();

    } catch (error) {
        // If optional auth fails, just continue without user
        next();
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'Yêu cầu đăng nhập' 
        });
    }

    // Check if user has admin role (you'd need to add role field to User model)
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false,
            message: 'Không có quyền truy cập' 
        });
    }

    next();
};

// Check subscription middleware
const checkSubscription = (requiredPlan = 'free') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Yêu cầu đăng nhập' 
            });
        }

        const planHierarchy = { free: 0, premium: 1, enterprise: 2 };
        const userPlanLevel = planHierarchy[req.user.subscription?.plan || 'free'];
        const requiredPlanLevel = planHierarchy[requiredPlan];

        if (userPlanLevel < requiredPlanLevel) {
            return res.status(403).json({ 
                success: false,
                message: `Tính năng này yêu cầu gói ${requiredPlan}` 
            });
        }

        next();
    };
};

module.exports = {
    auth: authMiddleware,
    optionalAuth,
    adminOnly,
    checkSubscription
};
