const express = require('express');
const router = express.Router();
const muxService = require('../services/muxService');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Chapter = mongoose.model('Chapter');

/**
 * @route   POST api/secure-videos/upload-url
 * @desc    Get a direct upload URL for Mux
 * @access  Teacher/Admin only
 */
router.post('/upload-url', [
  auth,
  [
    check('contentId', 'Content ID is required').not().isEmpty(),
    check('contentType', 'Content type is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Only teachers/admins can upload videos
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to upload videos' });
    }

    const { contentType, contentId } = req.body;
    
    // Format the content identifier (type_id)
    const formattedContentId = `${contentType}_${contentId}`;
    
    // Get direct upload URL
    const result = await muxService.createDirectUpload(formattedContentId);
    
    res.json(result);
  } catch (err) {
    console.error('Error creating upload URL:', err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET api/secure-videos/token/:contentType/:id
 * @desc    Get a signed playback token for a video
 * @access  Private (with enrollment check)
 */
router.get('/token/:contentType/:id', auth, async (req, res) => {
  try {
    const { contentType, id } = req.params;
    
    if (!contentType || !id) {
      return res.status(400).json({ msg: 'Content type and ID are required' });
    }
    
    // Format the content identifier
    const contentId = `${contentType}_${id}`;
    
    // Get playback token (service handles permissions)
    const result = await muxService.getSignedPlaybackToken(contentId, req.user);
    
    res.json(result);
  } catch (err) {
    console.error('Error getting playback token:', err.message);
    
    // Return appropriate status codes for different errors
    if (err.message === 'You are not enrolled in this course') {
      return res.status(403).json({ msg: err.message });
    } else if (err.message === 'Chapter not found' || err.message === 'No video found in this chapter') {
      return res.status(404).json({ msg: err.message });
    } else if (err.message === 'Unauthorized') {
      return res.status(401).json({ msg: err.message });
    }
    
    res.status(500).send('Server error');
  }
});

/**
 * @route   POST api/secure-videos/webhook
 * @desc    Handle Mux webhooks
 * @access  Public (but verified by signature)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature (in production)
    // TODO: Add signature verification with Mux's webhook signing secret
    
    const data = JSON.parse(req.body.toString());
    
    // Process the webhook data
    await muxService.processWebhook(data);
    
    res.status(200).send('Webhook received');
  } catch (err) {
    console.error('Error processing webhook:', err.message);
    res.status(400).send('Invalid webhook payload');
  }
});

/**
 * @route   DELETE api/secure-videos/:assetId
 * @desc    Delete a video from Mux
 * @access  Teacher/Admin only
 */
router.delete('/:assetId', [auth, admin], async (req, res) => {
  try {
    const { assetId } = req.params;
    
    if (!assetId) {
      return res.status(400).json({ msg: 'Asset ID is required' });
    }
    
    // Delete the video from Mux
    await muxService.deleteVideo(assetId);
    
    res.json({ msg: 'Video deleted successfully' });
  } catch (err) {
    console.error('Error deleting video:', err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   PUT api/secure-videos/chapter/:id
 * @desc    Update a chapter with video content
 * @access  Teacher/Admin only
 */
router.put('/chapter/:id', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Only teachers/admins can update chapters
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to update chapters' });
    }

    const { id } = req.params;
    const { title, description, uploadId } = req.body;
    
    // Find the chapter
    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({ msg: 'Chapter not found' });
    }
    
    // Initialize or update the video content
    const videoContentIndex = chapter.content.findIndex(c => c.type === 'video');
    
    if (videoContentIndex >= 0) {
      // Update existing video content
      chapter.content[videoContentIndex] = {
        ...chapter.content[videoContentIndex],
        title,
        description,
        videoData: {
          ...chapter.content[videoContentIndex].videoData,
          uploadId,
          status: 'uploading',
          updatedAt: new Date()
        }
      };
    } else {
      // Add new video content
      chapter.content.push({
        type: 'video',
        title,
        description,
        videoData: {
          uploadId,
          status: 'uploading',
          createdAt: new Date()
        }
      });
    }
    
    // Save the chapter
    await chapter.save();
    
    res.json(chapter);
  } catch (err) {
    console.error('Error updating chapter with video content:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;