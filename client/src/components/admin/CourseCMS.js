import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  HiOutlineUpload, 
  HiOutlineTrash, 
  HiOutlinePlus, 
  HiOutlineSave,
  HiOutlineCheck,
  HiOutlineExclamation
} from 'react-icons/hi';

const CourseCMS = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Course form data
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    level: 'beginner',
    duration: '',
    tags: [],
    requirements: [],
    status: 'draft',
    thumbnail: null
  });
  
  // Chapters state
  const [chapters, setChapters] = useState([]);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [newChapter, setNewChapter] = useState({ title: '', description: '' });
  
  // Content state
  const [newContent, setNewContent] = useState({
    type: 'video',
    title: '',
    description: '',
    isFree: false,
    file: null
  });
  
  // Thumbnail handling with dropzone
  const {
    acceptedFiles: thumbnailFiles,
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps
  } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setCourse({
        ...course,
        thumbnail: acceptedFiles[0]
      });
    }
  });

  // Content file handling with dropzone
  const {
    acceptedFiles: contentFiles,
    getRootProps: getContentRootProps,
    getInputProps: getContentInputProps
  } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.webm', '.mov'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setNewContent({
        ...newContent,
        file: acceptedFiles[0]
      });
    }
  });

  // Handle course form changes
  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  // Handle adding a tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      
      if (!course.tags.includes(newTag)) {
        setCourse({
          ...course,
          tags: [...course.tags, newTag]
        });
      }
      
      e.target.value = '';
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove) => {
    setCourse({
      ...course,
      tags: course.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handle adding a requirement
  const handleAddRequirement = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newRequirement = e.target.value.trim();
      
      setCourse({
        ...course,
        requirements: [...course.requirements, newRequirement]
      });
      
      e.target.value = '';
    }
  };

  // Handle removing a requirement
  const handleRemoveRequirement = (reqToRemove) => {
    setCourse({
      ...course,
      requirements: course.requirements.filter(req => req !== reqToRemove)
    });
  };

  // Handle new chapter form change
  const handleNewChapterChange = (e) => {
    const { name, value } = e.target;
    setNewChapter({ ...newChapter, [name]: value });
  };

  // Handle new content form change
  const handleNewContentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewContent({
      ...newContent,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Create course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Create FormData object for file upload
      const formData = new FormData();
      
      // Add course details to formData
      Object.keys(course).forEach(key => {
        if (key === 'thumbnail') {
          if (course.thumbnail) {
            formData.append('thumbnail', course.thumbnail);
          }
        } else if (key === 'tags' || key === 'requirements') {
          formData.append(key, JSON.stringify(course[key]));
        } else {
          formData.append(key, course[key]);
        }
      });
      
      // Make API request to create course
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/courses`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token
          }
        }
      );
      
      setSuccess('Course created successfully!');
      
      // Reset form after successful submission or set active course ID for adding chapters
      setCourse({
        title: '',
        description: '',
        price: 0,
        category: '',
        level: 'beginner',
        duration: '',
        tags: [],
        requirements: [],
        status: 'draft',
        thumbnail: null
      });
      
      // Set the active course ID for adding chapters
      const courseId = response.data.courseId || response.data.course._id;
      
      // Scroll to chapters section
      setTimeout(() => {
        document.getElementById('chapters-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
      
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add chapter to course
  const handleAddChapter = async (e) => {
    e.preventDefault();
    
    if (!newChapter.title.trim()) {
      setError('Chapter title is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/courses/${course._id}/chapters`,
        newChapter,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );
      
      // Add new chapter to chapters list
      setChapters([...chapters, response.data.chapter]);
      
      // Set active chapter ID
      setActiveChapterId(response.data.chapterId);
      
      // Clear new chapter form
      setNewChapter({ title: '', description: '' });
      
      setSuccess('Chapter added successfully!');
      
      // Scroll to content section
      setTimeout(() => {
        document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
      
    } catch (err) {
      console.error('Error adding chapter:', err);
      setError(err.response?.data?.message || 'Failed to add chapter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add content to chapter
  const handleAddContent = async (e) => {
    e.preventDefault();
    
    if (!newContent.title.trim()) {
      setError('Content title is required');
      return;
    }
    
    if ((newContent.type === 'video' || newContent.type === 'pdf') && !newContent.file) {
      setError(`Please upload a ${newContent.type} file`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create FormData object for file upload
      const formData = new FormData();
      
      // Add content details to formData
      Object.keys(newContent).forEach(key => {
        if (key === 'file') {
          if (newContent.file) {
            // For video uploads
            if (newContent.type === 'video') {
              formData.append('video', newContent.file);
            }
            // For PDF uploads
            else if (newContent.type === 'pdf') {
              formData.append('file', newContent.file);
            }
          }
        } else {
          formData.append(key, typeof newContent[key] === 'boolean' ? 
            (newContent[key] ? 'true' : 'false') : 
            newContent[key]);
        }
      });
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/courses/${course._id}/chapters/${activeChapterId}/contents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token
          }
        }
      );
      
      // Clear content form
      setNewContent({
        type: 'video',
        title: '',
        description: '',
        isFree: false,
        file: null
      });
      
      // Refresh chapters list to show new content
      const chaptersResponse = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/courses/${course._id}`,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      
      setChapters(chaptersResponse.data.chapters);
      
      setSuccess('Content added successfully!');
      
    } catch (err) {
      console.error('Error adding content:', err);
      setError(err.response?.data?.message || 'Failed to add content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Change course status
  const handlePublishCourse = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/courses/${course._id}/status`,
        { status: 'published' },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );
      
      setSuccess('Course published successfully!');
      
      // Redirect to course page after successful publication
      setTimeout(() => {
        navigate(`/course/${course._id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error publishing course:', err);
      setError(err.response?.data?.message || 'Failed to publish course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Course</h1>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <HiOutlineExclamation className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <HiOutlineCheck className="w-5 h-5 mr-2" />
          <span>{success}</span>
        </div>
      )}
      
      {/* Course Details Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Course Details</h2>
        
        <form onSubmit={handleCreateCourse}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title
              </label>
              <input
                type="text"
                name="title"
                value={course.title}
                onChange={handleCourseChange}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="Enter course title"
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={course.description}
                onChange={handleCourseChange}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="Enter course description"
                rows="5"
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={course.price}
                onChange={handleCourseChange}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={course.category}
                onChange={handleCourseChange}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="E.g., Web Development, Language Learning"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                name="level"
                value={course.level}
                onChange={handleCourseChange}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={course.duration}
                onChange={handleCourseChange}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="E.g., 8 weeks, 10 hours"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (Press Enter to add)
              </label>
              <input
                type="text"
                onKeyDown={handleAddTag}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="Add tags..."
              />
              <div className="flex flex-wrap mt-2">
                {course.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded mr-2 mb-2 flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-gray-600 hover:text-gray-800"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements (Press Enter to add)
              </label>
              <input
                type="text"
                onKeyDown={handleAddRequirement}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="Add requirements..."
              />
              <div className="mt-2">
                {course.requirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 p-2 rounded mb-2"
                  >
                    <span className="flex-grow">{req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(req)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Thumbnail
              </label>
              <div
                {...getThumbnailRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
              >
                <input {...getThumbnailInputProps()} />
                
                {course.thumbnail ? (
                  <div className="text-center">
                    <img
                      src={URL.createObjectURL(course.thumbnail)}
                      alt="Thumbnail preview"
                      className="mx-auto h-32 object-cover mb-2"
                    />
                    <p className="text-sm text-gray-500">{course.thumbnail.name}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <HiOutlineUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-500">
                      Drag and drop a thumbnail image, or click to browse
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 mr-2"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Chapters Section (appears after course is created) */}
      {course._id && (
        <div id="chapters-section" className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add Chapters</h2>
          
          <form onSubmit={handleAddChapter}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={newChapter.title}
                  onChange={handleNewChapterChange}
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="Enter chapter title"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter Description
                </label>
                <textarea
                  name="description"
                  value={newChapter.description}
                  onChange={handleNewChapterChange}
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="Enter chapter description"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 mr-2"
              >
                {loading ? 'Adding...' : 'Add Chapter'}
              </button>
            </div>
          </form>
          
          {/* List of chapters */}
          {chapters.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Chapters</h3>
              <div className="border rounded-md divide-y">
                {chapters.map((chapter) => (
                  <div
                    key={chapter._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      activeChapterId === chapter._id ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => setActiveChapterId(chapter._id)}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{chapter.title}</h4>
                      <span className="text-sm text-gray-500">
                        {chapter.contents?.length || 0} content items
                      </span>
                    </div>
                    {chapter.description && (
                      <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Content Section (appears after a chapter is selected) */}
      {activeChapterId && (
        <div id="content-section" className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add Content</h2>
          
          <form onSubmit={handleAddContent}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  name="type"
                  value={newContent.type}
                  onChange={handleNewContentChange}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={newContent.title}
                  onChange={handleNewContentChange}
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="Enter content title"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Description
                </label>
                <textarea
                  name="description"
                  value={newContent.description}
                  onChange={handleNewContentChange}
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="Enter content description"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={newContent.isFree}
                    onChange={handleNewContentChange}
                    className="mr-2"
                  />
                  Make this content available for free preview
                </label>
              </div>
              
              {/* File upload for video or PDF */}
              {(newContent.type === 'video' || newContent.type === 'pdf') && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newContent.type === 'video' ? 'Video File' : 'PDF File'}
                  </label>
                  <div
                    {...getContentRootProps()}
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                  >
                    <input {...getContentInputProps()} />
                    
                    {newContent.file ? (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 font-medium">{newContent.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(newContent.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <HiOutlineUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-1 text-sm text-gray-500">
                          Drag and drop a {newContent.type === 'video' ? 'video' : 'PDF'} file, or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {newContent.type === 'video' 
                            ? 'Supported formats: MP4, WebM, MOV' 
                            : 'Supported format: PDF'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Quiz fields (if type is quiz) */}
              {newContent.type === 'quiz' && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-4">
                    Quiz creation is currently simplified. After adding a basic quiz, you'll be able to edit it to add questions.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 mr-2"
              >
                {loading ? 'Adding...' : 'Add Content'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Publish Course Button (appears after course is created) */}
      {course._id && chapters.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Publish Course</h2>
          <p className="text-sm text-gray-600 mb-4">
            When you're ready to make your course available to students, you can publish it.
          </p>
          <button
            onClick={handlePublishCourse}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            {loading ? 'Publishing...' : 'Publish Course'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseCMS;
