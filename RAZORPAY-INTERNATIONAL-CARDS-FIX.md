# Fix: International Cards Not Supported

## Problem
Razorpay test mode is rejecting international test cards with error: "International cards are not supported"

## Solution: Enable International Payments in Razorpay Dashboard

### Step 1: Login to Razorpay Dashboard
1. Go to: https://dashboard.razorpay.com/
2. Login with your credentials

### Step 2: Enable International Payments
1. Go to **Settings** (gear icon on left sidebar)
2. Click on **Payment Methods**
3. Find **International Cards** section
4. Toggle **Enable International Cards** to ON
5. Click **Save**

### Step 3: Configure Test Mode Settings
1. Make sure you're in **Test Mode** (toggle at top)
2. Go to **Settings** → **Configuration**
3. Under **Payment Methods**, ensure these are enabled:
   - ✅ Credit Cards
   - ✅ Debit Cards
   - ✅ International Cards
4. Save changes

## Alternative: Use Indian Test Cards

If you can't enable international cards, use these Indian test cards:

### Domestic Indian Cards (Always Work in Test Mode):

**RuPay Card:**
```
Card: 6074 8200 0000 0007
Expiry: 12/28
CVV: 123
Name: Test User
```

**Visa India:**
```
Card: 4111 1111 1111 1111
Expiry: 12/28
CVV: 123
Name: Test User
```

**Mastercard India:**
```
Card: 5555 5555 5555 4444
Expiry: 12/28
CVV: 123
Name: Test User
```

## Quick Test Without Dashboard Access

If you can't access Razorpay dashboard settings right now, try these options:

### Option 1: Use UPI (Test Mode)
1. In Razorpay checkout, select **UPI**
2. Use test UPI ID: `success@razorpay`
3. Payment will succeed automatically

### Option 2: Use Netbanking (Test Mode)
1. In Razorpay checkout, select **Netbanking**
2. Choose any bank
3. Use credentials: username: `test`, password: `test`
4. Payment will succeed

### Option 3: Use Wallet (Test Mode)
1. Select **Wallets** → **Paytm**
2. Use test phone: `9999999999`
3. OTP: `123456`

## After Enabling International Cards

Once enabled, these test cards will work:

```
Success Card:
Card: 4111 1111 1111 1111
Expiry: 12/28
CVV: 123

Alternative Success:
Card: 5555 5555 5555 4444
Expiry: 12/28
CVV: 123

Test Failure (Declined):
Card: 4000 0000 0000 0002
Expiry: 12/28
CVV: 123
```

## Important Notes

- International card support must be enabled in Razorpay dashboard
- In test mode, all test cards work regardless of actual card origin
- For production, you'll need to complete KYC and get approval for international payments
- Test mode payments don't charge real money

## Verification

After enabling international cards:
1. Go back to: https://extension-kiek.onrender.com/purchase
2. Click "Subscribe Now"
3. Try the test card again
4. Payment should succeed and show license key

## Support

If issues persist:
- Check Razorpay dashboard → Settings → Payment Methods
- Contact Razorpay support: support@razorpay.com
- Use alternative payment methods (UPI/Netbanking) for testing
