const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/finance_app_test';

describe('Transactions API', () => {
    let authToken;
    let userId;

    beforeAll(async () => {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Transaction.deleteMany({});

        // Create test user and get auth token
        const user = new User({
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User'
        });
        await user.save();
        userId = user._id;

        authToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '24h' }
        );
    });

    afterAll(async () => {
        await mongoose.connection.close();
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
                .send(transactionData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Tạo giao dịch thành công');
            expect(response.body.data.type).toBe(transactionData.type);
            expect(response.body.data.amount).toBe(transactionData.amount);
        });

        it('should reject transaction without auth token', async () => {
            const transactionData = {
                type: 'expense',
                amount: 50000,
                category: 'food'
            };

            await request(app)
                .post('/api/transactions')
                .send(transactionData)
                .expect(401);
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
                .send(transactionData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('Loại giao dịch không hợp lệ');
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
                .send(transactionData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('Số tiền phải lớn hơn 0');
        });
    });

    describe('GET /api/transactions', () => {
        beforeEach(async () => {
            // Create test transactions
            const transactions = [
                {
                    userId: userId,
                    type: 'income',
                    amount: 100000,
                    category: 'salary',
                    description: 'Monthly salary'
                },
                {
                    userId: userId,
                    type: 'expense',
                    amount: 50000,
                    category: 'food',
                    description: 'Grocery shopping'
                },
                {
                    userId: userId,
                    type: 'expense',
                    amount: 30000,
                    category: 'transport',
                    description: 'Bus ticket'
                }
            ];

            await Transaction.insertMany(transactions);
        });

        it('should get all user transactions', async () => {
            const response = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(3);
            expect(response.body.pagination.total).toBe(3);
        });

        it('should filter transactions by type', async () => {
            const response = await request(app)
                .get('/api/transactions?type=expense')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data.every(t => t.type === 'expense')).toBe(true);
        });

        it('should filter transactions by category', async () => {
            const response = await request(app)
                .get('/api/transactions?category=food')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].category).toBe('food');
        });

        it('should support pagination', async () => {
            const response = await request(app)
                .get('/api/transactions?page=1&limit=2')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(2);
            expect(response.body.pagination.pages).toBe(2);
        });
    });

    describe('GET /api/transactions/:id', () => {
        let transactionId;

        beforeEach(async () => {
            const transaction = new Transaction({
                userId: userId,
                type: 'expense',
                amount: 50000,
                category: 'food',
                description: 'Test transaction'
            });
            await transaction.save();
            transactionId = transaction._id;
        });

        it('should get transaction by id', async () => {
            const response = await request(app)
                .get(`/api/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(transactionId.toString());
        });

        it('should return 404 for non-existent transaction', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .get(`/api/transactions/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Không tìm thấy giao dịch');
        });
    });

    describe('PUT /api/transactions/:id', () => {
        let transactionId;

        beforeEach(async () => {
            const transaction = new Transaction({
                userId: userId,
                type: 'expense',
                amount: 50000,
                category: 'food',
                description: 'Test transaction'
            });
            await transaction.save();
            transactionId = transaction._id;
        });

        it('should update transaction successfully', async () => {
            const updateData = {
                amount: 75000,
                category: 'restaurant',
                description: 'Updated description'
            };

            const response = await request(app)
                .put(`/api/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.amount).toBe(updateData.amount);
            expect(response.body.data.category).toBe(updateData.category);
        });

        it('should return 404 for non-existent transaction', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .put(`/api/transactions/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ amount: 100000 })
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/transactions/:id', () => {
        let transactionId;

        beforeEach(async () => {
            const transaction = new Transaction({
                userId: userId,
                type: 'expense',
                amount: 50000,
                category: 'food',
                description: 'Test transaction'
            });
            await transaction.save();
            transactionId = transaction._id;
        });

        it('should delete transaction successfully', async () => {
            const response = await request(app)
                .delete(`/api/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Xóa giao dịch thành công');

            // Verify transaction was deleted
            const deletedTransaction = await Transaction.findById(transactionId);
            expect(deletedTransaction).toBeNull();
        });

        it('should return 404 for non-existent transaction', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .delete(`/api/transactions/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/transactions/bulk', () => {
        it('should create multiple transactions', async () => {
            const transactionsData = {
                transactions: [
                    {
                        type: 'income',
                        amount: 100000,
                        category: 'salary'
                    },
                    {
                        type: 'expense',
                        amount: 50000,
                        category: 'food'
                    }
                ]
            };

            const response = await request(app)
                .post('/api/transactions/bulk')
                .set('Authorization', `Bearer ${authToken}`)
                .send(transactionsData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.message).toBe('Tạo thành công 2 giao dịch');
        });

        it('should reject bulk creation with validation errors', async () => {
            const transactionsData = {
                transactions: [
                    {
                        type: 'invalid',
                        amount: -1000,
                        category: 'food'
                    }
                ]
            };

            const response = await request(app)
                .post('/api/transactions/bulk')
                .set('Authorization', `Bearer ${authToken}`)
                .send(transactionsData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.validationErrors).toBeTruthy();
        });
    });
});
