const axios = require('axios');

// First get a token by login
async function test() {
  try {
    console.log('1. Testing dashboard stats endpoint...');
    
    // Login as admin to get token
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'dwight@example.com',
      password: 'password',
    });
    
    const token = loginRes.data.access_token;
    console.log('✅ Got token:', token.substring(0, 20) + '...');
    
    // Call dashboard stats
    const statsRes = await axios.get('http://localhost:3000/api/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log('\n✅ Dashboard stats response:');
    console.log(JSON.stringify(statsRes.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();
