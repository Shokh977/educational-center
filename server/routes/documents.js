// filepath: c:\Users\uphil\educational-website\server\routes\documents.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { pdfUpload } = require('../config/multerConfig');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/upload/document
 * @desc    Upload a document (PDF) to Cloudinary
 * @access  Private (Instructor/Admin)
 */
router.post(
  '/document', 
  auth, 
  pdfUpload.single('file'), 
  documentController.uploadDocument
);

/**
 * @route   DELETE /api/upload/document/:publicId
 * @desc    Delete a document from Cloudinary
 * @access  Private (Instructor/Admin)
 */
router.delete(
  '/document/:publicId', 
  auth, 
  documentController.deleteDocument
);

// Handle multer errors
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      message: 'File too large. Maximum file size is 20MB.' 
    });
  }
  
  if (err.message && err.message.startsWith('Unsupported file type')) {
    return res.status(415).json({ message: err.message });
  }
  
  console.error('Document upload error:', err);
  return res.status(500).json({ 
    message: 'An error occurred during file upload', 
    error: err.message 
  });
});

module.exports = router;
