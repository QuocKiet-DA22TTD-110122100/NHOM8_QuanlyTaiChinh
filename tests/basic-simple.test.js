describe('Basic Simple Tests', () => {
    test('Jest is working', () => {
        expect(1 + 1).toBe(2);
    });

    test('Environment variables are set', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });

    test('Mocks are working', () => {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ userId: '123' }, 'secret');
        expect(token).toBe('mock-jwt-token');
    });
});