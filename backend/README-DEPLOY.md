# Deploy to Render

## Step 1: Prepare for Deployment

1. Make sure all files are in the `backend` folder
2. The `.env` file should NOT be committed (it's in .gitignore)

## Step 2: Create Render Account

1. Go to https://render.com/
2. Sign up with GitHub (recommended) or email
3. Verify your email

## Step 3: Deploy Backend

1. Click "New +" button → "Web Service"
2. Connect your GitHub repository (or use "Deploy from Git URL")
3. Configure:
   - **Name**: quiz-extension-api (or any name)
   - **Region**: Choose closest to your users
   - **Branch**: main (or your branch name)
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. Add Environment Variables (click "Advanced"):
   - `MONGODB_URI` = `mongodb+srv://maharajjneww:Extension%401@cluster0.h2duoyr.mongodb.net/quiz-extension?retryWrites=true&w=majority`
   - `PORT` = `3000`
   - `ADMIN_PASSWORD` = `Admin@Quiz2024` (or your password)

5. Click "Create Web Service"

## Step 4: Wait for Deployment

- Render will build and deploy (takes 2-5 minutes)
- You'll get a URL like: `https://quiz-extension-api.onrender.com`

## Step 5: Test Your Deployment

1. Visit: `https://your-app-name.onrender.com/`
   - Should show: `{"status":"Quiz Extension API is running"}`

2. Visit: `https://your-app-name.onrender.com/admin`
   - Should show the admin panel

3. Test license verification:
   ```bash
   curl -X POST https://your-app-name.onrender.com/api/verify-license \
     -H "Content-Type: application/json" \
     -d '{"licenseKey": "QUIZ-TEST-2024"}'
   ```

## Step 6: Update Extension

Update these files with your Render URL:

1. **content.js** - Line 2:
   ```javascript
   const API_URL = 'https://your-app-name.onrender.com';
   ```

2. **popup.js** - Line 2:
   ```javascript
   const API_URL = 'https://your-app-name.onrender.com';
   ```

3. **background.js** - Inside `verifyLicenseWithServer` function:
   ```javascript
   const API_URL = 'https://your-app-name.onrender.com';
   ```

4. **manifest.json** - Update host_permissions:
   ```json
   "host_permissions": [
     "https://api.deepseek.com/*",
     "https://your-app-name.onrender.com/*"
   ]
   ```

## Step 7: Access Admin Panel

- URL: `https://your-app-name.onrender.com/admin`
- Password: `Admin@Quiz2024` (or what you set)

## Important Notes

- **Free tier sleeps after 15 minutes of inactivity**
  - First request after sleep takes 30-60 seconds to wake up
  - Upgrade to paid plan ($7/month) for always-on service

- **MongoDB Atlas IP Whitelist**
  - Go to MongoDB Atlas → Network Access
  - Add IP: `0.0.0.0/0` (allow all) for Render to connect
  - Or add Render's IP addresses

## Troubleshooting

If deployment fails:
1. Check logs in Render dashboard
2. Verify environment variables are set correctly
3. Make sure MongoDB connection string is correct
4. Check if MongoDB Atlas allows connections from Render IPs
