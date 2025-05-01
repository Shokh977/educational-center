// filepath: c:\Users\uphil\educational-website\server\controllers\chapterContentController.js
const Chapter = require('../models/Chapter');
const Course = require('../models/Course');
const { uploadVideoToCloudinary } = require('../services/cloudinaryService');
const fs = require('fs');
const path = require('path');

/**
 * Add video content to a chapter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addVideoContent = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title, description, publicId, url, duration, thumbnailUrl } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Video title is required' });
    }
    
    if (!url && !req.file) {
      return res.status(400).json({ message: 'Video file or URL is required' });
    }
    
    // Find the chapter
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    // Find the course to check permissions
    const course = await Course.findById(chapter.course);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user has permission (instructor or admin)
    if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add content to this chapter' });
    }
    
    // Create content item
    const videoContent = {
      type: 'video',
      title,
      description,
      order: chapter.contents.length + 1,
      status: 'ready'
    };
    
    // Handle direct URL submission
    if (url && publicId) {
      videoContent.file = url;
      videoContent.publicId = publicId;
      if (duration) videoContent.duration = duration;
      if (thumbnailUrl) videoContent.thumbnailUrl = thumbnailUrl;
    }
    // Handle file upload
    else if (req.file) {
      const filePath = req.file.path;
      const folder = `educational-website/courses/${course._id}/chapter_${chapter._id}`;
      
      try {
        // Upload to Cloudinary
        const result = await uploadVideoToCloudinary(filePath, folder);
        
        // Update content with Cloudinary info
        videoContent.file = result.secure_url;
        videoContent.publicId = result.public_id;
        videoContent.duration = result.duration?.toString();
        videoContent.thumbnailUrl = result.thumbnail_url;
        
        // Delete local file after upload
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting temporary file:', err);
        });
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        return res.status(500).json({ message: 'Error uploading video to cloud storage' });
      }
    }
    
    // Add content to chapter
    chapter.contents.push(videoContent);
    await chapter.save();
    
    res.status(201).json({
      message: 'Video content added successfully',
      content: videoContent
    });
  } catch (error) {
    console.error('Error adding video content:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Add PDF content to a chapter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addPdfContent = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title, description, url, publicId } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'PDF title is required' });
    }
    
    if (!url && !req.file) {
      return res.status(400).json({ message: 'PDF file or URL is required' });
    }
    
    // Find the chapter
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    // Find the course to check permissions
    const course = await Course.findById(chapter.course);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user has permission (instructor or admin)
    if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add content to this chapter' });
    }
    
    // Create content item
    const pdfContent = {
      type: 'pdf',
      title,
      description,
      order: chapter.contents.length + 1,
      status: 'ready'
    };
    
    // Handle direct URL submission
    if (url) {
      pdfContent.file = url;
      if (publicId) pdfContent.publicId = publicId;
    }
    // For file upload, we rely on documentController to handle the details
    // This function is just for direct URL submission
    
    // Add content to chapter
    chapter.contents.push(pdfContent);
    await chapter.save();
    
    res.status(201).json({
      message: 'PDF content added successfully',
      content: pdfContent
    });
  } catch (error) {
    console.error('Error adding PDF content:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Add quiz content to a chapter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addQuizContent = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title, description, questions } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Quiz title is required' });
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Quiz must have at least one question' });
    }
    
    // Validate each question
    const validQuestions = questions.filter(q => 
      q.question && Array.isArray(q.options) && 
      q.options.length > 1 && typeof q.correctAnswer === 'number' && 
      q.correctAnswer >= 0 && q.correctAnswer < q.options.length
    );
    
    if (validQuestions.length !== questions.length) {
      return res.status(400).json({ 
        message: 'One or more questions are invalid. Each question must have a question text, at least 2 options, and a valid correctAnswer index' 
      });
    }
    
    // Find the chapter
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    // Find the course to check permissions
    const course = await Course.findById(chapter.course);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user has permission (instructor or admin)
    if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add content to this chapter' });
    }
    
    // Create quiz content
    const quizContent = {
      type: 'quiz',
      title,
      description,
      questions: validQuestions,
      order: chapter.contents.length + 1,
      status: 'ready'
    };
    
    // Add content to chapter
    chapter.contents.push(quizContent);
    await chapter.save();
    
    res.status(201).json({
      message: 'Quiz content added successfully',
      content: quizContent
    });
  } catch (error) {
    console.error('Error adding quiz content:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;
