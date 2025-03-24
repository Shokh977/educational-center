const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const SuccessStory = require('../models/SuccessStory');

// Get featured courses
router.get('/featured-courses', async (req, res) => {
  try {
    const featuredCourses = await Course.find({ featured: true })
      .populate('instructor', 'name')
      .sort({ rating: -1 })
      .limit(6);
    
    res.json(featuredCourses);
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    res.status(500).json({ message: 'Error fetching featured courses', error: error.message });
  }
});

// Get featured teachers
router.get('/featured-teachers', async (req, res) => {
  try {
    const featuredTeachers = await User.find({ role: 'teacher', featured: true })
      .select('name image title department')
      .sort({ createdAt: -1 })
      .limit(3);
    
    res.json(featuredTeachers);
  } catch (error) {
    console.error('Error fetching featured teachers:', error);
    res.status(500).json({ message: 'Error fetching featured teachers', error: error.message });
  }
});

// Get top performing students
router.get('/top-students', async (req, res) => {
  try {
    const topStudents = await User.find({ role: 'student' })
      .sort({ gpa: -1 })
      .select('name grade gpa examScore achievements')
      .limit(3);
    
    res.json(topStudents);
  } catch (error) {
    console.error('Error fetching top students:', error);
    res.status(500).json({ message: 'Error fetching top students', error: error.message });
  }
});

// Get success stories
router.get('/success-stories', async (req, res) => {
  try {
    const successStories = await SuccessStory.find()
      .sort({ createdAt: -1 })
      .limit(2);
    
    res.json(successStories);
  } catch (error) {
    console.error('Error fetching success stories:', error);
    res.status(500).json({ message: 'Error fetching success stories', error: error.message });
  }
});

// Get all courses with optional filtering
router.get('/courses', async (req, res) => {
  try {
    const { category, level, search } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    // Apply category filter (if not "All Languages")
    if (category && category !== "All Languages") {
      filter.category = category;
    }
    
    // Apply level filter (if not "All Levels")
    if (level && level !== "All Levels") {
      filter.level = level.toLowerCase();
    }
    
    // Apply search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    const courses = await Course.find(filter)
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
});

// Get teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('name image title department specializations')
      .sort({ createdAt: -1 });
    
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
});

module.exports = router;