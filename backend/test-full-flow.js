// Test script to verify backend is working and create a test license
const API_URL = 'http://localhost:3000';

async function testBackend() {
  console.log('🧪 Testing Backend API...\n');
  
  // Test 1: Check if server is running
  console.log('1️⃣ Testing server health...');
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log('✅ Server is running:', data.status);
  } catch (error) {
    console.error('❌ Server is not running! Please start it with: npm start');
    console.error('Error:', error.message);
    return;
  }
  
  // Test 2: Create a test license
  console.log('\n2️⃣ Creating test license...');
  try {
    const response = await fetch(`${API_URL}/api/admin/create-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminPassword: 'your-secure-admin-password-here',
        licenseKey: 'QUIZ-TEST-2024',
        email: 'test@example.com',
        plan: 'Premium',
        expiryDate: '2025-12-31'
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Test license created successfully!');
      console.log('   License Key: QUIZ-TEST-2024');
      console.log('   Email: test@example.com');
    } else {
      console.log('⚠️  License might already exist:', data.message);
    }
  } catch (error) {
    console.error('❌ Error creating license:', error.message);
  }
  
  // Test 3: Verify the license
  console.log('\n3️⃣ Verifying test license...');
  try {
    const response = await fetch(`${API_URL}/api/verify-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: 'QUIZ-TEST-2024' })
    });
    
    const data = await response.json();
    if (data.valid) {
      console.log('✅ License verification successful!');
      console.log('   Email:', data.email);
      console.log('   Plan:', data.plan);
      console.log('   Expiry:', data.expiryDate);
    } else {
      console.log('❌ License verification failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error verifying license:', error.message);
  }
  
  // Test 4: Test invalid license
  console.log('\n4️⃣ Testing invalid license...');
  try {
    const response = await fetch(`${API_URL}/api/verify-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: 'INVALID-KEY' })
    });
    
    const data = await response.json();
    if (!data.valid) {
      console.log('✅ Invalid license correctly rejected:', data.message);
    } else {
      console.log('❌ Invalid license was accepted (this is wrong!)');
    }
  } catch (error) {
    console.error('❌ Error testing invalid license:', error.message);
  }
  
  console.log('\n✅ All tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Reload your extension in chrome://extensions/');
  console.log('2. Click the extension icon');
  console.log('3. Login with: QUIZ-TEST-2024');
  console.log('4. Try selecting text on any webpage');
}

testBackend();
