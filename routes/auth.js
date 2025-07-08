const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User');
const logger = require('../config/logger');

// Enhanced validation helpers
const validateEmail = (email) => {
    return validator.isEmail(email);
};

const validatePassword = (password) => {
    // Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 số và 1 ký tự đặc biệt
    return password && 
           password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[0-9]/.test(password) && 
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

const validateName = (name) => {
    return name && name.trim().length >= 2 && name.trim().length <= 50;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email người dùng
 *           example: john@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Mật khẩu (tối thiểu 6 ký tự)
 *           example: password123
 *         name:
 *           type: string
 *           minLength: 2
 *           description: Tên đầy đủ
 *           example: John Doe
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email người dùng
 *           example: john@example.com
 *         password:
 *           type: string
 *           description: Mật khẩu
 *           example: password123
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             name:
 *               type: string
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Tài khoản đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin (email, password, name)'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 số và 1 ký tự đặc biệt'
            });
        }

        if (!validateName(name)) {
            return res.status(400).json({
                success: false,
                message: 'Tên phải có ít nhất 2 ký tự'
            });
        }

        // Kiểm tra user đã tồn tại
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            logger.warn(`Attempted to register with existing email: ${email}`);
            return res.status(409).json({
                success: false,
                message: 'Tài khoản đã tồn tại'
            });
        }

        const user = new User({ email, password, name });
        await user.save();

        logger.info(`New user registered: ${email}`);
        res.json({
            success: true,
            message: 'Đăng ký thành công'
        });
    } catch (error) {
        logger.error(`Registration error: ${error.message}`);
        res.status(400).json({
            success: false,
            message: 'Lỗi đăng ký: ' + error.message
        });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Thông tin đăng nhập không chính xác
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            logger.warn(`Failed login attempt for email: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Thông tin đăng nhập không chính xác'
            });
        }

        // JWT với expiration (access token)
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '15m' // Access token hết hạn sau 15 phút
            }
        );

        // Refresh token với thời hạn dài hơn
        const refreshToken = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
            {
                expiresIn: '7d' // Refresh token hết hạn sau 7 ngày
            }
        );

        // Cập nhật thông tin đăng nhập
        user.updateLastLogin();
        await user.save();

        logger.info(`User logged in: ${email}`);
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            refreshToken,
            expiresIn: '15m',
            refreshExpiresIn: '7d',
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        res.status(400).json({
            success: false,
            message: 'Lỗi đăng nhập: ' + error.message
        });
    }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Làm mới access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token được cấp khi đăng nhập
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token mới được cấp thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: Access token mới
 *                 expiresIn:
 *                   type: string
 *                   example: 15m
 *       401:
 *         description: Refresh token không hợp lệ hoặc đã hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token không được cung cấp'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken, 
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
        );

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

        if (user.isAccountLocked) {
            return res.status(423).json({
                success: false,
                message: 'Tài khoản đã bị khóa tạm thời'
            });
        }

        // Generate new access token
        const newToken = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '15m'
            }
        );

        // Update last active time
        user.lastActive = Date.now();
        await user.save();

        logger.info(`Token refreshed for user: ${user.email}`);

        res.json({
            success: true,
            token: newToken,
            expiresIn: '15m',
            message: 'Token đã được làm mới thành công'
        });

    } catch (error) {
        logger.error(`Refresh token error: ${error.message}`);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token không hợp lệ'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token đã hết hạn. Vui lòng đăng nhập lại'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi làm mới token'
        });
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/logout', async (req, res) => {
    try {
        // In a more advanced implementation, you would:
        // 1. Add the token to a blacklist
        // 2. Clear refresh token from database
        // 3. Log the logout event

        logger.info(`User logged out`);

        res.json({
            success: true,
            message: 'Đăng xuất thành công'
        });

    } catch (error) {
        logger.error(`Logout error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi đăng xuất'
        });
    }
});

module.exports = router;
