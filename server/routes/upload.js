const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'educational_website',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Initialize multer with the Cloudinary storage
const upload = multer({ storage: storage });

/**
 * Upload an image to Cloudinary
 * POST /api/upload
 */
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Return the uploaded image URL
    return res.status(200).json({ 
      imageUrl: req.file.path,
      publicId: req.file.filename 
    });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return res.status(500).json({ message: 'Failed to upload image' });
  }
});

/**
 * Delete an image from Cloudinary
 * DELETE /api/upload/:publicId
 */
router.delete('/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      return res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      return res.status(400).json({ message: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Upload a profile image to Cloudinary
 * POST /api/upload/profile
 */
router.post('/profile', auth, (req, res, next) => {
  console.log('Profile upload request received');
  console.log('Headers:', req.headers);
  console.log('Auth user:', req.user);
  next();
}, upload.single('image'), async (req, res) => {
  try {
    console.log('Processing profile image upload...');
    
    if (!req.file) {
      console.log('Profile image upload failed: No file received');
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('Profile image uploaded successfully:', {
      file: req.file,
      path: req.file.path,
      url: req.file.path
    });

    // Make sure the URL is in the correct format - must be absolute and secure (https)
    let imageUrl = req.file.path;
    
    // If the URL doesn't start with https://, ensure it's properly formatted
    if (!imageUrl.startsWith('https://')) {
      // Some Cloudinary setups might return a path rather than a full URL
      if (imageUrl.startsWith('/')) {
        imageUrl = `https://res.cloudinary.com/${cloudinary.config().cloud_name}${imageUrl}`;
      } else {
        // Otherwise, just make sure it's using https
        imageUrl = imageUrl.replace('http://', 'https://');
      }
    }

    console.log('Returning image URL to client:', imageUrl);

    // Return the properly formatted uploaded profile image URL
    return res.status(200).json({ 
      imageUrl: imageUrl,
      publicId: req.file.filename,
      success: true
    });
  } catch (error) {
    console.error('Error uploading profile image to Cloudinary:', error);
    return res.status(500).json({ message: 'Failed to upload profile image', error: error.message });  }
});

/**
 * Upload a blog cover image to Cloudinary
 * POST /api/upload/blog
 */
router.post('/blog', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Configure specific folder for blog images
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'blog_images',
      transformation: [
        { width: 1200, height: 630, crop: 'fill', quality: 'auto' }
      ]
    });

    // Return the uploaded image URL
    return res.status(200).json({ 
      imageUrl: result.secure_url,
      publicId: result.public_id,
      success: true
    });
  } catch (error) {
    console.error('Error uploading blog image to Cloudinary:', error);
    return res.status(500).json({ message: 'Failed to upload blog image', error: error.message });
  }
});

module.exports = router;
