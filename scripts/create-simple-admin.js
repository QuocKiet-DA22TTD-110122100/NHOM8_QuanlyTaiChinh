const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000';
const REGISTER_ENDPOINT = '/api/v1/auth/register';

const names = [
  'duy', 'hoang', 'kha', 'hung', 'hao', 'khanh', 'duy han', 'ngan', 'phat', 'trang', 'tham'
];

async function createUsers() {
  for (const name of names) {
    const email = `${name.replace(/\s+/g, '').toLowerCase()}@example.com`;
    const password = '123456';
    const body = { email, password, name };
    try {
      const res = await fetch(`${API_BASE_URL}${REGISTER_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        console.log(`✅ Created user: ${name} (${email})`);
      } else {
        console.log(`❌ Failed to create user: ${name} (${email}) - ${data.message}`);
      }
    } catch (err) {
      console.log(`❌ Error creating user: ${name} (${email}) - ${err.message}`);
    }
  }
}

createUsers(); 