const API_BASE_URL = 'http://localhost:5000';
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    VERIFY: '/api/v1/auth/verify'
  }
};

async function testLogin() {
  try {
    console.log('Testing login with test@example.com...');
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: '123456' })
    });

    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.success) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testRegister() {
  try {
    console.log('Testing register with newuser@example.com...');
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'newuser@example.com', 
        password: '123456', 
        name: 'New User' 
      })
    });

    const data = await response.json();
    console.log('Register response:', data);
    
    if (data.success) {
      console.log('✅ Register successful!');
    } else {
      console.log('❌ Register failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run tests
console.log('🧪 Testing Authentication API...\n');
testRegister().then(() => {
  console.log('\n---\n');
  testLogin();
}); 