// Browser compatibility
if (typeof browser === 'undefined') {
  var browser = chrome;
}

const API_KEY = 'sk-9eaf00902e6d41ffb5b60f076a6e16ed';

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'verifyLicense') {
    verifyLicenseWithServer(request.licenseKey, request.deviceId, request.deviceInfo)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ valid: false, message: 'Server error' }));
    return true;
  }
  
  if (request.action === 'loginWithLicense') {
    verifyLicenseWithServer(request.licenseKey, request.deviceId, request.deviceInfo)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ valid: false, message: 'Connection error' }));
    return true;
  }
  
  if (request.action === 'getAnswer') {
    getAnswerFromAPI(request.question)
      .then(answer => {
        console.log('Sending answer:', answer);
        sendResponse({ answer: answer });
      })
      .catch(error => {
        console.error('API call failed:', error);
        sendResponse({ answer: null });
      });
    return true;
  }
});

async function verifyLicenseWithServer(licenseKey, deviceId, deviceInfo) {
  const API_URL = 'https://extension-kiek.onrender.com';
  
  try {
    console.log('Background: Verifying license with server...');
    const response = await fetch(`${API_URL}/api/verify-license`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        licenseKey,
        deviceId,
        deviceInfo
      })
    });
    
    console.log('Background: Server response status:', response.status);
    const result = await response.json();
    console.log('Background: Server response data:', result);
    
    if (!response.ok || !result.valid) {
      return { valid: false, message: result.message || 'License invalid' };
    }
    
    return { valid: true, ...result };
  } catch (error) {
    console.error('Background: Verification error:', error);
    throw error;
  }
}

async function getAnswerFromAPI(question) {
  console.log('Calling API with question:', question);
  
  try {
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
            content: 'You are an MCQ quiz assistant. Read the following MCQ question and return ONLY the correct option number (1, 2, 3, or 4). Do not explain anything. Do not return full sentences. Return only the number.'
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      })
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return null;
    }
    
    const data = await response.json();
    console.log('API Response data:', data);
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
