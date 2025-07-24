describe('Module Imports', () => {
    test('express-validator can be imported', () => {
        const { body, validationResult } = require('express-validator');
        expect(body).toBeDefined();
        expect(validationResult).toBeDefined();
    });

    test('bcryptjs can be imported', () => {
        const bcrypt = require('bcryptjs');
        expect(bcrypt).toBeDefined();
        expect(bcrypt.hash).toBeDefined();
        expect(bcrypt.compare).toBeDefined();
    });

    test('jsonwebtoken can be imported', () => {
        const jwt = require('jsonwebtoken');
        expect(jwt).toBeDefined();
        expect(jwt.sign).toBeDefined();
        expect(jwt.verify).toBeDefined();
    });

    test('multer can be imported', () => {
        const multer = require('multer');
        expect(multer).toBeDefined();
    });

    test('redis can be imported', () => {
        const redis = require('redis');
        expect(redis).toBeDefined();
        expect(redis.createClient).toBeDefined();
    });
});