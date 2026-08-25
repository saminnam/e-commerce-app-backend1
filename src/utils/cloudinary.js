import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary is configured
const isConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET;
};

// Upload image to Cloudinary
export const uploadToCloudinary = async (file, folder = 'products') => {
  try {
    if (!isConfigured()) {
      console.warn('Cloudinary not configured, using placeholder');
      return null;
    }

    // If file is a buffer (from multer memory storage)
    if (file.buffer) {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'auto',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
              { width: 800, crop: 'limit' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        ).end(file.buffer);
      });
    }
    
    return null;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

// Upload multiple images to Cloudinary
export const uploadMultipleToCloudinary = async (files, folder = 'products') => {
  try {
    if (!isConfigured()) {
      console.warn('Cloudinary not configured, using placeholders');
      return [];
    }

    const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null);
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    return [];
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!isConfigured()) {
      return;
    }
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

export default cloudinary;