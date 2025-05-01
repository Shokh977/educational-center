const path = require('path');
const { uploadVideoToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const mongoose = require('mongoose');

/**
 * Controller for handling video uploads and operations
 */
class VideoController {
  /**
   * Upload a video to Cloudinary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadVideo(req, res) {
    try {
      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ message: 'No video file uploaded' });
      }

      // Get file path from multer
      const filePath = req.file.path;
      
      // Get folder and public ID from request body (or use defaults)
      const folder = req.body.folder || 'course_videos';
      const publicId = req.body.publicId || `video_${Date.now()}`;
      
      // Get additional metadata from request
      const { title, description, courseId, chapterId, contentId } = req.body;

      // Upload video to Cloudinary
      const result = await uploadVideoToCloudinary(filePath, folder, publicId);
      
      // Prepare response with relevant information
      const videoData = {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        resourceType: result.resource_type,
        duration: result.duration, // in seconds
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        thumbnailUrl: result.thumbnail_url || null,
        eager: result.eager || [],
        playbackUrls: {
          mp4: result.secure_url,
          // Extract other format URLs from eager array if available
          ...result.eager?.reduce((acc, eager) => {
            if (eager.format && eager.secure_url) {
              acc[eager.format] = eager.secure_url;
            }
            return acc;
          }, {})
        }
      };

      // If course and chapter information is provided, update the course
      if (courseId && chapterId && contentId) {
        try {
          // Find the chapter
          const chapter = await Chapter.findById(chapterId);
          
          if (chapter) {
            // Find the content item in the chapter
            const contentItem = chapter.contents.id(contentId);
            
            if (contentItem && contentItem.type === 'video') {
              // Update content item with video data
              contentItem.file = result.secure_url;
              contentItem.publicId = result.public_id;
              contentItem.status = 'ready';
              contentItem.duration = result.duration ? 
                `${Math.floor(result.duration / 60)}:${(result.duration % 60).toString().padStart(2, '0')}` : 
                contentItem.duration;
              
              await chapter.save();
            }
          }
          
          // Update course total duration
          if (result.duration) {
            const course = await Course.findById(courseId);
            if (course) {
              // Convert duration from seconds to string format (e.g. "1h 30m")
              const durationInMinutes = Math.round(result.duration / 60);
              const hours = Math.floor(durationInMinutes / 60);
              const minutes = durationInMinutes % 60;
              
              // Update total course duration (assuming it's stored as a string like "1h 30m")
              if (course.totalDuration) {
                // Parse existing duration
                const regex = /(\d+)h\s+(\d+)m/;
                const match = course.totalDuration.match(regex);
                
                if (match) {
                  const existingHours = parseInt(match[1]);
                  const existingMinutes = parseInt(match[2]);
                  
                  // Calculate new duration
                  const totalMinutes = existingHours * 60 + existingMinutes + durationInMinutes;
                  const newHours = Math.floor(totalMinutes / 60);
                  const newMinutes = totalMinutes % 60;
                  
                  course.totalDuration = `${newHours}h ${newMinutes}m`;
                } else {
                  course.totalDuration = `${hours}h ${minutes}m`;
                }
              } else {
                course.totalDuration = `${hours}h ${minutes}m`;
              }
              
              await course.save();
            }
          }
        } catch (dbError) {
          console.error('Error updating course with video data:', dbError);
          // Continue with response, but log the error
        }
      }

      // Send success response
      res.status(200).json({
        message: 'Video uploaded successfully',
        video: videoData,
        metadata: {
          title: title || req.file.originalname,
          description: description || ''
        }
      });
    } catch (error) {
      console.error('Error in uploadVideo:', error);
      res.status(500).json({ 
        message: 'Failed to upload video', 
        error: error.message 
      });
    }
  }

  /**
   * Delete a video from Cloudinary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteVideo(req, res) {
    try {
      const { publicId } = req.params;
      
      if (!publicId) {
        return res.status(400).json({ message: 'Public ID is required' });
      }
      
      // Delete from Cloudinary
      const result = await deleteFromCloudinary(publicId, 'video');
      
      res.status(200).json({
        message: 'Video deleted successfully',
        result
      });
    } catch (error) {
      console.error('Error in deleteVideo:', error);
      res.status(500).json({ 
        message: 'Failed to delete video', 
        error: error.message 
      });
    }
  }

  /**
   * Replace an existing video with a new one
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async replaceVideo(req, res) {
    try {
      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ message: 'No video file uploaded' });
      }

      const { publicId, courseId, chapterId, contentId } = req.body;
      
      if (!publicId) {
        return res.status(400).json({ message: 'Public ID of video to replace is required' });
      }
      
      // Try to delete the old video first
      try {
        await deleteFromCloudinary(publicId, 'video');
      } catch (deleteError) {
        console.warn('Could not delete old video, continuing with upload:', deleteError.message);
      }
      
      // Upload the new video with the same public ID
      const filePath = req.file.path;
      const folder = publicId.substring(0, publicId.lastIndexOf('/'));
      const justId = publicId.substring(publicId.lastIndexOf('/') + 1);
      
      const result = await uploadVideoToCloudinary(filePath, folder, justId);
      
      // Prepare response with relevant information
      const videoData = {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        resourceType: result.resource_type,
        duration: result.duration,
        width: result.width,
        height: result.height,
        bytes: result.bytes
      };
      
      // Update content item in database if IDs are provided
      if (courseId && chapterId && contentId) {
        try {
          const chapter = await Chapter.findById(chapterId);
          
          if (chapter) {
            const contentItem = chapter.contents.id(contentId);
            
            if (contentItem && contentItem.type === 'video') {
              contentItem.file = result.secure_url;
              contentItem.status = 'ready';
              contentItem.duration = result.duration ? 
                `${Math.floor(result.duration / 60)}:${(result.duration % 60).toString().padStart(2, '0')}` : 
                contentItem.duration;
                
              await chapter.save();
            }
          }
        } catch (dbError) {
          console.error('Error updating course with video data:', dbError);
        }
      }
      
      res.status(200).json({
        message: 'Video replaced successfully',
        video: videoData
      });
    } catch (error) {
      console.error('Error in replaceVideo:', error);
      res.status(500).json({ 
        message: 'Failed to replace video', 
        error: error.message 
      });
    }
  }
}

module.exports = new VideoController();
