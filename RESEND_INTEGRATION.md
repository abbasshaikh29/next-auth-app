# Resend Email Integration

This document explains how to set up and use Resend as the email service for the application.

## What is Resend?

Resend is a modern email API built for developers. It provides:
- Simple API for sending emails
- High deliverability rates
- Detailed analytics and logs
- React Email support for building emails with React components
- Webhooks for tracking email events

## Setup Instructions

### 1. Create a Resend Account

1. Go to [Resend's website](https://resend.com) and create an account
2. Verify your domain for better deliverability
3. Get your API key from the Resend dashboard

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```
# Resend Email Configuration
RESEND_API_KEY=re_yourapikey  # Replace with your actual Resend API key
EMAIL_FROM=noreply@yourdomain.com  # Replace with your verified domain email
NEXT_PUBLIC_APP_NAME=TheTribeLab
```

### 3. Development Mode Options

For development, you can use one of these approaches:

#### Option 1: Auto-Verify Emails (Recommended for Development)

Add the following to your `.env.local` file:

```
AUTO_VERIFY_EMAIL=true
```

This will automatically verify user emails during registration in development mode, bypassing the need for actual email verification.

#### Option 2: Use Resend Test Mode

Resend provides a test mode that allows you to send test emails without actually delivering them. This is useful for development and testing.

## How It Works

The application uses Resend for:
1. Sending verification emails during registration
2. Resending verification emails when requested
3. (Future) Password reset emails
4. (Future) Notification emails

## Troubleshooting

### Common Issues

1. **Emails not sending**:
   - Check that your Resend API key is correct
   - Verify that your domain is properly configured in Resend
   - Check the Resend dashboard for any sending issues

2. **Emails going to spam**:
   - Make sure your domain is properly verified in Resend
   - Set up DKIM, SPF, and DMARC records for your domain
   - Improve your email content to avoid spam triggers

3. **Rate limiting**:
   - If you hit Resend's rate limits, consider upgrading your plan
   - Implement rate limiting in your application to prevent excessive email sending

## Resend vs. Other Email Services

Resend was chosen over other options like Postal, Brevo, SendGrid, etc. because:

1. **Developer Experience**: Resend offers a modern, developer-friendly API
2. **React Integration**: Excellent support for React-based email templates
3. **Deliverability**: Strong focus on email deliverability
4. **Analytics**: Detailed email analytics and logs
5. **Pricing**: Competitive pricing with a generous free tier (3,000 emails/month)

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference/introduction)
- [React Email](https://react.email) - For building email templates with React
