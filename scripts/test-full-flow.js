const API_BASE_URL = 'http://localhost:5000';
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register'
  }
};

async function testFullFlow() {
  console.log('🧪 Testing Full Registration -> Login Flow...\n');
  
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = '123456';
  const testName = 'Test User';
  
  console.log('📧 Test credentials:');
  console.log('Email:', testEmail);
  console.log('Password:', testPassword);
  console.log('Name:', testName);
  console.log('');
  
  // Step 1: Register
  console.log('1️⃣ Registering new user...');
  try {
    const registerResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail, 
        password: testPassword, 
        name: testName 
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);
    
    if (!registerData.success) {
      console.log('❌ Registration failed!');
      return;
    }
    
    console.log('✅ Registration successful!');
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    return;
  }
  
  console.log('');
  
  // Step 2: Login immediately after register
  console.log('2️⃣ Logging in with same credentials...');
  try {
    const loginResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail, 
        password: testPassword 
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success) {
      console.log('✅ Login successful!');
      console.log('Token:', loginData.token ? 'Received' : 'Missing');
      console.log('User ID:', loginData.user?.id);
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
  }
  
  console.log('');
  
  // Step 3: Try login with wrong password
  console.log('3️⃣ Testing login with wrong password...');
  try {
    const wrongLoginResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail, 
        password: 'wrongpassword' 
      })
    });
    
    const wrongLoginData = await wrongLoginResponse.json();
    console.log('Wrong password login response:', wrongLoginData);
    
    if (!wrongLoginData.success) {
      console.log('✅ Correctly rejected wrong password');
    } else {
      console.log('❌ Should have rejected wrong password');
    }
  } catch (error) {
    console.error('❌ Wrong password test error:', error.message);
  }
}

testFullFlow(); 