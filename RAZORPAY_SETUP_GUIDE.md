# Razorpay Setup Guide

## Problem
You're getting a "Razorpay API error: Authentication failed" because your application is using dummy/placeholder credentials instead of real Razorpay API credentials.

## Current Issue
Your environment files contain these dummy credentials:
```
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=thiIsADummyKeySecret123
```

## Solution Steps

### Step 1: Get Your Real Razorpay Credentials

1. **Sign up/Login to Razorpay**
   - Go to [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)
   - Create an account or log in to your existing account

2. **Get Test Credentials**
   - Navigate to **Settings** → **API Keys**
   - Click on **Generate Test Key** (if you don't have one)
   - Copy your **Key ID** and **Key Secret**
   - Test credentials start with `rzp_test_`

3. **For Production (Later)**
   - Complete KYC verification
   - Generate live credentials (start with `rzp_live_`)

### Step 2: Update Environment Files

Replace the dummy credentials in your environment files:

**In `.env.development`:**
```env
# Razorpay Test Credentials
RAZORPAY_KEY_ID=your_actual_test_key_id_here
RAZORPAY_KEY_SECRET=your_actual_test_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_actual_test_key_id_here
```

**In `.env.production`:**
```env
# Razorpay Live Credentials (use test for now)
RAZORPAY_KEY_ID=your_actual_key_id_here
RAZORPAY_KEY_SECRET=your_actual_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_actual_key_id_here
```

### Step 3: Test Your Credentials

Run the test script to verify your credentials work:

```bash
node test-razorpay-credentials.js
```

This script will:
- Check if credentials are set
- Verify they're not dummy credentials
- Make a test API call to Razorpay
- Create a test order to confirm authentication

### Step 4: Restart Your Development Server

After updating the credentials:

```bash
# Stop your current server (Ctrl+C)
# Then restart
npm run dev
```

## Security Notes

1. **Never commit real credentials to Git**
   - Your `.env.*` files should be in `.gitignore`
   - Use environment variables in production

2. **Use Test Credentials for Development**
   - Always use `rzp_test_` credentials for development
   - Only use `rzp_live_` credentials in production

3. **Environment Separation**
   - Development: Use test credentials
   - Production: Use live credentials (after KYC)

## Troubleshooting

### If you still get authentication errors:

1. **Double-check credentials**
   - Ensure no extra spaces or characters
   - Verify you copied the complete key and secret

2. **Check environment loading**
   - Restart your development server
   - Verify the correct `.env` file is being loaded

3. **Verify Razorpay account status**
   - Ensure your Razorpay account is active
   - Check if API access is enabled

### Common Mistakes:

- Using live credentials in test mode
- Copying incomplete credentials
- Not restarting the server after updating env files
- Having credentials in wrong environment file

## Testing Payment Flow

Once credentials are working, you can test the complete payment flow:

1. Create an order (should work now)
2. Use Razorpay's test card numbers for payment testing
3. Verify payment completion

## Test Card Numbers (Razorpay)

For testing payments, use these test card numbers:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Next Steps

1. Update your credentials as described above
2. Run the test script
3. Restart your development server
4. Test the payment creation endpoint
5. Implement complete payment flow testing

## Support

If you continue to face issues:
1. Check Razorpay documentation: [https://razorpay.com/docs/](https://razorpay.com/docs/)
2. Contact Razorpay support through their dashboard
3. Verify your account status and API permissions
