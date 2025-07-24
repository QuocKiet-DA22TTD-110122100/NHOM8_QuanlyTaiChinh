describe('Winston Logger', () => {
    test('winston can be imported', () => {
        const winston = require('winston');
        expect(winston).toBeDefined();
        expect(winston.createLogger).toBeDefined();
    });

    test('logger has required methods', () => {
        const winston = require('winston');
        const logger = winston.createLogger();
        expect(logger.add).toBeDefined();
        expect(logger.info).toBeDefined();
        expect(logger.error).toBeDefined();
    });

    test('config logger can be imported', () => {
        // This should not throw an error
        expect(() => {
            require('../config/logger');
        }).not.toThrow();
    });
});