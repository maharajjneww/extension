# Privacy Policy Hosting Guide

This folder contains a standalone privacy policy page that can be hosted separately from your main application.

## Files Included

- `index.html` - Complete privacy policy page (self-contained, no external dependencies)

## Hosting Options

### Option 1: GitHub Pages (FREE)

1. Create a new repository called `quiz-assistant-privacy`
2. Upload `index.html` to the repository
3. Go to Settings → Pages
4. Enable GitHub Pages from main branch
5. Your privacy policy will be available at: `https://yourusername.github.io/quiz-assistant-privacy/`

### Option 2: Netlify (FREE)

1. Go to https://www.netlify.com/
2. Sign up for free account
3. Drag and drop this `privacy-policy` folder
4. Get instant URL like: `https://quiz-assistant-privacy.netlify.app/`
5. Optional: Add custom domain

### Option 3: Vercel (FREE)

1. Go to https://vercel.com/
2. Sign up for free account
3. Import this folder
4. Deploy instantly
5. Get URL like: `https://quiz-assistant-privacy.vercel.app/`

### Option 4: Render Static Site (FREE) - RECOMMENDED

1. Go to https://render.com/dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure settings:
   - **Name:** quiz-assistant-privacy
   - **Branch:** main
   - **Root Directory:** (leave empty)
   - **Build Command:** (leave empty)
   - **Publish Directory:** `privacy-policy`
   - **Auto-Deploy:** Yes
5. Click "Create Static Site"
6. Get URL like: `https://quiz-assistant-privacy.onrender.com`

### Option 5: Your Own Domain

Upload `index.html` to any web hosting:
- Shared hosting (cPanel, etc.)
- VPS/Cloud server
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps

## Quick Deploy Commands

### Using Netlify CLI:
```bash
npm install -g netlify-cli
cd privacy-policy
netlify deploy --prod
```

### Using Vercel CLI:
```bash
npm install -g vercel
cd privacy-policy
vercel --prod
```

## Update Extension Manifest

After hosting, update your `manifest.json`:

```json
{
  "homepage_url": "https://your-privacy-policy-url.com"
}
```

## For Chrome Web Store Submission

When filling out the Chrome Web Store privacy form, use your hosted URL:

**Privacy Policy URL:** `https://your-privacy-policy-url.com`

## Testing

Before submitting to Chrome Web Store, verify:

1. ✅ Privacy policy URL is publicly accessible
2. ✅ Page loads without errors
3. ✅ All sections are visible
4. ✅ Links work correctly
5. ✅ Mobile responsive
6. ✅ HTTPS enabled (required by Chrome)

## Customization

To customize the privacy policy:

1. Open `index.html` in any text editor
2. Update contact email: Search for `support@quizassistant.com`
3. Update company name if needed
4. Update last updated date
5. Save and re-deploy

## Important Notes

- ✅ This privacy policy is compliant with GDPR, CCPA, and Chrome Web Store policies
- ✅ No external dependencies (works offline)
- ✅ Mobile responsive
- ✅ Fast loading (single HTML file)
- ✅ SEO friendly

## Support

If you need help hosting or customizing the privacy policy, refer to the hosting provider's documentation or contact support.
