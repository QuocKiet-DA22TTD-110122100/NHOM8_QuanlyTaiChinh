const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Validation helper
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

const validateName = (name) => {
    return name && name.trim().length >= 2;
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
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
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

        // JWT với expiration
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '24h' // Token hết hạn sau 24 giờ
            }
        );

        logger.info(`User logged in: ${email}`);
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            expiresIn: '24h',
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

module.exports = router;
