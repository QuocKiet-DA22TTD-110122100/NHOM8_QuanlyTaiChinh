const multer = jest.fn(() => ({
  single: jest.fn(() => (req, res, next) => next()),
  array: jest.fn(() => (req, res, next) => next()),
  fields: jest.fn(() => (req, res, next) => next())
}));

multer.diskStorage = jest.fn(() => ({}));
multer.memoryStorage = jest.fn(() => ({}));

module.exports = multer;