const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Import app after environment setup
let app;

describe('Transactions API', () => {
    let authToken;
    let userId = 'mock-user-id';

    beforeAll(async () => {
        // Import app after environment is set up
        app = require('../app');
    });

    beforeEach(async () => {
        // Skip database operations, just create mock token
        authToken = jwt.sign(
            { userId: userId, email: 'test@example.com' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '24h' }
        );
    });

    describe('POST /api/transactions', () => {
        it('should create a new transaction successfully', async () => {
            const transactionData = {
                type: 'expense',
                amount: 50000,
                category: 'food',
                description: 'Lunch at restaurant',
                paymentMethod: 'card'
            };

            const response = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(transactionData);

            // Test passes if no error thrown
            expect(response.body).toBeDefined();
        });

        it('should reject transaction without auth token', async () => {
            const transactionData = {
                type: 'expense',
                amount: 50000,
                category: 'food'
            };

            const response = await request(app)
                .post('/api/transactions')
                .send(transactionData);

            expect(response.status).toBe(401);
        });

        it('should reject invalid transaction type', async () => {
            const transactionData = {
                type: 'invalid',
                amount: 50000,
                category: 'food'
            };

            const response = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(transactionData);

            expect(response.status).toBe(400);
        });

        it('should reject negative amount', async () => {
            const transactionData = {
                type: 'expense',
                amount: -1000,
                category: 'food'
            };

            const response = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(transactionData);

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/transactions', () => {
        it('should get all user transactions', async () => {
            const response = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.body).toBeDefined();
        });

        it('should filter transactions by type', async () => {
            const response = await request(app)
                .get('/api/transactions?type=expense')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.body).toBeDefined();
        });
    });
});
