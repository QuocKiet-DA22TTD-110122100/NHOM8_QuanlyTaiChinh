const request = require('supertest');

describe('Transactions API - Simple Tests', () => {
    let app;
    
    beforeAll(async () => {
        // Import simple server
        app = require('../server_simple');
    });

    it('should respond to health check', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.status).toBe('OK');
    });

    it('should handle transactions endpoint', async () => {
        const response = await request(app)
            .get('/api/transactions');

        // Chỉ kiểm tra endpoint tồn tại (không phải 404)
        expect(response.status).not.toBe(404);
        expect(response.body).toBeDefined();
    });
});

