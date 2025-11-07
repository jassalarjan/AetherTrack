import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 5001}/api`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

let authToken = null;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Running API smoke tests...\n');
  
  // Test 1: Health check
  await test('Server is running', async () => {
    const response = await axios.get(`http://localhost:${process.env.PORT || 5001}/`);
    if (!response.data) throw new Error('No response');
  });

  // Test 2: Login with admin
  await test('Admin login', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    if (!response.data.accessToken) throw new Error('No access token');
    authToken = response.data.accessToken;
  });

  if (!authToken) {
    console.error('\n⚠️  Cannot continue tests without auth token');
    process.exit(1);
  }

  const headers = { Authorization: `Bearer ${authToken}` };

  // Test 3: Get user profile
  await test('Get user profile', async () => {
    const response = await axios.get(`${BASE_URL}/auth/profile`, { headers });
    if (response.data.role !== 'admin') throw new Error('Not admin role');
  });

  // Test 4: List users
  await test('List users', async () => {
    const response = await axios.get(`${BASE_URL}/users`, { headers });
    if (!Array.isArray(response.data)) throw new Error('Not an array');
  });

  // Test 5: List teams
  await test('List teams', async () => {
    const response = await axios.get(`${BASE_URL}/teams`, { headers });
    if (!Array.isArray(response.data)) throw new Error('Not an array');
  });

  // Test 6: List tasks
  await test('List tasks', async () => {
    const response = await axios.get(`${BASE_URL}/tasks`, { headers });
    if (!Array.isArray(response.data)) throw new Error('Not an array');
  });

  console.log('\n✅ All smoke tests passed!');
  console.log('\n🎉 Your new database is working correctly!');
  console.log('\nAdmin credentials:');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('\n⚠️  Remember to change the admin password after first login!');
}

runTests().catch(error => {
  console.error('\n💥 Test suite failed:', error.message);
  process.exit(1);
});
