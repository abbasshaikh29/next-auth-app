# Migrating from AWS S3 to Cloudflare R2

This guide will help you migrate your storage from AWS S3 to Cloudflare R2 for better performance and cost savings.

## Why Migrate to Cloudflare R2?

- **No Egress Fees**: R2 eliminates egress fees (data transfer out), which is often the most unpredictable cost with S3
- **Generous Free Tier**: R2 offers 10GB storage and 10 million Class A operations for free per month (compared to S3's 5GB and 20,000 GET/PUT requests)
- **Global Distribution**: Built into Cloudflare's global network, potentially improving load times worldwide
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

### 4. Configure Public Access (Optional but Recommended)

For direct public access to your files:

1. In the R2 dashboard, select your bucket
2. Go to **Settings** > **Public Access**
3. Enable **Public Access**
4. Note the public URL (e.g., `https://pub-{bucket-name}.r2.dev`)

### 5. Update Environment Variables

Copy the values from `.env.local.r2-sample` to your `.env.local` file and update with your actual R2 credentials:

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

### 6. Migrate Existing Files

Run the migration script to transfer files from S3 to R2:

```bash
node scripts/migrate-s3-to-r2.js
```

This script will:
- List all objects in your S3 bucket
- Download each object
- Upload it to R2 with the same key
- Verify the upload was successful
- Generate a report of migrated files

### 7. Update Your Code

The application has been updated to use R2 when the R2 environment variables are present. The code will automatically detect and use R2 instead of S3.

### 8. Test the Implementation

1. Upload a test file using the R2 upload component
2. Verify the file is accessible and displays correctly
3. Check the storage indicator in the bottom-left corner shows "Using Cloudflare R2"

## Optimizing for Performance

For optimal image and video delivery performance:

1. **Enable Cloudflare Cache**: R2 works with Cloudflare's cache to deliver content faster
2. **Use Appropriate Cache Headers**: Set cache-control headers for your assets
3. **Consider Image Optimization**: Use Next.js Image component for automatic optimization
4. **Implement Progressive Loading**: Use blur placeholders for large images

## Troubleshooting

### Common Issues

1. **Files Not Appearing**: Check that your R2 bucket has public access enabled
2. **Upload Errors**: Verify your R2 API credentials are correct
3. **CORS Errors**: Configure CORS settings in your R2 bucket

### CORS Configuration

If you encounter CORS errors, add the following CORS configuration to your R2 bucket:

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

## Monitoring Usage

Monitor your R2 usage in the Cloudflare dashboard:

1. Go to **R2** > **Overview**
2. View your storage usage and request metrics
3. Set up alerts for approaching limits

## Rollback Plan

If you need to revert to S3:

1. Keep both S3 and R2 environment variables in your `.env.local` file
2. Comment out the R2 variables to fall back to S3
3. The application will automatically detect and use S3 again

## Support

For issues with R2 implementation, contact:
- Cloudflare R2 Support: [https://developers.cloudflare.com/r2/](https://developers.cloudflare.com/r2/)
- Application Support: [your support email]
