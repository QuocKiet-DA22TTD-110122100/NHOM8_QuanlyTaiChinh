// Mock User model
const User = {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    deleteMany: jest.fn(),
    find: jest.fn(),
    updateOne: jest.fn(),
    constructor: jest.fn()
};

// Mock Transaction model
const Transaction = {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    deleteMany: jest.fn(),
    find: jest.fn(),
    updateOne: jest.fn(),
    aggregate: jest.fn(),
    constructor: jest.fn()
};

// Mock Category model
const Category = {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    deleteMany: jest.fn(),
    find: jest.fn(),
    updateOne: jest.fn(),
    constructor: jest.fn()
};

module.exports = {
    User,
    Transaction,
    Category
};


