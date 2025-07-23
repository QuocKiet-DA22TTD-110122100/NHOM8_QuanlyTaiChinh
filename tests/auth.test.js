const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// Test database
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/finance_app_test';

describe('Auth API', () => {
    beforeAll(async () => {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Đăng ký thành công');

            // Verify user was created in database
            const user = await User.findOne({ email: userData.email });
            expect(user).toBeTruthy();
            expect(user.name).toBe(userData.name);
        });

        it('should reject invalid email', async () => {
            const userData = {
                email: 'invalid-email',
                password: 'password123',
                name: 'Test User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email không hợp lệ');
        });

        it('should reject short password', async () => {
            const userData = {
                email: 'test@example.com',
                password: '123',
                name: 'Test User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Mật khẩu phải có ít nhất 6 ký tự');
        });

        it('should reject duplicate email', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            };

            // Create first user
            await request(app)
                .post('/api/auth/register')
                .send(userData);

            // Try to create second user with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Tài khoản đã tồn tại');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user
            const user = new User({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            });
            await user.save();
        });

        it('should login successfully with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Đăng nhập thành công');
            expect(response.body.token).toBeTruthy();
            expect(response.body.expiresIn).toBe('24h');
            expect(response.body.user).toBeTruthy();
            expect(response.body.user.email).toBe(loginData.email);
        });

        it('should reject invalid email', async () => {
            const loginData = {
                email: 'wrong@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Thông tin đăng nhập không chính xác');
        });

        it('should reject invalid password', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Thông tin đăng nhập không chính xác');
        });

        it('should reject malformed email', async () => {
            const loginData = {
                email: 'invalid-email',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email không hợp lệ');
        });
    });
});
