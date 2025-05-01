// filepath: c:\Users\uphil\educational-website\server\routes\chapterContent.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { videoUpload, pdfUpload } = require('../config/multerConfig');
const chapterContentController = require('../controllers/chapterContentController');

/**
 * @route   POST /api/chapters/:chapterId/video
 * @desc    Add video content to a chapter
 * @access  Private (Instructor/Admin)
 */
router.post(
  '/:chapterId/video',
  auth,
  videoUpload.single('video'),
  chapterContentController.addVideoContent
);

/**
 * @route   POST /api/chapters/:chapterId/pdf
 * @desc    Add PDF content to a chapter
 * @access  Private (Instructor/Admin)
 */
router.post(
  '/:chapterId/pdf',
  auth,
  pdfUpload.single('file'),
  chapterContentController.addPdfContent
);

/**
 * @route   POST /api/chapters/:chapterId/quiz
 * @desc    Add quiz content to a chapter
 * @access  Private (Instructor/Admin)
 */
router.post(
  '/:chapterId/quiz',
  auth,
  chapterContentController.addQuizContent
);

module.exports = router;
