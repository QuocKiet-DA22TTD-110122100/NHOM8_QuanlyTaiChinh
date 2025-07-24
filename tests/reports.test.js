const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

let app;
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/finance_app_test';

describe('Reports API', () => {
    let authToken;
    let userId;
    let categoryId;

    beforeAll(async () => {
        app = require('../app').app;
        await mongoose.connect(MONGODB_URI);
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Transaction.deleteMany({});
        await Category.deleteMany({});

        // Create test user
        const user = new User({
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User'
        });
        await user.save();
        userId = user._id;

        // Create test category
        const category = new Category({
            name: 'Food',
            user: userId,
            budget: { monthly: 1000000 }
        });
        await category.save();
        categoryId = category._id;

        authToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '24h' }
        );

        // Create test transactions
        const transactions = [
            {
                userId: userId,
                type: 'income',
                amount: 2000000,
                category: categoryId,
                description: 'Salary',
                date: new Date()
            },
            {
                userId: userId,
                type: 'expense',
                amount: 500000,
                category: categoryId,
                description: 'Groceries',
                date: new Date()
            }
        ];
        await Transaction.insertMany(transactions);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('GET /api/v1/reports/dashboard', () => {
        it('should return dashboard summary', async () => {
            const response = await request(app)
                .get('/api/v1/reports/dashboard')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('monthlyStats');
            expect(response.body.data).toHaveProperty('categoryStats');
            expect(response.body.data).toHaveProperty('recentTransactions');
        });

        it('should require authentication', async () => {
            await request(app)
                .get('/api/v1/reports/dashboard')
                .expect(401);
        });
    });

    describe('GET /api/v1/reports/export/excel', () => {
        it('should export Excel file', async () => {
            const response = await request(app)
                .get('/api/v1/reports/export/excel')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.headers['content-type']).toContain('spreadsheet');
            expect(response.headers['content-disposition']).toContain('attachment');
        });

        it('should filter by date range', async () => {
            const startDate = '2024-01-01';
            const endDate = '2024-12-31';

            const response = await request(app)
                .get(`/api/v1/reports/export/excel?startDate=${startDate}&endDate=${endDate}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.headers['content-type']).toContain('spreadsheet');
        });
    });

    describe('Performance Tests', () => {
        beforeEach(async () => {
            // Create large dataset for performance testing
            const transactions = Array.from({ length: 1000 }, (_, i) => ({
                userId: userId,
                type: i % 2 === 0 ? 'income' : 'expense',
                amount: Math.floor(Math.random() * 1000000),
                category: categoryId,
                description: `Transaction ${i}`,
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            }));
            await Transaction.insertMany(transactions);
        });

        it('should handle large dataset efficiently', async () => {
            const startTime = Date.now();
            
            const response = await request(app)
                .get('/api/v1/reports/dashboard')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
            expect(response.body.success).toBe(true);
        });
    });
});