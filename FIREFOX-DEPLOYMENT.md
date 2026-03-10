# Firefox Add-on Deployment Guide

Your extension is now compatible with both Chrome and Firefox!

## Changes Made for Firefox Compatibility

1. ✅ Added browser compatibility layer in all JS files
2. ✅ Created `manifest-firefox.json` (Manifest V2 for Firefox)
3. ✅ Updated Chrome manifest to v2.2.1
4. ✅ Both versions use the same codebase

## Key Differences: Chrome vs Firefox

### Manifest Version
- **Chrome:** Manifest V3 (manifest.json)
- **Firefox:** Manifest V2 (manifest-firefox.json)

### API Namespace
- **Chrome:** Uses `chrome.*` API
- **Firefox:** Uses `browser.*` API
- **Solution:** Added compatibility layer that works on both

### Background Scripts
- **Chrome:** Uses `service_worker`
- **Firefox:** Uses `scripts` array

## How to Package for Firefox

### Option 1: Manual Packaging

1. **Copy files to a new folder:**
   ```
   firefox-build/
   ├── manifest.json (rename manifest-firefox.json to manifest.json)
   ├── content.js
   ├── content.css
   ├── background.js
   ├── popup.html
   ├── popup.js
   ├── browser-polyfill.js
   ├── icon16.png
   ├── icon48.png
   └── icon128.png
   ```

2. **Rename manifest:**
   - Copy `manifest-firefox.json` as `manifest.json` in the firefox-build folder

3. **Create ZIP:**
   - Select all files in firefox-build folder
   - Create ZIP file: `quiz-assistant-firefox-2.2.1.zip`

### Option 2: Using Command Line

**On Windows (PowerShell):**
```powershell
# Create firefox build directory
New-Item -ItemType Directory -Force -Path firefox-build

# Copy files
Copy-Item manifest-firefox.json firefox-build/manifest.json
Copy-Item content.js, content.css, background.js, popup.html, popup.js, browser-polyfill.js firefox-build/
Copy-Item icon16.png, icon48.png, icon128.png firefox-build/

# Create ZIP
Compress-Archive -Path firefox-build/* -DestinationPath quiz-assistant-firefox-2.2.1.zip
```

**On Mac/Linux:**
```bash
# Create firefox build directory
mkdir -p firefox-build

# Copy files
cp manifest-firefox.json firefox-build/manifest.json
cp content.js content.css background.js popup.html popup.js browser-polyfill.js firefox-build/
cp icon16.png icon48.png icon128.png firefox-build/

# Create ZIP
cd firefox-build && zip -r ../quiz-assistant-firefox-2.2.1.zip * && cd ..
```

## Testing on Firefox

### Load Temporarily (for testing)

1. Open Firefox
2. Type `about:debugging` in address bar
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select `manifest.json` from firefox-build folder
6. Test the extension

### Test Checklist
- [ ] Extension icon appears in toolbar
- [ ] Click icon → Login screen appears
- [ ] Login with license key works
- [ ] Select text on webpage → Answer appears
- [ ] Answer disappears after 3 seconds
- [ ] License deactivation works

## Publishing to Firefox Add-ons (AMO)

### Step 1: Create Developer Account

1. Go to https://addons.mozilla.org/developers/
2. Sign up or log in with Firefox Account
3. Verify your email

### Step 2: Submit Add-on

1. Click "Submit a New Add-on"
2. Choose "On this site" (for listed add-on)
3. Upload `quiz-assistant-firefox-2.2.1.zip`

### Step 3: Fill Out Listing Information

**Add-on Name:** Quiz Answer Assistant

**Summary (250 chars):**
```
Get instant answers to multiple-choice questions using AI. Select any question text on a webpage and see the correct answer displayed in the corner. Requires license key for access.
```

**Description:**
```
Quiz Answer Assistant helps students learn by providing instant AI-powered answers to multiple-choice questions.

Features:
• Select question text to get instant answers
• Answers appear in top-right corner for 3 seconds
• Works on any webpage
• Dark/light mode support
• Secure license-based authentication
• No tab switching required

How to use:
1. Install the extension
2. Click the extension icon and enter your license key
3. Select any question text on a webpage
4. The answer appears automatically

Privacy:
• Only license keys are collected for authentication
• Questions are processed by DeepSeek AI
• No browsing history is stored
• See full privacy policy at: https://extension-kiek.onrender.com/privacy
```

**Categories:**
- Education
- Productivity

**Support Email:** [your-email@example.com]

**Support Website:** https://extension-kiek.onrender.com

**Privacy Policy:** https://extension-kiek.onrender.com/privacy

### Step 4: Technical Details

**License:** Custom License (or choose appropriate)

**This add-on is experimental:** No

**Requires payment:** Yes (license key required)

**Some features require payment:** Yes

### Step 5: Review Process

Firefox review typically takes:
- **Automatic review:** Few minutes (if no issues detected)
- **Manual review:** 1-7 days (if flagged for manual review)

Your extension will likely need manual review because:
- It uses external APIs
- It requires payment/license
- Educational tool (might be reviewed for policy compliance)

## Important Notes

### Firefox-Specific Considerations

1. **Add-on ID Required:**
   - In `manifest-firefox.json`, update the ID:
   ```json
   "browser_specific_settings": {
     "gecko": {
       "id": "quiz-assistant@yourdomain.com"
     }
   }
   ```
   - Use your actual domain or email

2. **Permissions:**
   - Firefox combines permissions and host_permissions
   - Already configured in manifest-firefox.json

3. **Content Security Policy:**
   - Firefox is stricter about remote code
   - Our implementation is compliant

### Differences from Chrome Web Store

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Review Time | 1-3 days | Few minutes to 7 days |
| Manifest Version | V3 | V2 (V3 support coming) |
| API Namespace | chrome.* | browser.* |
| Background | Service Worker | Background Scripts |
| Permissions | Separate fields | Combined field |

## Maintaining Both Versions

### When updating the extension:

1. **Update version in both manifests:**
   - `manifest.json` (Chrome)
   - `manifest-firefox.json` (Firefox)

2. **Test on both browsers:**
   - Chrome: Load unpacked
   - Firefox: Load temporary add-on

3. **Package separately:**
   - Chrome: ZIP with manifest.json (V3)
   - Firefox: ZIP with manifest-firefox.json renamed to manifest.json (V2)

4. **Submit to both stores:**
   - Chrome Web Store
   - Firefox Add-ons (AMO)

## Troubleshooting

### Extension doesn't load in Firefox
- Check manifest-firefox.json syntax
- Ensure all files are included
- Check browser console for errors

### API calls fail
- Verify permissions in manifest-firefox.json
- Check CORS settings on backend
- Test with about:debugging console

### Background script issues
- Firefox uses persistent background scripts
- Check for service worker specific code
- Use browser.* instead of chrome.*

## Resources

- Firefox Extension Workshop: https://extensionworkshop.com/
- WebExtensions API: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions
- AMO Developer Hub: https://addons.mozilla.org/developers/
- Firefox Add-on Policies: https://extensionworkshop.com/documentation/publish/add-on-policies/

## Summary

Your extension now works on both Chrome and Firefox! The code is compatible with both browsers thanks to the browser compatibility layer. Package and submit to Firefox Add-ons to reach more users.
