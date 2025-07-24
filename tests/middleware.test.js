describe('Middleware Mocks', () => {
    test('express-mongo-sanitize can be imported', () => {
        const mongoSanitize = require('express-mongo-sanitize');
        expect(mongoSanitize).toBeDefined();
        expect(typeof mongoSanitize()).toBe('function');
    });

    test('xss-clean can be imported', () => {
        const xss = require('xss-clean');
        expect(xss).toBeDefined();
        expect(typeof xss()).toBe('function');
    });

    test('hpp can be imported', () => {
        const hpp = require('hpp');
        expect(hpp).toBeDefined();
        expect(typeof hpp()).toBe('function');
    });

    test('helmet can be imported', () => {
        const helmet = require('helmet');
        expect(helmet).toBeDefined();
        expect(typeof helmet()).toBe('function');
    });

    test('compression can be imported', () => {
        const compression = require('compression');
        expect(compression).toBeDefined();
        expect(typeof compression()).toBe('function');
    });

    test('morgan can be imported', () => {
        const morgan = require('morgan');
        expect(morgan).toBeDefined();
        expect(typeof morgan()).toBe('function');
    });

    test('cors can be imported', () => {
        const cors = require('cors');
        expect(cors).toBeDefined();
        expect(typeof cors()).toBe('function');
    });
});
