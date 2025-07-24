// Basic test to verify Jest is working
describe('Basic Tests', () => {
  test('Jest is working', () => {
    expect(1 + 1).toBe(2);
  });

  test('Environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});