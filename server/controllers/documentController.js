// filepath: c:\Users\uphil\educational-website\server\controllers\documentController.js
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { pdfUpload } = require('../config/multerConfig');
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');

/**
 * Upload a PDF document to Cloudinary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get file info
    const filePath = req.file.path;
    const title = req.body.title || path.basename(req.file.originalname, path.extname(req.file.originalname));
    const description = req.body.description || '';
    const chapterId = req.body.chapterId;
    const courseId = req.body.courseId;

    // Default folder for documents
    let folder = 'educational-website/documents';
    
    // If course or chapter ID provided, organize into subdirectories
    if (courseId) {
      folder += `/course_${courseId}`;
      if (chapterId) {
        folder += `/chapter_${chapterId}`;
      }
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: folder,
      public_id: `${Date.now()}_${path.basename(req.file.originalname, path.extname(req.file.originalname))}`,
      format: 'pdf'
    });

    // If chapter ID is provided, add as content
    if (chapterId) {
      const chapter = await Chapter.findById(chapterId);
      
      if (!chapter) {
        return res.status(404).json({ message: 'Chapter not found' });
      }
      
      // Add document as content to the chapter
      chapter.contents.push({
        type: 'pdf',
        title: title,
        description: description,
        file: result.secure_url,
        publicId: result.public_id,
        status: 'ready'
      });
      
      await chapter.save();
    }

    // Delete the temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    // Return success response
    res.status(200).json({
      message: 'Document uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      title: title,
      description: description
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading document', 
      error: error.message 
    });
  }
};

/**
 * Delete a document from Cloudinary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    
    if (result.result !== 'ok') {
      return res.status(400).json({ message: 'Failed to delete document' });
    }
    
    // Find and update any chapters that use this document
    await Chapter.updateMany(
      { 'contents.publicId': publicId },
      { $pull: { contents: { publicId } } }
    );
    
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Document delete error:', error);
    res.status(500).json({ 
      message: 'Error deleting document', 
      error: error.message 
    });
  }
};

module.exports = exports;
