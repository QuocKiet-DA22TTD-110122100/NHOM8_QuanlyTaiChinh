const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function createAdmin() {
  try {
    console.log('🔍 Creating admin user...');
    
    // Tạo admin user
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin User',
        email: 'admin2@example.com',
        password: 'admin123',
        role: 'admin'
      })
    });

    const registerData = await registerResponse.json();
    console.log('📋 Register response:', JSON.stringify(registerData, null, 2));

    if (registerData.success) {
      console.log('✅ Admin created successfully');
      console.log('👤 Admin data:', JSON.stringify(registerData.user, null, 2));
    } else {
      console.log('❌ Admin creation failed:', registerData.message);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

createAdmin(); 