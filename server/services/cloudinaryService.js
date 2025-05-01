const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {string} folder - Folder name on Cloudinary
 * @param {string} publicId - Public ID for the file (optional)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder, publicId) => {
  try {
    // Options for upload
    const options = {
      folder,
      resource_type: 'auto', // automatically detect resource type
      overwrite: true,
    };

    // Add public ID if provided
    if (publicId) {
      options.public_id = publicId;
    }

    // Upload file
    const result = await cloudinary.uploader.upload(filePath, options);
    
    // Delete temporary file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload a video to Cloudinary with specific video options
 * @param {string} filePath - Path to the video file to upload
 * @param {string} folder - Folder name on Cloudinary
 * @param {string} publicId - Public ID for the video (optional)
 * @param {Object} options - Additional Cloudinary upload options (optional)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadVideoToCloudinary = async (filePath, folder, publicId, options = {}) => {
  try {
    // Default options for video uploads
    const defaultOptions = {
      folder,
      resource_type: 'video',
      overwrite: true,
      // Video-specific options
      eager: [
        { format: 'mp4', transformation: [
          { quality: 'auto:good' },
          { audio_codec: 'aac' }
        ]},
        { format: 'webm', transformation: [
          { quality: 'auto:good' } 
        ]}
      ],
      eager_async: true,
      // Extract thumbnail from the video to use it as preview
      eager_notification_url: process.env.VIDEO_NOTIFICATION_URL,
      // Create a thumbnail from the video
      transformation: [
        { width: 640, height: 360, crop: "fill" }
      ]
    };

    // Add public ID if provided
    if (publicId) {
      defaultOptions.public_id = publicId;
    }

    // Merge default options with provided options
    const uploadOptions = { ...defaultOptions, ...options };

    // Upload video
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
    // Delete temporary file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result;
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - Resource type (image, video, raw, etc.)
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Get information about a video from Cloudinary
 * @param {string} publicId - Public ID of the video
 * @returns {Promise<Object>} - Cloudinary resource information
 */
const getVideoInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, { resource_type: 'video' });
    return result;
  } catch (error) {
    console.error('Error getting video info from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  uploadVideoToCloudinary,
  deleteFromCloudinary,
  getVideoInfo
};
