const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { videoUpload } = require('../config/multerConfig');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/videos/upload
 * @desc    Upload a video to Cloudinary
 * @access  Private (Instructor/Admin)
 */
router.post(
  '/upload', 
  auth, 
  videoUpload.single('video'), 
  videoController.uploadVideo
);

/**
 * @route   DELETE /api/videos/:publicId
 * @desc    Delete a video from Cloudinary
 * @access  Private (Instructor/Admin)
 */
router.delete(
  '/:publicId', 
  auth, 
  videoController.deleteVideo
);

/**
 * @route   PUT /api/videos/replace
 * @desc    Replace an existing video with a new one
 * @access  Private (Instructor/Admin)
 */
router.put(
  '/replace', 
  auth, 
  videoUpload.single('video'), 
  videoController.replaceVideo
);

/**
 * @route   GET /api/videos/test-config
 * @desc    Test Cloudinary configuration
 * @access  Private (Instructor/Admin)
 */
router.get(
  '/test-config',
  auth,
  (req, res) => {
    try {
      const cloudinary = require('cloudinary').v2;
      
      const config = {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key_partial: process.env.CLOUDINARY_API_KEY ? 
          `${process.env.CLOUDINARY_API_KEY.substring(0, 4)}...${process.env.CLOUDINARY_API_KEY.substring(process.env.CLOUDINARY_API_KEY.length - 4)}` : 
          'not set',
        api_secret_set: process.env.CLOUDINARY_API_SECRET ? 'Yes' : 'No',
        secure: cloudinary.config().secure,
        configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
      };
      
      res.json({
        message: 'Cloudinary configuration check',
        config,
        status: config.configured ? 'ready' : 'not configured'
      });
    } catch (error) {
      console.error('Cloudinary config test error:', error);
      res.status(500).json({ message: 'Error checking Cloudinary config', error: error.message });
    }
  }
);

// Handle multer errors
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      message: 'File too large. Maximum file size is 100MB.' 
    });
  }
  
  if (err.message && err.message.startsWith('Unsupported file type')) {
    return res.status(415).json({ message: err.message });
  }
  
  console.error('Video upload error:', err);
  return res.status(500).json({ 
    message: 'An error occurred during file upload', 
    error: err.message 
  });
});

module.exports = router;
