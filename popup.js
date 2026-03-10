// Browser compatibility
if (typeof browser === 'undefined') {
  var browser = chrome;
}

// Your backend API URL
const API_URL = 'https://extension-kiek.onrender.com'; // Backend server URL

// Generate unique device ID
async function getDeviceId() {
  let deviceId = await chrome.storage.local.get('deviceId');
  
  if (!deviceId.deviceId) {
    // Generate new device ID based on browser fingerprint
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width + 'x' + screen.height,
      navigator.hardwareConcurrency || 'unknown'
    ].join('|');
    
    // Create hash of fingerprint
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    deviceId.deviceId = hashHex.substring(0, 32);
    await chrome.storage.local.set({ deviceId: deviceId.deviceId });
  }
  
  return deviceId.deviceId;
}

// Get device info
function getDeviceInfo() {
  return `${navigator.platform} - ${navigator.userAgent.substring(0, 50)}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const isLoggedIn = await checkLoginStatus();
  
  if (isLoggedIn) {
    showDashboard();
  } else {
    showLogin();
  }
  
  // Purchase button event listener
  const purchaseBtn = document.getElementById('purchaseBtn');
  if (purchaseBtn) {
    purchaseBtn.addEventListener('click', () => {
      window.open('https://extension-kiek.onrender.com/purchase', '_blank');
    });
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
  
  // Get device ID
  const deviceId = await getDeviceId();
  const deviceInfo = getDeviceInfo();
  
  // Call backend API via background worker to verify license
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'loginWithLicense',
      licenseKey: licenseKey,
      deviceId: deviceId,
      deviceInfo: deviceInfo
    });
    
    if (result && result.valid) {
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
  
  // Verify with server via background worker
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'verifyLicense',
      licenseKey: data.licenseKey
    });
    
    if (!result || !result.valid) {
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
