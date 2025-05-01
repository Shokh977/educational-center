const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const auth = require('../middleware/auth');

// Get a single course with chapters
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate({
        path: 'chapters',
        options: { sort: { order: 1 } }
      });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enroll in a course
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is already enrolled
    if (course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Add user to enrolled students
    course.enrolledStudents.push(req.user.id);
    await course.save();
    
    res.json({ message: 'Successfully enrolled in course', course });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all courses (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, level, search } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    // Apply category filter
    if (category && category !== "All") {
      filter.category = category;
    }
    
    // Apply level filter
    if (level && level !== "All") {
      filter.level = level;
    }
    
    // Apply search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const courses = await Course.find(filter)
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;