// Browser compatibility
if (typeof browser === 'undefined') {
  var browser = chrome;
}

let answerBox = null;
let lastQuestion = '';
let lastAnswer = '';

// Create minimal floating answer box
function createAnswerBox() {
  if (answerBox) return answerBox;
  
  answerBox = document.createElement('div');
  answerBox.id = 'quiz-answer-box';
  answerBox.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: black;
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 2147483647;
    display: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    font-weight: 500;
    width: auto;
    pointer-events: none;
  `;
  document.body.appendChild(answerBox);
  return answerBox;
}

function showAnswer(text) {
  const box = createAnswerBox();
  box.textContent = text;
  box.style.display = 'block';
  lastAnswer = text;
}

function hideAnswer() {
  if (answerBox) {
    answerBox.style.display = 'none';
    lastAnswer = '';
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

// Handle text selection
document.addEventListener('mouseup', async () => {
  const selectedText = window.getSelection().toString().trim();
  
  // Only trigger if text is selected
  if (selectedText.length > 0) {
    // Check if same question - avoid duplicate API calls
    if (selectedText === lastQuestion) {
      // Show cached answer if available
      if (lastAnswer) {
        showAnswer(lastAnswer);
      }
      return;
    }
    
    lastQuestion = selectedText;
    
    // Check login status
    const loginStatus = await checkLogin();
    if (!loginStatus.valid) {
      showAnswer('⚠️ Login required');
      return;
    }
    
    // Show loading indicator
    showAnswer('...');
    
    // Get answer from background script
    console.log('Requesting answer for:', selectedText);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getAnswer',
        question: selectedText
      });
      
      console.log('Received response:', response);
      
      if (response && response.answer) {
        showAnswer(response.answer);
      } else {
        hideAnswer();
      }
    } catch (error) {
      console.error('Error getting answer:', error);
      hideAnswer();
    }
  }
});
