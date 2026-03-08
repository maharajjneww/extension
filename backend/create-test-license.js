// Create a test license with proper expiry date
const API_URL = 'http://localhost:3000';

async function createLicense() {
  console.log('Creating test license...\n');
  
  // Create license with expiry date far in the future
  const response = await fetch(`${API_URL}/api/admin/create-license`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminPassword: 'your-secure-admin-password-here',
      licenseKey: 'QUIZ-TEST-2024',
      email: 'test@example.com',
      plan: 'Premium',
      expiryDate: '2026-12-31' // Far future date
    })
  });
  
  const data = await response.json();
  console.log('Response:', data);
  
  // Now verify it
  console.log('\nVerifying license...');
  const verifyResponse = await fetch(`${API_URL}/api/verify-license`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseKey: 'QUIZ-TEST-2024' })
  });
  
  const verifyData = await verifyResponse.json();
  console.log('Verification result:', verifyData);
  
  if (verifyData.valid) {
    console.log('\n✅ SUCCESS! License is ready to use!');
    console.log('License Key: QUIZ-TEST-2024');
  } else {
    console.log('\n❌ License verification failed:', verifyData.message);
  }
}

createLicense();
