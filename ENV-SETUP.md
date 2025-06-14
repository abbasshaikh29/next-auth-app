# Environment Configuration Guide

This application uses two environment files:

1. `.env.development` - Used for local development
2. `.env.production` - Used for production deployment

## Development Environment

The development environment file (`.env.development`) is used when running the application locally with:

```bash
npm run dev
```

### Key Development Settings

- **MongoDB**: Points to a development database
- **Email**: Configured to use Gmail or Resend for testing
- **Auto Verification**: Enabled for easier testing (`AUTO_VERIFY_EMAIL=true`)
- **R2 Storage**: Uses development credentials

## Production Environment

The production environment file (`.env.production`) is used when building and running the application in production:

```bash
npm run build
npm start
```

### Key Production Settings

- **MongoDB**: Points to the production database
- **Email**: Uses Resend for reliable email delivery
- **Auto Verification**: Disabled for security
- **R2 Storage**: Uses production credentials

## Environment Variables

Here's an explanation of the key environment variables:

### Authentication

- `NEXTAUTH_SECRET`: Secret key for JWT encryption
- `NEXTAUTH_URL`: Base URL of your application
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials

### Database

- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DATABASE`: Database name

### Email

- `RESEND_API_KEY`: API key for Resend email service
- `EMAIL_FROM`: Email address used as the sender
- `EMAIL_SERVER_*`: SMTP server configuration (for Gmail)

### Storage

- `R2_ACCESS_KEY_ID` & `R2_SECRET_ACCESS_KEY`: Cloudflare R2 credentials
- `R2_BUCKET_NAME`: R2 bucket name
- `NEXT_PUBLIC_R2_PUBLIC_URL`: Public URL for R2 bucket

### Payments

- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay API credentials

## Switching Between Environments

Next.js automatically uses the correct environment file based on the command:

- `npm run dev` → Uses `.env.development`
- `npm run build` or `npm start` → Uses `.env.production`

You can also manually specify which environment to use:

```bash
NODE_ENV=production npm run dev
```

## Security Notes

1. Never commit your environment files to version control
2. Keep your production credentials secure
3. Rotate your API keys periodically
4. Use different databases for development and production

## Razorpay Configuration

To enable Razorpay payments, you must set the following environment variables:

- `RAZORPAY_KEY_ID`: Your Razorpay API key ID
- `RAZORPAY_KEY_SECRET`: Your Razorpay API key secret

You can obtain these credentials from your Razorpay dashboard.

If these variables are not set, the application will throw an error on startup and when attempting to create orders.
