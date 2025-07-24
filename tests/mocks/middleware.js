// Mock middleware function
const mockMiddleware = (req, res, next) => next();

module.exports = jest.fn(() => mockMiddleware);