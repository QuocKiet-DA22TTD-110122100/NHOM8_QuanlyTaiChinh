const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = '123456';
  const storedHash = '$2a$12$1xhaHrQF6Hkw7QzjrokHF.QOINwqcNMn4oW3ZmGzTFT.ftnz6P3GS';
  
  console.log('Testing password validation...');
  console.log('Password:', password);
  console.log('Stored hash:', storedHash);
  
  const isValid = await bcrypt.compare(password, storedHash);
  console.log('Password validation result:', isValid ? 'PASSED' : 'FAILED');
  
  // Test creating new hash
  const newHash = await bcrypt.hash(password, 12);
  console.log('New hash:', newHash);
  
  const isValidNew = await bcrypt.compare(password, newHash);
  console.log('New hash validation:', isValidNew ? 'PASSED' : 'FAILED');
}

testPassword(); 