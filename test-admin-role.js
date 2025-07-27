const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function testAdminRole() {
  try {
    console.log('🔍 Testing admin login...');
    
    // Test login với admin
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin2@example.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('📋 Login response:', JSON.stringify(loginData, null, 2));

    if (loginData.success) {
      console.log('✅ Login successful');
      console.log('👤 User data:', JSON.stringify(loginData.user, null, 2));
      console.log('🔑 Role:', loginData.user?.role);
      console.log('📝 Token:', loginData.token ? 'Present' : 'Missing');
    } else {
      console.log('❌ Login failed:', loginData.message);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testAdminRole(); 