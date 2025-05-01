const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const auth = require('../middleware/auth');

// Get all modules for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const modules = await Module.find({ course: req.params.courseId })
      .sort({ order: 1 });
    
    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single module
router.get('/:id', async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json(module);
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark module as completed
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    // Add the user ID to the list of users who completed this module
    if (!module.completedBy.includes(req.user.id)) {
      module.completedBy.push(req.user.id);
      await module.save();
    }
    
    res.json({ message: 'Module marked as completed', module });
  } catch (error) {
    console.error('Error marking module as completed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;