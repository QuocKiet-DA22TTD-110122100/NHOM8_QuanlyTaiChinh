const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = '123456';
  const storedHash = '$2a$12$bLvKqCt8eB3ZC8z5gu6xw.Ha5lwqDJBHCy/oi0Oyu4zdV728txKai';
  
  console.log('Testing password validation...');
  console.log('Password:', password);
  console.log('Stored hash:', storedHash);
  
  const isValid = await bcrypt.compare(password, storedHash);
  console.log('Password validation result:', isValid ? 'PASSED' : 'FAILED');
  
  // Test creating new hash with salt rounds 12
  const newHash = await bcrypt.hash(password, 12);
  console.log('New hash (salt 12):', newHash);
  
  const isValidNew = await bcrypt.compare(password, newHash);
  console.log('New hash validation:', isValidNew ? 'PASSED' : 'FAILED');
}

testPassword(); 