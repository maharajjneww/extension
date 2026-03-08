// Fix the test license
const API_URL = 'http://localhost:3000';
const ADMIN_PASSWORD = 'your-secure-admin-password-here';

async function fixLicense() {
  console.log('🔧 Fixing test license...\n');
  
  // Step 1: Delete the old license
  console.log('1️⃣ Deleting old license...');
  const deleteResponse = await fetch(`${API_URL}/api/admin/delete-license`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminPassword: ADMIN_PASSWORD,
      licenseKey: 'QUIZ-TEST-2024'
    })
  });
  
  const deleteData = await deleteResponse.json();
  console.log('   ', deleteData.message);
  
  // Step 2: Create new license with no expiry (lifetime)
  console.log('\n2️⃣ Creating new lifetime license...');
  const createResponse = await fetch(`${API_URL}/api/admin/create-license`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminPassword: ADMIN_PASSWORD,
      licenseKey: 'QUIZ-TEST-2024',
      email: 'test@example.com',
      plan: 'Lifetime',
      expiryDate: null // No expiry
    })
  });
  
  const createData = await createResponse.json();
  console.log('   ', createData.message);
  
  // Step 3: Verify it works
  console.log('\n3️⃣ Verifying license...');
  const verifyResponse = await fetch(`${API_URL}/api/verify-license`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseKey: 'QUIZ-TEST-2024' })
  });
  
  const verifyData = await verifyResponse.json();
  
  if (verifyData.valid) {
    console.log('   ✅ License is valid!');
    console.log('   Email:', verifyData.email);
    console.log('   Plan:', verifyData.plan);
    console.log('   Expiry:', verifyData.expiryDate || 'Never (Lifetime)');
    console.log('\n✅ SUCCESS! You can now login with: QUIZ-TEST-2024');
  } else {
    console.log('   ❌ Still not working:', verifyData.message);
  }
}

fixLicense().catch(err => console.error('Error:', err));
