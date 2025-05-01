const { Video, DEFAULT_NEW_ASSET_SETTINGS, createPlaybackToken } = require('../config/mux');
const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const Chapter = mongoose.model('Chapter');

class MuxService {
  /**
   * Create a new direct upload URL for securely uploading videos to Mux
   * @param {string} contentId - The content ID this upload is associated with
   * @returns {Promise<Object>} - The direct upload URL and other details
   */
  async createDirectUpload(contentId) {
    try {
      // Create a direct upload URL that clients can use to upload videos
      const upload = await Video.Uploads.create({
        cors_origin: process.env.CLIENT_URL || '*',
        new_asset_settings: {
          ...DEFAULT_NEW_ASSET_SETTINGS,
          passthrough: contentId // Store our content ID as passthrough
        }
      });
      
      return {
        uploadId: upload.id,
        uploadUrl: upload.url,
        contentId
      };
    } catch (error) {
      console.error('Error creating direct upload:', error);
      throw new Error(`Failed to create upload URL: ${error.message}`);
    }
  }

  /**
   * Process a webhook notification from Mux about video status changes
   * @param {Object} data - The webhook payload data
   */
  async processWebhook(data) {
    try {
      // Skip if not video.asset event
      if (!data.type || !data.type.startsWith('video.asset')) {
        return;
      }
      
      const { type, data: assetData } = data;
      const contentId = assetData.passthrough;
      
      if (!contentId) {
        console.warn('Received Mux webhook without content ID passthrough');
        return;
      }
      
      // Parse the content ID to determine if it's for course chapter content
      const contentType = contentId.split('_')[0];
      const actualId = contentId.split('_')[1];
      
      if (contentType === 'chapter') {
        await this.updateChapterContent(actualId, type, assetData);
      } else {
        console.warn(`Unsupported content type in webhook: ${contentType}`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  /**
   * Update chapter content with video information
   * @param {string} chapterId - The ID of the chapter
   * @param {string} eventType - The Mux event type
   * @param {Object} assetData - The Mux asset data
   */
  async updateChapterContent(chapterId, eventType, assetData) {
    try {
      const chapter = await Chapter.findById(chapterId);
      
      if (!chapter) {
        console.error(`Chapter not found: ${chapterId}`);
        return;
      }
      
      // Find or create the content object for this video
      let videoContent = chapter.content.find(c => 
        c.type === 'video' && 
        c.videoData && 
        c.videoData.assetId === assetData.id
      );
      
      if (!videoContent) {
        // If no matching content, find the first video content without an assetId
        videoContent = chapter.content.find(c => 
          c.type === 'video' && 
          (!c.videoData || !c.videoData.assetId)
        );
        
        if (!videoContent) {
          console.error('No matching video content found in chapter');
          return;
        }
      }
      
      // Process based on the event type
      switch(eventType) {
        case 'video.asset.ready':
          videoContent.videoData = {
            ...videoContent.videoData,
            assetId: assetData.id,
            playbackId: assetData.playback_ids?.[0]?.id,
            status: 'ready',
            duration: assetData.duration,
            aspectRatio: assetData.aspect_ratio,
            maxResolution: assetData.max_stored_resolution,
            readyAt: new Date()
          };
          break;
          
        case 'video.asset.errored':
          videoContent.videoData = {
            ...videoContent.videoData,
            assetId: assetData.id,
            status: 'error',
            errorMessage: assetData.errors?.messages?.join(', ') || 'Unknown error',
            updatedAt: new Date()
          };
          break;
          
        case 'video.asset.deleted':
          if (videoContent.videoData) {
            videoContent.videoData.status = 'deleted';
            videoContent.videoData.deletedAt = new Date();
          }
          break;
          
        case 'video.asset.created':
        case 'video.asset.updated':
          videoContent.videoData = {
            ...videoContent.videoData,
            assetId: assetData.id,
            status: assetData.status,
            updatedAt: new Date()
          };
          break;
      }
      
      await chapter.save();
      console.log(`Updated chapter ${chapterId} with video status: ${eventType}`);
    } catch (error) {
      console.error(`Error updating chapter content: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a signed playback token for a content
   * @param {string} contentId - The ID of the content item
   * @param {Object} user - The user requesting the token
   * @returns {Promise<Object>} - The playback token and details
   */
  async getSignedPlaybackToken(contentId, user) {
    try {
      // Parse the content ID
      const parts = contentId.split('_');
      const contentType = parts[0];
      const id = parts[1];
      
      // Get the content based on its type
      let playbackId;
      let courseId;
      
      if (contentType === 'chapter') {
        const chapter = await Chapter.findById(id);
        if (!chapter) {
          throw new Error('Chapter not found');
        }
        
        // Find the video content in this chapter
        const videoContent = chapter.content.find(c => c.type === 'video' && c.videoData?.playbackId);
        if (!videoContent || !videoContent.videoData?.playbackId) {
          throw new Error('No video found in this chapter');
        }
        
        playbackId = videoContent.videoData.playbackId;
        courseId = chapter.courseId;
      } else {
        throw new Error(`Unsupported content type: ${contentType}`);
      }
      
      // If we have a user, verify enrollment
      if (user && user.role === 'student') {
        const course = await Course.findById(courseId);
        if (!course) {
          throw new Error('Course not found');
        }
        
        const isEnrolled = user.enrolledCourses.some(enrollment => 
          enrollment.courseId.toString() === courseId.toString()
        );
        
        if (!isEnrolled) {
          throw new Error('You are not enrolled in this course');
        }
      } else if (user && user.role !== 'admin' && user.role !== 'teacher') {
        // If not student, admin, or teacher, deny access
        throw new Error('Unauthorized');
      }
      
      // Generate the token (expires in 1 hour by default)
      const token = createPlaybackToken(playbackId);
      
      return {
        playbackId,
        token
      };
    } catch (error) {
      console.error('Error getting signed playback token:', error);
      throw error;
    }
  }
  
  /**
   * Delete a video asset from Mux
   * @param {string} assetId - The Mux asset ID
   * @returns {Promise<Object>} - Result of the deletion
   */
  async deleteVideo(assetId) {
    try {
      await Video.Assets.del(assetId);
      return { success: true, message: 'Video deleted successfully' };
    } catch (error) {
      console.error('Error deleting video:', error);
      throw new Error(`Failed to delete video: ${error.message}`);
    }
  }
}

module.exports = new MuxService();