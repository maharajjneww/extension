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
            content: `You are an expert problem solver specializing in competitive exams, aptitude tests, and technical assessments. You excel at:
- Mathematical reasoning and calculations
- Logical and analytical thinking
- Pattern recognition and series completion
- Probability and statistics
- Programming and computer science concepts
- General knowledge and current affairs

IMPORTANT INSTRUCTIONS:
1. Analyze the question carefully to determine if it has multiple choice options (A, B, C, D) or not
2. If the question HAS options (A, B, C, D): Return ONLY the correct option letter (A, B, C, or D)
3. If the question has NO options: Return the direct answer value (like "7.5°", "243", "ReLU", etc.)
4. Your response must be concise - either a single letter OR the direct answer
5. No explanations, no extra text, no reasoning shown

Examples:
- Question with options A, B, C, D → Answer: B
- Question without options → Answer: 7.5°`
          },
          {
            role: 'user',
            content: `Analyze this question and provide the answer according to the format rules:\n\n${question}\n\nAnswer:`
          }
        ],
        temperature: 0.3,
        max_tokens: 20,
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
    
    // Clean up the answer - remove common prefixes
    let cleanAnswer = rawAnswer
      .replace(/^(Answer:|The answer is:?|Correct answer:?)\s*/i, '')
      .replace(/^[.\-\s]+/, '')
      .trim();
    
    console.log('Cleaned answer:', cleanAnswer);
    return cleanAnswer;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}