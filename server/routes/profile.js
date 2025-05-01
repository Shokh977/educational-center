const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Try to load the Course and Comment models, but don't fail if they don't exist yet
let Course, Comment;
try {
  Course = require('../models/Course');
} catch (error) {
  console.warn('Course model not available yet, skipping Course updates in profile');
}

try {
  Comment = require('../models/Comment');
} catch (error) {
  console.warn('Comment model not available yet, skipping Comment updates in profile');
}

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile data
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

/**
 * @route   PUT /api/profile/update
 * @desc    Update user profile information globally
 * @access  Private
 */
router.put('/update', auth, async (req, res) => {
  try {
    const { name, profileImage } = req.body;
    const userId = req.user.id;
    
    if (!name && !profileImage) {
      return res.status(400).json({ message: 'No update information provided' });
    }
    
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Update the user's own profile
      const updateData = {};
      if (name) updateData.name = name;
      if (profileImage) updateData.profileImage = profileImage;
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, session }
      ).select('-password');
      
      if (!updatedUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'User not found' });
      }
      
      // 2. Update user information in courses (if they're an instructor and Course model exists)
      if (Course && (updatedUser.role === 'instructor' || updatedUser.role === 'admin')) {
        await Course.updateMany(
          { instructor: userId },
          { 
            $set: { 
              instructorName: name || updatedUser.name,
              instructorImage: profileImage || updatedUser.profileImage
            } 
          },
          { session }
        );
      }
      
      // 3. Update user information in comments (if Comment model exists)
      if (Comment) {
        await Comment.updateMany(
          { user: userId },
          { 
            $set: { 
              userName: name || updatedUser.name,
              userImage: profileImage || updatedUser.profileImage
            } 
          },
          { session }
        );
      }
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      // Include cache control headers to ensure fresh data
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.json({ 
        success: true, 
        user: updatedUser,
        message: 'Profile updated successfully'
      });
      
    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

module.exports = router;
