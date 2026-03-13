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
            content: 'You are an expert at solving multiple choice questions across all domains including mathematics, probability, aptitude, reasoning, technical subjects, and general knowledge. Analyze each question carefully and determine the correct answer.'
          },
          {
            role: 'user',
            content: `Question: ${question}\n\nInstructions: Read this MCQ question carefully. Identify the correct answer option. Return ONLY the option identifier (A, B, C, D or 1, 2, 3, 4) - nothing else. No explanation, no punctuation, just the single letter or number.`
          }
        ],
        temperature: 0.2,
        max_tokens: 10,
        top_p: 0.95
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
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid API response structure');
      return null;
    }
    
    const answer = data.choices[0].message.content.trim();
    console.log('Raw answer from API:', answer);
    
    // Extract only the first letter or number
    const match = answer.match(/[A-D1-4]/i);
    const cleanAnswer = match ? match[0].toUpperCase() : answer.charAt(0).toUpperCase();
    
    console.log('Clean answer:', cleanAnswer);
    return cleanAnswer;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
