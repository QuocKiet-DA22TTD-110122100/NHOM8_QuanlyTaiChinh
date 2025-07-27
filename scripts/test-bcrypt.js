const bcrypt = require('bcryptjs');

async function testBcrypt() {
  console.log('=== TESTING BCRYPT ===');
  
  const password = '123456';
  
  // Test with different salt rounds
  for (let rounds = 10; rounds <= 12; rounds++) {
    console.log(`\nTesting with ${rounds} salt rounds:`);
    
    const hash = await bcrypt.hash(password, rounds);
    console.log('Hash:', hash);
    
    const isValid = await bcrypt.compare(password, hash);
    console.log('Validation:', isValid ? 'PASSED' : 'FAILED');
  }
  
  // Test with specific hash from database
  const dbHash = '$2a$12$QwN4LRLclIw85...'; // This is from our debug output
  console.log('\nTesting with database hash pattern...');
  
  const testHash = await bcrypt.hash(password, 12);
  console.log('New hash:', testHash);
  
  const isValidDb = await bcrypt.compare(password, testHash);
  console.log('Database pattern validation:', isValidDb ? 'PASSED' : 'FAILED');
}

testBcrypt(); 