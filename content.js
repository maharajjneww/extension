// Browser compatibility
if (typeof browser === 'undefined') {
  var browser = chrome;
}

let answerBox = null;
let lastQuestion = '';
let lastAnswer = '';
let extensionPaused = false;
let keySequence = '';
let hideTimer = null;

// Create minimal floating answer box with transparent background
function createAnswerBox() {
  if (answerBox) return answerBox;
  
  answerBox = document.createElement('div');
  answerBox.id = 'quiz-answer-box';
  answerBox.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 16px;
    z-index: 2147483647;
    display: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    font-weight: 600;
    width: auto;
    pointer-events: none;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  `;
  document.body.appendChild(answerBox);
  return answerBox;
}

function showAnswer(text) {
  const box = createAnswerBox();
  box.textContent = text;
  box.style.display = 'block';
  lastAnswer = text;
  
  // Clear any existing timer
  if (hideTimer) {
    clearTimeout(hideTimer);
  }
  
  // Auto-hide after 5 seconds
  hideTimer = setTimeout(() => {
    hideAnswer();
  }, 5000);
}

function hideAnswer() {
  if (answerBox) {
    answerBox.style.display = 'none';
    lastAnswer = '';
  }
  
  // Clear timer
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

async function checkLogin() {
  const data = await chrome.storage.sync.get(['isLoggedIn', 'licenseKey', 'lastVerified']);
  
  // Not logged in
  if (!data.isLoggedIn || !data.licenseKey) {
    return { valid: false, message: 'Please login first' };
  }
  
  // Get device ID
  let deviceData = await chrome.storage.local.get('deviceId');
  const deviceId = deviceData.deviceId || null;
  
  // Check if last verification was recent (15 minutes)
  const now = Date.now();
  const lastVerified = data.lastVerified || 0;
  const minutesSinceVerification = (now - lastVerified) / (1000 * 60);
  
  // Only verify with server if more than 15 minutes since last check
  // This reduces network calls during exam/active use
  if (minutesSinceVerification < 15) {
    console.log(`License verified recently (${minutesSinceVerification.toFixed(1)} min ago), skipping server check`);
    return { valid: true };
  }
  
  // Verify with server via background script
  try {
    console.log('Checking license with server via background...');
    const result = await chrome.runtime.sendMessage({
      action: 'verifyLicense',
      licenseKey: data.licenseKey,
      deviceId: deviceId,
      deviceInfo: navigator.userAgent.substring(0, 50)
    });
    
    console.log('Verification result:', result);
    
    if (!result || !result.valid) {
      // License is no longer valid, logout
      console.log('License invalid, logging out...');
      await chrome.storage.sync.clear();
      return { valid: false, message: result?.message || 'License invalid' };
    }
    
    // Update last verified timestamp
    console.log('License valid, updating timestamp');
    await chrome.storage.sync.set({ lastVerified: now });
    
    return { valid: true };
  } catch (error) {
    console.error('Verification error:', error);
    
    // If server is unreachable, check how long since last verification
    if (minutesSinceVerification > 60) {
      // Haven't verified in 60 minutes, require online verification
      await chrome.storage.sync.clear();
      return { valid: false, message: 'Verification required - Please connect to internet' };
    }
    
    // Server is unreachable but verified recently - allow grace period
    console.log(`Server unreachable, allowing offline use (last verified ${minutesSinceVerification.toFixed(1)} minutes ago)`);
    return { valid: true };
  }
}

// Monitor selection changes - hide answer when text is deselected
document.addEventListener('selectionchange', () => {
  const selectedText = window.getSelection().toString().trim();
  
  // If no text selected and answer is showing, hide it
  if (selectedText.length === 0 && lastAnswer) {
    hideAnswer();
    lastQuestion = '';
  }
});

// Click anywhere to hide answer
document.addEventListener('click', () => {
  if (answerBox && answerBox.style.display === 'block') {
    hideAnswer();
  }
});

// Keyboard shortcut listener for pause/resume
document.addEventListener('keydown', (e) => {
  // Build key sequence
  keySequence += e.key;
  
  // Keep only last 2 characters
  if (keySequence.length > 2) {
    keySequence = keySequence.slice(-2);
  }
  
  // Check for pause code: 45
  if (keySequence === '45') {
    extensionPaused = true;
    keySequence = '';
    console.log('Extension PAUSED');
    
    // Show small pause notification in right corner
    const pauseNotif = document.createElement('div');
    pauseNotif.textContent = '⏸';
    pauseNotif.style.cssText = `
      position: fixed;
      top: 10px;
      right: 50px;
      background: rgba(255, 255, 255, 0.9);
      color: #ff4444;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 10px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-weight: 600;
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 68, 68, 0.3);
    `;
    document.body.appendChild(pauseNotif);
    setTimeout(() => pauseNotif.remove(), 2000);
    
    hideAnswer();
  }
  
  // Check for resume code: 54
  if (keySequence === '54') {
    extensionPaused = false;
    keySequence = '';
    console.log('Extension RESUMED');
    
    // Show small resume notification in right corner
    const resumeNotif = document.createElement('div');
    resumeNotif.textContent = '▶';
    resumeNotif.style.cssText = `
      position: fixed;
      top: 10px;
      right: 50px;
      background: rgba(255, 255, 255, 0.9);
      color: #44ff44;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 10px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-weight: 600;
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      border: 1px solid rgba(68, 255, 68, 0.3);
    `;
    document.body.appendChild(resumeNotif);
    setTimeout(() => resumeNotif.remove(), 2000);
  }
  
  // Reset sequence after 2 seconds of inactivity
  setTimeout(() => {
    keySequence = '';
  }, 2000);
});

// Handle text selection
document.addEventListener('mouseup', async () => {
  // Check if extension is paused
  if (extensionPaused) {
    console.log('Extension is paused, ignoring selection');
    return;
  }
  
  const selectedText = window.getSelection().toString().trim();
  
  // Only trigger if text is selected
  if (selectedText.length > 0) {
    console.log('Selected text:', selectedText);
    console.log('Last question:', lastQuestion);
    console.log('Last answer:', lastAnswer);
    
    // Check if same question - avoid duplicate API calls
    if (selectedText === lastQuestion && lastAnswer) {
      console.log('Using cached answer:', lastAnswer);
      showAnswer(lastAnswer);
      return;
    }
    
    // New question - clear cache and get fresh answer
    lastQuestion = selectedText;
    lastAnswer = '';
    
    // Check login status
    const loginStatus = await checkLogin();
    if (!loginStatus.valid) {
      showAnswer('⚠️ Login required');
      return;
    }
    
    // Get answer from background script
    console.log('Requesting NEW answer for:', selectedText);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getAnswer',
        question: selectedText
      });
      
      console.log('Received response:', response);
      
      if (response && response.answer) {
        lastAnswer = response.answer;
        showAnswer(response.answer);
      } else {
        console.error('No answer received');
        hideAnswer();
      }
    } catch (error) {
      console.error('Error getting answer:', error);
      hideAnswer();
    }
  }
});
