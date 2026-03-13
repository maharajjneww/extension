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
            content: `You are a highly intelligent AI assistant with expertise across all fields of knowledge. Your task is to solve multiple choice questions accurately.

When given a question:
1. Read and understand it completely
2. Think through the problem carefully
3. Evaluate all given options
4. Determine the correct answer
5. Return ONLY the option identifier

Response format: Return EXACTLY one character - either A, B, C, D (for letter options) or 1, 2, 3, 4 (for numbered options). Nothing else.`
          },
          {
            role: 'user',
            content: `${question}\n\nProvide only the correct option (A/B/C/D or 1/2/3/4):`
          }
        ],
        temperature: 0.3,
        max_tokens: 15,
        top_p: 0.9
      })
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return null;
    }
    
    const data = await response.json();
    console.log('Full API Response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid API response structure');
      return null;
    }
    
    const rawAnswer = data.choices[0].message.content.trim();
    console.log('Raw answer from API:', rawAnswer);
    
    // Extract the first valid option character (A-D or 1-4)
    const match = rawAnswer.match(/^[A-D1-4]/i);
    if (match) {
      const cleanAnswer = match[0].toUpperCase();
      console.log('Extracted answer:', cleanAnswer);
      return cleanAnswer;
    }
    
    // Fallback: try to find any A-D or 1-4 in the response
    const fallbackMatch = rawAnswer.match(/[A-D1-4]/i);
    if (fallbackMatch) {
      const cleanAnswer = fallbackMatch[0].toUpperCase();
      console.log('Fallback extracted answer:', cleanAnswer);
      return cleanAnswer;
    }
    
    console.error('Could not extract valid answer from:', rawAnswer);
    return null;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
