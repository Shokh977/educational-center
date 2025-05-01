const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { courseUpload, contentUpload } = require('../config/multerConfig');

// Public routes
router.get('/', courseController.getCourses);
router.get('/:courseId', courseController.getCourseById);
router.get('/:courseId/preview', courseController.getCoursePreview);

// Authenticated routes
router.use(auth);

// Enrollment routes
router.post('/:courseId/enroll', courseController.enrollInCourse);
router.get('/:courseId/progress', courseController.getUserCourseProgress);
router.post('/:courseId/chapters/:chapterId/contents/:contentId/complete', courseController.markContentCompleted);

// Instructor routes - require authentication
router.post('/', courseUpload.single('thumbnail'), courseController.createCourse);
router.post('/:courseId/chapters', courseController.addChapter);
router.post('/:courseId/chapters/:chapterId/contents', contentUpload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), courseController.addContent);
router.put('/:courseId', courseUpload.single('thumbnail'), courseController.updateCourse);
router.patch('/:courseId/status', courseController.togglePublishStatus);
router.put('/:courseId/chapters/order', courseController.updateChapterOrder);
router.get('/:courseId/students', courseController.getEnrolledStudents);
router.delete('/:courseId', courseController.deleteCourse);

module.exports = router;