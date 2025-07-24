module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup-simple.js'],
    testMatch: [
        '**/__tests__/**/*.js',
        '**/?(*.)+(spec|test).js'
    ],
    moduleNameMapper: {
        '^../models/User$': '<rootDir>/tests/mocks/models.js',
        '^../models/Transaction$': '<rootDir>/tests/mocks/models.js',
        '^../models/Category$': '<rootDir>/tests/mocks/models.js',
        '^../models/Goal$': '<rootDir>/tests/mocks/models.js',
        '^../models/BankAccount$': '<rootDir>/tests/mocks/models.js',
        '^../models/Notification$': '<rootDir>/tests/mocks/models.js'
    },
    collectCoverageFrom: [
        'routes/**/*.js',
        'models/**/*.js',
        'middleware/**/*.js',
        'config/**/*.js',
        'services/**/*.js',
        '!**/node_modules/**',
        '!**/tests/**',
        '!**/coverage/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
    testTimeout: 10000,
    maxWorkers: 1,
    clearMocks: true,
    resetMocks: true
};
