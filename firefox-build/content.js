// Browser compatibility
if (typeof browser === 'undefined') {
  var browser = chrome;
}

const API_KEY = 'sk-9eaf00902e6d41ffb5b60f076a6e16ed';
const API_URL = 'https://extension-kiek.onrender.com'; // Backend server URL
let answerPopup = null;

document.addEventListener('mouseup', async () => {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText.length > 10) {
    // Check if user is logged in and license is valid with server
    const loginStatus = await checkLogin();
    if (!loginStatus.valid) {
      showAnswer(loginStatus.message);
      return;
    }
    
    showAnswer('Loading...');
    const answer = await getAnswer(selectedText);
    showAnswer(answer);
  }
});

async function checkLogin() {
  const data = await chrome.storage.sync.get(['isLoggedIn', 'licenseKey', 'lastVerified']);
  
  // Not logged in
  if (!data.isLoggedIn || !data.licenseKey) {
    return { valid: false, message: 'Please login first' };
  }
  
  // Check if last verification was too long ago (60 minutes for testing)
  const now = Date.now();
  const lastVerified = data.lastVerified || 0;
  const minutesSinceVerification = (now - lastVerified) / (1000 * 60);
  
  // Verify with server every time via background script
  try {
    console.log('Checking license with server via background...');
    const result = await chrome.runtime.sendMessage({
      action: 'verifyLicense',
      licenseKey: data.licenseKey
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

document.addEventListener('click', () => {
  hideAnswer();
});

async function getAnswer(question) {
  try {
    console.log('Making API request...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a quiz assistant. For MCQ questions, respond ONLY with the correct option letter (A, B, C, or D) or the exact correct answer text. No explanations, no extra text.'
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return `Error ${response.status}`;
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Fetch error:', error.message);
    
    // Check if it's a CORS error
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      return 'CORS Error - Check console';
    }
    
    return 'Network Error';
  }
}

function showAnswer(text) {
  hideAnswer();
  
  answerPopup = document.createElement('div');
  answerPopup.id = 'quiz-assistant-popup';
  answerPopup.textContent = text;
  document.body.appendChild(answerPopup);
  
  setTimeout(() => {
    hideAnswer();
  }, 3000);
}

function hideAnswer() {
  if (answerPopup && answerPopup.parentNode) {
    answerPopup.parentNode.removeChild(answerPopup);
    answerPopup = null;
  }
}
