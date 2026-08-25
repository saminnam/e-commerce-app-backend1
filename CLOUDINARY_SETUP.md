# Cloudinary Setup Instructions

## Why Cloudinary?
Your backend is deployed on Vercel (serverless environment), which doesn't support persistent file storage. Cloudinary provides a cloud-based image hosting solution that works perfectly with serverless functions.

## Setup Steps:

### 1. Create a Cloudinary Account
- Go to [cloudinary.com](https://cloudinary.com)
- Sign up for a free account (no credit card required)
- Free tier includes 25GB storage and 25GB bandwidth per month

### 2. Get Your Cloudinary Credentials
After signing up:
1. Go to your Cloudinary Dashboard
2. Navigate to Settings → API Security
3. Copy the following values:
   - **Cloud Name** (e.g., "your-cloud-name")
   - **API Key** (e.g., "123456789012345")
   - **API Secret** (e.g., "abcdefghijklmnopqrstuvwxyz123456")

### 3. Update Environment Variables
Add your Cloudinary credentials to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Install Cloudinary Package
The package has already been added to `package.json`. Install it:

```bash
cd backend
npm install
```

### 5. Test the Integration
After updating the `.env` file:
- Restart your backend server
- Try uploading an image from the admin panel
- The image should now be uploaded to Cloudinary and stored as a URL

## How It Works:
- **File Upload Mode**: Uploads images to Cloudinary automatically
- **URL Mode**: Works as before (pastes image URLs directly)
- **Fallback**: If Cloudinary isn't configured, it falls back to local storage (for development)

## Benefits:
- ✅ Works in serverless environments (Vercel)
- ✅ Automatic image optimization
- ✅ CDN delivery for faster loading
- ✅ Free tier sufficient for most small projects
- ✅ Secure and reliable

## Troubleshooting:
- If uploads still fail, check that your Cloudinary credentials are correct
- Make sure the `.env` file is updated with your actual credentials
- Check the backend logs for Cloudinary-specific error messages

## For Vercel Deployment:
Add the Cloudinary environment variables to your Vercel project:
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add the three Cloudinary variables with your credentials