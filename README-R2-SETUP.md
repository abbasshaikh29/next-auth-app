# Cloudflare R2 Setup Guide

This guide will help you set up Cloudflare R2 for your Next.js application.

## Why Cloudflare R2?

- **No Egress Fees**: R2 eliminates egress fees (data transfer out), which is often the most unpredictable cost with S3
- **Generous Free Tier**: R2 offers 10GB storage and 10 million Class A operations for free per month
- **Global Distribution**: Built into Cloudflare's global network, improving load times worldwide
- **S3-Compatible API**: R2 is designed to be S3-compatible, making migration straightforward

## Setup Steps

### 1. Create a Cloudflare Account

If you don't already have one, sign up for a Cloudflare account at [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).

### 2. Create an R2 Bucket

1. In the Cloudflare dashboard, navigate to **R2** in the sidebar
2. Click **Create bucket**
3. Name your bucket (e.g., `thetribelabbucket-r2`)
4. Choose your settings (public or private access)
5. Click **Create bucket**

### 3. Create API Tokens

1. In the R2 dashboard, go to **R2** > **Overview** > **Manage R2 API Tokens**
2. Click **Create API token**
3. Name your token (e.g., `next-auth-app-r2`)
4. Select **Admin** permissions for full access
5. Click **Create API token**
6. Save the Access Key ID and Secret Access Key securely

### 4. Configure Public Access (Required)

For direct public access to your files:

1. In the R2 dashboard, select your bucket
2. Go to **Settings** > **Public Access**
3. Enable **Public Access**
4. Note the public URL (e.g., `https://pub-{bucket-name}.r2.dev`)

### 5. Update Environment Variables

Copy the values from `.env.local.r2-only` to your `.env.local` file and update with your actual R2 credentials:

```
# R2 Access Credentials
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_BUCKET_NAME=your_r2_bucket_name

# R2 Endpoint URL
R2_ENDPOINT_URL=https://your_account_id.r2.cloudflarestorage.com

# Public URLs
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-your_bucket_name.r2.dev
```

### 6. Configure CORS for R2 Bucket

To allow direct uploads from the browser, you need to configure CORS settings for your R2 bucket:

1. In the R2 dashboard, select your bucket
2. Go to **Settings** > **CORS**
3. Add a new CORS configuration:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

### 7. Test the Implementation

1. Start your Next.js application
2. Check the storage indicator in the bottom-left corner shows "Using Cloudflare R2"
3. Try uploading a file using the file upload component
4. Verify the file is accessible and displays correctly

## Troubleshooting

### Common Issues

1. **Files Not Appearing**: Check that your R2 bucket has public access enabled
2. **Upload Errors**: Verify your R2 API credentials are correct
3. **CORS Errors**: Make sure your CORS configuration is set correctly

### Checking R2 Configuration

You can check if R2 is properly configured by looking at the storage indicator in the bottom-left corner of your application. It should show "Using Cloudflare R2" if everything is set up correctly.

## Monitoring Usage

Monitor your R2 usage in the Cloudflare dashboard:

1. Go to **R2** > **Overview**
2. View your storage usage and request metrics
3. Set up alerts for approaching limits

## Support

For issues with R2 implementation, contact:
- Cloudflare R2 Support: [https://developers.cloudflare.com/r2/](https://developers.cloudflare.com/r2/)
- Application Support: [your support email]
