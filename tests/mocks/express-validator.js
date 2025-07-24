// Mock express-validator for testing
const mockValidationResult = {
  isEmpty: () => true,
  array: () => []
};

const mockBody = (field) => ({
  trim: () => mockBody(field),
  isLength: () => mockBody(field),
  isEmail: () => mockBody(field),
  normalizeEmail: () => mockBody(field),
  exists: () => mockBody(field)
});

module.exports = {
  body: mockBody,
  validationResult: () => mockValidationResult
};