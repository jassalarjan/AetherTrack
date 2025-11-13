import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testLogin() {
  console.log('🧪 Testing Login Endpoint...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'jassalarjansingh@gmail.com',
        password: 'waheguru'
      })
    });

    const data = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Login successful!');
      console.log('User:', data.user);
      console.log('Access Token:', data.accessToken ? '✓ Generated' : '✗ Missing');
      console.log('Refresh Token:', data.refreshToken ? '✓ Generated' : '✗ Missing');
    } else {
      console.log('\n❌ Login failed!');
      console.log('Error:', data.message || data.error);
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
    console.error('Make sure the backend server is running on port 5000');
  }
}

testLogin();
