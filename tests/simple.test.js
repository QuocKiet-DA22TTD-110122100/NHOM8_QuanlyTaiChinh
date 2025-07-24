describe('Simple Tests', () => {
    test('Jest is working', () => {
        expect(1 + 1).toBe(2);
    });

    test('Environment variables are set', () => {
        expect(process.env.NODE_ENV).toBe('test');
        expect(process.env.JWT_SECRET).toBe('test-jwt-secret');
    });

    test('Mocks are working', () => {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ userId: '123' }, 'secret');
        expect(token).toBe('mock-jwt-token');
    });

    test('bcrypt mock works', async () => {
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash('password', 10);
        expect(hash).toBe('hashed-password'); // Đổi thành 'hashed-password'
        
        const isValid = await bcrypt.compare('password', hash);
        expect(isValid).toBe(true);
    });
});


