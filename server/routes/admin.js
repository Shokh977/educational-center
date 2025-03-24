const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Course = require('../models/Course');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const Chapter = require('../models/Chapter');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminAuth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    if (file.fieldname === 'thumbnail') {
      uploadPath = path.join(__dirname, '../uploads/thumbnails');
    } else if (['video', 'pdf'].includes(file.mimetype.split('/')[0]) || file.mimetype === 'application/pdf') {
      uploadPath = path.join(__dirname, '../uploads/content');
    } else {
      uploadPath = path.join(__dirname, '../uploads/other');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    // Accept only images for thumbnails
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails!'), false);
    }
  } else if (file.fieldname === 'file') {
    // Accept videos and PDFs for content
    if (file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only video or PDF files are allowed for content!'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB file size limit
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Update user role
router.patch('/users/:userId/role', adminAuth, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['student', 'teacher', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
});

// Delete user
router.delete('/users/:userId', adminAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// Get all courses
router.get('/courses', adminAuth, async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
});

// Create course
router.post('/courses', [authMiddleware, adminMiddleware, upload.single('thumbnail')], async (req, res) => {
  try {
    const { title, description, category, price, level, duration } = req.body;
    
    // Get the thumbnail path if uploaded
    const thumbnail = req.file ? 
      `/uploads/thumbnails/${path.basename(req.file.path)}` : 
      'default-course.jpg';
    
    // Create the course
    const course = new Course({
      title,
      description,
      instructor: req.user.id, // Current admin user is the instructor
      category,
      duration,
      price: parseFloat(price),
      level,
      thumbnail
    });
    
    await course.save();
    
    res.status(201).json(course);
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update course status
router.patch('/courses/:courseId/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const course = await Course.findByIdAndUpdate(
            req.params.courseId,
            { status },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error updating course status', error: error.message });
    }
});

// Delete course
router.delete('/courses/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if the admin is the instructor of the course
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }
    
    // Delete the thumbnail if it's not the default
    if (course.thumbnail !== 'default-course.jpg') {
      const thumbnailPath = path.join(__dirname, '..', course.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }
    
    // Delete all chapters and their content
    for (const chapterId of course.chapters) {
      const chapter = await Chapter.findById(chapterId);
      
      if (chapter) {
        // Delete content files
        for (const content of chapter.contents) {
          if (content.file) {
            const contentPath = path.join(__dirname, '..', content.file);
            if (fs.existsSync(contentPath)) {
              fs.unlinkSync(contentPath);
            }
          }
        }
        
        // Delete the chapter
        await Chapter.findByIdAndDelete(chapterId);
      }
    }
    
    // Delete the course
    await Course.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Change admin password
router.patch('/change-password', adminAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Verify current password
        const admin = await User.findById(req.user._id);
        const isMatch = await admin.comparePassword(currentPassword);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        await admin.save();
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
});

// Get exam analytics (assuming this is the intended route for the fragment found)
router.get('/analytics/exams', adminAuth, async (req, res) => {
    try {
        const examStats = await Course.aggregate([
            // Your aggregation pipeline here
            { 
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'courseDetails'
                }
            },
            { $unwind: '$courseDetails' }
        ]);

        res.json(examStats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam analytics', error: error.message });
    }
});

// Get user activity analytics
router.get('/analytics/users', adminAuth, async (req, res) => {
    try {
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalUsers = await User.countDocuments();
        
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        const recentLogins = await User.find()
            .sort({ lastLogin: -1 })
            .limit(10)
            .select('name email role lastLogin');

        const userActivity = {
            activeUsers,
            totalUsers,
            usersByRole,
            recentLogins
        };

        res.json(userActivity);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user analytics', error: error.message });
    }
});

// Get course performance analytics
router.get('/analytics/courses', adminAuth, async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        
        const popularCourses = await Course.aggregate([
            { $project: { 
                title: 1, 
                enrollmentCount: { $size: "$enrolledStudents" },
                rating: 1
            }},
            { $sort: { enrollmentCount: -1 } },
            { $limit: 5 }
        ]);

        const coursesWithRatings = await Course.find({ 'reviews.0': { $exists: true } })
            .select('title reviews')
            .sort({ 'rating': -1 });

        const courseStats = {
            totalCourses,
            popularCourses,
            coursesWithRatings
        };

        res.json(courseStats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course analytics', error: error.message });
    }
});

// Get detailed user progress
router.get('/analytics/user-progress/:userId', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password')
            .populate('enrolledCourses');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const courseProgress = await Promise.all(user.enrolledCourses.map(async (course) => {
            const progress = await Course.findById(course._id)
                .select('title modules')
                .lean();
            
            return {
                courseId: course._id,
                title: progress.title,
                completedModules: course.completedModules?.length || 0,
                totalModules: progress.modules?.length || 0,
                progress: progress.modules?.length 
                    ? (course.completedModules?.length / progress.modules.length) * 100 
                    : 0
            };
        }));

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin,
                isActive: user.isActive
            },
            courseProgress
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user progress', error: error.message });
    }
});

// Create new course
router.post('/courses', auth, admin, async (req, res) => {
  try {
    const course = new Course({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      instructor: req.user.id
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add chapter to course
router.post('/courses/:courseId/chapters', auth, admin, async (req, res) => {
  try {
    const chapter = new Chapter({
      title: req.body.title,
      description: req.body.description,
      order: req.body.order,
      course: req.params.courseId
    });
    await chapter.save();
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload content to chapter
router.post('/chapters/:chapterId/content', auth, admin, upload.single('file'), async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    const content = {
      type: req.body.type,
      title: req.body.title,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      duration: req.body.duration,
      questions: req.body.questions ? JSON.parse(req.body.questions) : []
    };
    chapter.contents.push(content);
    await chapter.save();
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;