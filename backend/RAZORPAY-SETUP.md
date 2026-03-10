# Razorpay Payment Integration Setup

## Step 1: Create Razorpay Account

1. Go to https://razorpay.com/
2. Click "Sign Up" (top right)
3. Fill in your details:
   - Business Name
   - Email
   - Phone Number
4. Verify your email and phone
5. Complete KYC (for live payments)

## Step 2: Get API Keys

1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click **"Generate Test Key"** (for testing)
4. You'll see:
   - **Key ID**: `rzp_test_xxxxxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxxxxxxx`
5. Copy both keys

## Step 3: Update Environment Variables

### On Render:

1. Go to your Render dashboard
2. Click on your service
3. Go to **Environment** tab
4. Add these variables:
   - `RAZORPAY_KEY_ID` = `rzp_test_xxxxxxxxxxxxx`
   - `RAZORPAY_KEY_SECRET` = `xxxxxxxxxxxxxxxxxxxxx`
5. Click **Save Changes**
6. Service will auto-redeploy

### Locally (for testing):

Update `backend/.env`:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

## Step 4: Test the Payment Flow

1. Go to: https://extension-kiek.onrender.com/purchase
2. Click "Subscribe Now"
3. Razorpay checkout will open
4. Use test card details:
   - **Card Number**: 4111 1111 1111 1111
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date
   - **Name**: Any name
5. Complete payment
6. You should see success screen with license key!

## Step 5: Go Live (When Ready)

1. Complete KYC on Razorpay
2. Get approval from Razorpay
3. Generate **Live API Keys**:
   - Go to Settings → API Keys
   - Click "Generate Live Key"
4. Update environment variables with live keys:
   - `RAZORPAY_KEY_ID` = `rzp_live_xxxxxxxxxxxxx`
   - `RAZORPAY_KEY_SECRET` = `xxxxxxxxxxxxxxxxxxxxx`
5. Test with real card (small amount first)

## Razorpay Test Cards

### Success Scenarios:
- **Card**: 4111 1111 1111 1111
- **Card**: 5555 5555 5555 4444
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Failure Scenarios:
- **Card**: 4000 0000 0000 0002 (Declined)
- **Card**: 4000 0000 0000 0069 (Expired)

## Payment Flow

1. User clicks "Subscribe Now"
2. Frontend calls `/api/create-order`
3. Backend creates Razorpay order
4. Razorpay checkout opens
5. User completes payment
6. Razorpay calls success handler
7. Frontend calls `/api/verify-payment`
8. Backend verifies signature
9. Backend generates license key
10. License saved to MongoDB
11. User sees license key on screen

## Pricing

Current: **₹200/month**

To change price, update in:
- `backend/purchase.html` (line with price display)
- Amount is automatically sent to backend

## License Generation

After successful payment:
- Format: `QUIZ-{timestamp}-{random}`
- Example: `QUIZ-1709876543-A7B2C9`
- Expiry: 30 days from purchase
- Plan: Monthly
- Status: Active

## Webhooks (Optional - Advanced)

For automatic subscription renewals:

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://extension-kiek.onrender.com/api/webhook`
3. Select events:
   - `payment.captured`
   - `subscription.charged`
4. Implement webhook handler in server.js

## Security Notes

- ✅ Payment signature is verified server-side
- ✅ API keys are stored in environment variables
- ✅ Never expose key_secret to frontend
- ✅ All communications over HTTPS
- ✅ License keys are unique and random

## Support

- Razorpay Docs: https://razorpay.com/docs/
- Test Mode: https://razorpay.com/docs/payments/payments/test-card-details/
- Support: support@razorpay.com

## Troubleshooting

**Payment fails:**
- Check API keys are correct
- Verify Razorpay account is active
- Check browser console for errors

**License not generated:**
- Check MongoDB connection
- Verify payment signature
- Check server logs on Render

**Checkout doesn't open:**
- Verify Razorpay script is loaded
- Check Key ID is correct
- Open browser console for errors
