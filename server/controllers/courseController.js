const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const mongoose = require('mongoose');

/**
 * Controller for course-related operations
 */
class CourseController {
  /**
   * Create a new course
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createCourse(req, res) {
    try {
      const { 
        title, 
        description, 
        price, 
        category, 
        level, 
        duration,
        requirements,
        tags 
      } = req.body;
      
      const instructor = req.user.userId;

      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }

      // Parse arrays if they are passed as strings
      let parsedRequirements = requirements;
      let parsedTags = tags;
      
      if (typeof requirements === 'string') {
        try {
          parsedRequirements = JSON.parse(requirements);
        } catch (err) {
          parsedRequirements = [];
        }
      }
      
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (err) {
          parsedTags = [];
        }
      }

      // Create a new course
      const course = new Course({
        title,
        description,
        price: price || 0, // default to free if price not provided
        instructor,
        category: category || 'Uncategorized',
        level: level || 'beginner',
        duration: duration || 'Self-paced',
        requirements: parsedRequirements || [],
        tags: parsedTags || [],
        status: 'draft', // default to draft
      });      // Handle thumbnail upload if provided
      if (req.file) {
        const result = await uploadToCloudinary(
          req.file.path,
          'course_thumbnails',
          `course_${course._id}_thumbnail`
        );
        
        if (result && result.secure_url) {
          course.thumbnail = result.secure_url;
        }
      }

      await course.save();
      res.status(201).json({ 
        message: 'Course created successfully', 
        courseId: course._id,
        course 
      });
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Add a chapter to a course
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addChapter(req, res) {
    try {
      const { courseId } = req.params;
      const { title, description, order } = req.body;

      // Validate required fields
      if (!title) {
        return res.status(400).json({ message: 'Chapter title is required' });
      }

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if user has permission (instructor or admin)
      if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to add chapters to this course' });
      }

      // Create a new chapter
      const chapter = new Chapter({
        title,
        description,
        course: courseId,
        order: order || (await Chapter.countDocuments({ course: courseId })) + 1,
        contents: [] // Empty contents initially
      });

      await chapter.save();

      // Add the chapter to the course's chapters array
      course.chapters.push(chapter._id);
      await course.save();

      res.status(201).json({ 
        message: 'Chapter added successfully', 
        chapterId: chapter._id,
        chapter 
      });
    } catch (error) {
      console.error('Error adding chapter:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Add content to a chapter
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addContent(req, res) {
    try {
      const { chapterId } = req.params;
      const { type, title, description, order, questions, isFree } = req.body;

      // Validate required fields
      if (!type || !title) {
        return res.status(400).json({ message: 'Content type and title are required' });
      }

      // Validate content type
      if (!['video', 'pdf', 'quiz'].includes(type)) {
        return res.status(400).json({ message: 'Invalid content type. Must be video, pdf, or quiz' });
      }

      // Find the chapter
      const chapter = await Chapter.findById(chapterId);
      if (!chapter) {
        return res.status(404).json({ message: 'Chapter not found' });
      }

      // Find the course to check permissions
      const course = await Course.findById(chapter.course);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if user has permission (instructor or admin)
      if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to add content to this chapter' });
      }      // Create content item based on type
      const contentItem = {
        type,
        title,
        description,
        order: order || chapter.contents.length + 1,
        isFree: isFree === true || isFree === 'true' // Default to false if not explicitly set to true
      };

      // Handle file uploads for video or PDF
      if ((type === 'video' || type === 'pdf') && req.file) {
        // Save file information
        contentItem.file = req.file.path; // Temporary path to the file
        contentItem.status = 'ready';
        
        // If content has cloudinary URL and public ID
        if (req.body.url && req.body.publicId) {
          contentItem.file = req.body.url;
          contentItem.publicId = req.body.publicId;
          contentItem.status = 'ready';
        }
        
        // For videos, save additional metadata if available
        if (type === 'video') {
          if (req.body.duration) contentItem.duration = req.body.duration;
          if (req.body.thumbnailUrl) contentItem.thumbnailUrl = req.body.thumbnailUrl;
        }
      }
        );

        if (validQuestions.length !== questions.length) {
          return res.status(400).json({ 
            message: 'Invalid question format. Each question must have a question, options array, and correctAnswer' 
          });
        }

        contentItem.questions = questions;
      }      else if (type === 'video') {
        // For videos, handle the upload process
        contentItem.status = 'draft';
        contentItem.duration = req.body.duration || '00:00:00'; // Will be updated later

        // Handle video upload if provided directly (non-MUX workflow)
        if (req.files && req.files.video) {
          try {
            const result = await uploadToCloudinary(
              req.files.video[0].path,
              'course_videos',
              `chapter_${chapterId}_video_${Date.now()}`
            );
            
            if (result && result.secure_url) {
              contentItem.file = result.secure_url;
              contentItem.status = 'ready';
            }
          } catch (uploadError) {
            console.error('Video upload error:', uploadError);
            return res.status(400).json({ message: 'Video upload failed', error: uploadError.message });
          }
        }
      }
      else if (type === 'pdf') {
        // For PDFs, handle file upload
        if (req.files && req.files.file) {
          const result = await uploadToCloudinary(
            req.files.file[0].path,
            'course_pdfs',
            `chapter_${chapterId}_pdf_${Date.now()}`
          );
          
          if (result && result.secure_url) {
            contentItem.file = result.secure_url;
            contentItem.status = 'ready';
          } else {
            return res.status(400).json({ message: 'PDF upload failed' });
          }
        } else {
          return res.status(400).json({ message: 'PDF file is required for PDF content type' });
        }
      }

      // Add content to chapter
      chapter.contents.push(contentItem);
      await chapter.save();

      // Update the course's total lectures count
      course.totalLectures = (course.totalLectures || 0) + 1;
      await course.save();

      res.status(201).json({ 
        message: 'Content added successfully', 
        contentId: chapter.contents[chapter.contents.length - 1]._id,
        content: chapter.contents[chapter.contents.length - 1]
      });
    } catch (error) {
      console.error('Error adding content:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get all courses (with optional filters)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCourses(req, res) {
    try {
      const { category, search, level, instructor, page = 1, limit = 10, priceRange, sortBy = 'createdAt' } = req.query;
      const skip = (page - 1) * limit;

      // Build filter query
      const filter = {};
      
      if (category) filter.category = category;
      if (level) filter.level = level;
      if (instructor) filter.instructor = instructor;
      
      // Add search functionality
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Add price range filter
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          filter.price = { $gte: min, $lte: max };
        } else if (!isNaN(min)) {
          filter.price = { $gte: min };
        } else if (!isNaN(max)) {
          filter.price = { $lte: max };
        }
      }

      // For public routes, only show published courses
      if (!req.user || req.user.role !== 'admin') {
        filter.status = 'published';
      }

      // Sort configuration
      let sortConfig = { [sortBy]: -1 }; // Default to newest first
      if (sortBy === 'price-asc') {
        sortConfig = { price: 1 };
      } else if (sortBy === 'price-desc') {
        sortConfig = { price: -1 };
      } else if (sortBy === 'rating') {
        sortConfig = { rating: -1 };
      } else if (sortBy === 'popularity') {
        sortConfig = { students: -1 };
      }

      // Get courses with pagination
      const courses = await Course.find(filter)
        .populate('instructor', 'name profileImage')
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const total = await Course.countDocuments(filter);

      res.json({
        courses,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        totalCourses: total
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get a single course by ID with its chapters and contents
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCourseById(req, res) {
    try {
      const { courseId } = req.params;

      // Find course
      const course = await Course.findById(courseId)
        .populate('instructor', 'name profileImage');

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if course is published or user is instructor/admin
      if (course.status !== 'published' && 
          (!req.user || (req.user.userId !== course.instructor._id.toString() && req.user.role !== 'admin'))) {
        return res.status(403).json({ message: 'Course is not published' });
      }

      // Get chapters
      const chapters = await Chapter.find({ course: courseId })
        .sort({ order: 1 });

      // Check if user is enrolled in the course
      const isEnrolled = req.user && course.enrolledStudents.includes(req.user.userId);
      const isFree = course.price === 0;

      // Format response
      const courseData = {
        ...course.toObject(),
        chapters: chapters.map(chapter => ({
          ...chapter.toObject(),
          // Exclude file URLs for unpaid users if course is not free
          contents: chapter.contents.map(content => {
            // Keep quiz content and previews intact
            if (content.type === 'quiz' || content.isFree) return content;
            
            // For videos and pdfs, check if user has access
            if (!isFree && !isEnrolled) {
              // Remove sensitive URLs for unpaid content
              return {
                ...content.toObject(),
                file: null,
                muxPlaybackId: null,
                muxAssetId: null,
                status: content.status
              };
            }
            return content;
          })
        }))
      };

      res.json(courseData);
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Update course details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateCourse(req, res) {
    try {
      const { courseId } = req.params;
      const { 
        title, 
        description, 
        price, 
        category, 
        level, 
        status,
        duration,
        requirements,
        tags
      } = req.body;

      // Find course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if user has permission (instructor or admin)
      if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this course' });
      }

      // Parse arrays if they are passed as strings
      let parsedRequirements = requirements;
      let parsedTags = tags;
      
      if (typeof requirements === 'string') {
        try {
          parsedRequirements = JSON.parse(requirements);
        } catch (err) {
          // If parsing fails, don't update requirements
          parsedRequirements = undefined;
        }
      }
      
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (err) {
          // If parsing fails, don't update tags
          parsedTags = undefined;
        }
      }

      // Update fields if provided
      if (title) course.title = title;
      if (description) course.description = description;
      if (price !== undefined) course.price = parseFloat(price);
      if (category) course.category = category;
      if (level) course.level = level;
      if (status) course.status = status;
      if (duration) course.duration = duration;
      if (parsedRequirements) course.requirements = parsedRequirements;      if (parsedTags) course.tags = parsedTags;

      // Handle thumbnail update if provided
      if (req.file) {
        const result = await uploadToCloudinary(
          req.file.path,
          'course_thumbnails',
          `course_${course._id}_thumbnail_${Date.now()}`
        );
        
        if (result && result.secure_url) {
          course.thumbnail = result.secure_url;
        }
      }

      await course.save();
      res.json({ message: 'Course updated successfully', course });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Delete a course and all its associated chapters and content
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteCourse(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const { courseId } = req.params;

      // Find course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if user has permission (instructor or admin)
      if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this course' });
      }

      // Get all chapters to handle content deletion
      const chapters = await Chapter.find({ course: courseId });

      // Delete content from Cloudinary if needed
      for (const chapter of chapters) {
        for (const content of chapter.contents) {
          // Delete videos and PDFs from Cloudinary if they have a file URL
          if ((content.type === 'video' || content.type === 'pdf') && content.file) {
            try {
              // Extract public ID from Cloudinary URL
              const urlParts = content.file.split('/');
              const publicIdWithExt = urlParts[urlParts.length - 1];
              const publicId = publicIdWithExt.split('.')[0];
              
              if (publicId) {
                const folder = content.type === 'video' ? 'course_videos' : 'course_pdfs';
                await deleteFromCloudinary(`${folder}/${publicId}`);
              }
            } catch (cloudinaryError) {
              console.error('Error deleting content from Cloudinary:', cloudinaryError);
              // Continue with deletion even if Cloudinary deletion fails
            }
          }
        }
      }

      // Delete course thumbnail if it exists
      if (course.thumbnail && !course.thumbnail.includes('default-course.jpg')) {
        try {
          // Extract public ID from thumbnail URL
          const urlParts = course.thumbnail.split('/');
          const publicIdWithExt = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExt.split('.')[0];
          
          if (publicId) {
            await deleteFromCloudinary(`course_thumbnails/${publicId}`);
          }
        } catch (thumbnailError) {
          console.error('Error deleting thumbnail from Cloudinary:', thumbnailError);
          // Continue with deletion even if thumbnail deletion fails
        }
      }

      // Delete all chapters associated with the course
      await Chapter.deleteMany({ course: courseId }, { session });
      
      // Delete the course
      await Course.findByIdAndDelete(courseId, { session });

      // Commit the transaction
      await session.commitTransaction();
      
      res.json({ message: 'Course and all associated content deleted successfully' });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      
      console.error('Error deleting course:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
      session.endSession();
    }
  }

  /**
   * Publish or unpublish a course
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async togglePublishStatus(req, res) {
    try {
      const { courseId } = req.params;
      const { status } = req.body;

      if (!status || !['draft', 'published', 'archived'].includes(status)) {
        return res.status(400).json({ message: 'Valid status is required (draft, published, or archived)' });
      }

      // Find course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if user has permission (instructor or admin)
      if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this course' });
      }

      // Verify the course has at least one chapter if publishing
      if (status === 'published') {
        const chapterCount = await Chapter.countDocuments({ course: courseId });
        if (chapterCount === 0) {
          return res.status(400).json({ 
            message: 'Cannot publish a course without any chapters. Please add at least one chapter.' 
          });
        }
      }

      // Update status
      course.status = status;
      await course.save();

      res.json({ 
        message: `Course status changed to ${status} successfully`, 
        course 
      });
    } catch (error) {
      console.error('Error updating course status:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get course preview information (for unenrolled users)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCoursePreview(req, res) {
    try {
      const { courseId } = req.params;

      // Find course with limited fields
      const course = await Course.findById(courseId)
        .select('title description price level category duration thumbnail instructor requirements tags rating students')
        .populate('instructor', 'name profileImage');

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if course is published
      if (course.status !== 'published') {
        return res.status(403).json({ message: 'Course is not published' });
      }

      // Get chapters with limited information
      const chapters = await Chapter.find({ course: courseId })
        .select('title order')
        .sort({ order: 1 });

      // Get free content previews
      const previewContents = await Chapter.aggregate([
        { $match: { course: mongoose.Types.ObjectId(courseId) } },
        { $unwind: '$contents' },
        { $match: { 'contents.isFree': true } },
        { $limit: 3 },
        {
          $project: {
            _id: 1,
            title: 1,
            'content._id': '$contents._id',
            'content.title': '$contents.title',
            'content.type': '$contents.type',
            'content.duration': '$contents.duration'
          }
        }
      ]);

      res.json({
        course,
        chapterCount: chapters.length,
        chapters: chapters.map(ch => ({ _id: ch._id, title: ch.title, order: ch.order })),
        previews: previewContents
      });
    } catch (error) {
      console.error('Error fetching course preview:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Enroll a user in a course
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async enrollInCourse(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.userId;

      // Find course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if course is published
      if (course.status !== 'published') {
        return res.status(403).json({ message: 'Cannot enroll in unpublished course' });
      }

      // Check if user is already enrolled
      if (course.enrolledStudents.includes(userId)) {
        return res.status(400).json({ message: 'User already enrolled in this course' });
      }

      // Add user to enrolled students
      course.enrolledStudents.push(userId);
      await course.save();

      res.json({ 
        message: 'Successfully enrolled in course',
        course: {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail
        }
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get enrolled students for a course
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getEnrolledStudents(req, res) {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      // Find course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if user has permission (instructor or admin)
      if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view enrolled students' });
      }

      // Get enrolled students with pagination
      const enrolledStudents = await User.find({ _id: { $in: course.enrolledStudents } })
        .select('name email profileImage lastActive')
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const total = course.enrolledStudents.length;

      res.json({
        students: enrolledStudents,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        totalStudents: total
      });
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Update chapter order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateChapterOrder(req, res) {
    try {
      const { courseId } = req.params;
      const { chapterOrders } = req.body;

      if (!chapterOrders || !Array.isArray(chapterOrders)) {
        return res.status(400).json({ message: 'Chapter orders array is required' });
      }

      // Find course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if user has permission (instructor or admin)
      if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this course' });
      }

      // Update each chapter's order
      const updates = chapterOrders.map(({ chapterId, order }) => {
        return Chapter.findByIdAndUpdate(
          chapterId,
          { $set: { order } },
          { new: true }
        );
      });

      await Promise.all(updates);

      res.json({ message: 'Chapter orders updated successfully' });
    } catch (error) {
      console.error('Error updating chapter orders:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get user's progress in a course
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserCourseProgress(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.userId;

      // Check if user is enrolled in the course
      const course = await Course.findOne({ 
        _id: courseId, 
        enrolledStudents: userId 
      });

      if (!course) {
        return res.status(404).json({ message: 'Course not found or user not enrolled' });
      }

      // Get user's progress
      const user = await User.findById(userId);
      const courseProgress = user.enrolledCourses.find(c => c.course.toString() === courseId);

      if (!courseProgress) {
        return res.json({ progress: 0, completedContents: [] });
      }

      // Return progress information
      res.json({
        progress: courseProgress.progress,
        completedContents: courseProgress.completedContents || []
      });
    } catch (error) {
      console.error('Error fetching user course progress:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Mark content as completed for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async markContentCompleted(req, res) {
    try {
      const { courseId, chapterId, contentId } = req.params;
      const userId = req.user.userId;

      // Check if user is enrolled in the course
      const course = await Course.findOne({ 
        _id: courseId, 
        enrolledStudents: userId 
      });

      if (!course) {
        return res.status(404).json({ message: 'Course not found or user not enrolled' });
      }

      // Verify the content exists
      const chapter = await Chapter.findById(chapterId);
      if (!chapter || !chapter.contents.id(contentId)) {
        return res.status(404).json({ message: 'Chapter or content not found' });
      }

      // Find the user
      const user = await User.findById(userId);
      
      // Find the enrolled course record or create it
      let enrolledCourse = user.enrolledCourses.find(c => c.course.toString() === courseId);
      
      if (!enrolledCourse) {
        user.enrolledCourses.push({
          course: courseId,
          completedContents: [contentId],
          progress: 0 // Will be calculated below
        });
        enrolledCourse = user.enrolledCourses[user.enrolledCourses.length - 1];
      } else if (!enrolledCourse.completedContents.includes(contentId)) {
        enrolledCourse.completedContents.push(contentId);
      }

      // Calculate progress
      const totalContents = await Chapter.aggregate([
        { $match: { course: mongoose.Types.ObjectId(courseId) } },
        { $unwind: '$contents' },
        { $count: 'total' }
      ]);

      const totalCount = totalContents.length > 0 ? totalContents[0].total : 0;
      
      if (totalCount > 0) {
        enrolledCourse.progress = (enrolledCourse.completedContents.length / totalCount) * 100;
      }

      await user.save();

      res.json({
        message: 'Content marked as completed',
        progress: enrolledCourse.progress,
        completedContents: enrolledCourse.completedContents
      });
    } catch (error) {
      console.error('Error marking content as completed:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = new CourseController();
