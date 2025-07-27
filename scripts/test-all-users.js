const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000';
const LOGIN_ENDPOINT = '/api/v1/auth/login';

const users = [
  { name: 'duy', email: 'duy@example.com', password: '123456' },
  { name: 'hoang', email: 'hoang@example.com', password: '123456' },
  { name: 'kha', email: 'kha@example.com', password: '123456' },
  { name: 'hung', email: 'hung@example.com', password: '123456' },
  { name: 'hao', email: 'hao@example.com', password: '123456' },
  { name: 'khanh', email: 'khanh@example.com', password: '123456' },
  { name: 'duy han', email: 'duyhan@example.com', password: '123456' },
  { name: 'ngan', email: 'ngan@example.com', password: '123456' },
  { name: 'phat', email: 'phat@example.com', password: '123456' },
  { name: 'trang', email: 'trang@example.com', password: '123456' },
  { name: 'tham', email: 'tham@example.com', password: '123456' }
];

async function testAllUsers() {
  console.log('🧪 Testing Login for All Users...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const user of users) {
    try {
      console.log(`Testing login for: ${user.name} (${user.email})`);
      
      const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          password: user.password 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ SUCCESS: ${user.name} - Token received`);
        successCount++;
      } else {
        console.log(`❌ FAILED: ${user.name} - ${data.message}`);
        failCount++;
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${user.name} - ${error.message}`);
      failCount++;
    }
    
    console.log('---');
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Successful logins: ${successCount}`);
  console.log(`❌ Failed logins: ${failCount}`);
  console.log(`📈 Success rate: ${((successCount / users.length) * 100).toFixed(1)}%`);
  
  if (successCount === users.length) {
    console.log('\n🎉 All users are working perfectly!');
  } else {
    console.log('\n⚠️ Some users have issues. Check the logs above.');
  }
}

testAllUsers(); 