// Your backend API URL
const API_URL = 'https://extension-kiek.onrender.com'; // Backend server URL

document.addEventListener('DOMContentLoaded', async () => {
  const isLoggedIn = await checkLoginStatus();
  
  if (isLoggedIn) {
    showDashboard();
  } else {
    showLogin();
  }
});

// Login button
document.getElementById('loginBtn').addEventListener('click', async () => {
  const licenseKey = document.getElementById('licenseKey').value.trim();
  const statusDiv = document.getElementById('loginStatus');
  
  if (!licenseKey) {
    showStatus(statusDiv, 'Please enter a license key', 'error');
    return;
  }
  
  // Call your backend API to verify license
  try {
    const response = await fetch(`${API_URL}/api/verify-license`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ licenseKey: licenseKey })
    });
    
    const result = await response.json();
    
    if (response.ok && result.valid) {
      // Save login info with verification timestamp
      await chrome.storage.sync.set({
        isLoggedIn: true,
        licenseKey: licenseKey,
        userEmail: result.email,
        plan: result.plan,
        expiryDate: result.expiryDate,
        loginDate: new Date().toISOString(),
        lastVerified: Date.now() // Add verification timestamp
      });
      
      showStatus(statusDiv, 'Login successful!', 'success');
      setTimeout(() => {
        showDashboard();
      }, 1000);
    } else {
      showStatus(statusDiv, result.message || 'Invalid license key', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showStatus(statusDiv, 'Connection error. Please try again.', 'error');
  }
});

// Logout button
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await chrome.storage.sync.clear();
  showLogin();
});

async function checkLoginStatus() {
  const data = await chrome.storage.sync.get(['isLoggedIn', 'licenseKey']);
  
  if (!data.isLoggedIn || !data.licenseKey) {
    return false;
  }
  
  // Verify with server that license is still valid
  try {
    const response = await fetch(`${API_URL}/api/verify-license`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ licenseKey: data.licenseKey })
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.valid) {
      // License is no longer valid, logout
      await chrome.storage.sync.clear();
      return false;
    }
    
    // Update stored info in case it changed
    await chrome.storage.sync.set({
      userEmail: result.email,
      plan: result.plan,
      expiryDate: result.expiryDate
    });
    
    return true;
  } catch (error) {
    console.error('Verification error:', error);
    // If server is down, allow offline use for now
    return true;
  }
}

function showLogin() {
  document.getElementById('loginScreen').classList.add('active');
  document.getElementById('dashboardScreen').classList.remove('active');
  document.getElementById('licenseKey').value = '';
  document.getElementById('loginStatus').textContent = '';
}

async function showDashboard() {
  const data = await chrome.storage.sync.get(['userEmail', 'plan', 'expiryDate']);
  
  document.getElementById('userEmail').textContent = data.userEmail || 'Unknown';
  document.getElementById('userPlan').textContent = data.plan || 'Unknown';
  
  if (data.expiryDate) {
    const daysLeft = getDaysRemaining(data.expiryDate);
    document.getElementById('expiryInfo').textContent = `Expires: ${data.expiryDate} (${daysLeft} days left)`;
    
    if (daysLeft <= 7) {
      document.getElementById('expiryInfo').style.color = '#d32f2f';
      document.getElementById('expiryInfo').style.fontWeight = 'bold';
    }
  } else {
    document.getElementById('expiryInfo').textContent = 'Expires: Never (Lifetime)';
  }
  
  document.getElementById('loginScreen').classList.remove('active');
  document.getElementById('dashboardScreen').classList.add('active');
}

function getDaysRemaining(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status ${type}`;
}
