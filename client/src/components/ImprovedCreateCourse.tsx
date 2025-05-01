import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlineExclamation,
  HiOutlinePhotograph,
  HiOutlineTag
} from 'react-icons/hi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ChapterCreator from './ChapterCreator';
import ChapterContent from './ChapterContent';

interface CreateCourseProps {
  onCourseCreated?: () => void;
}

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: string;
  level: string;
  duration: string;
  requirements: string[];
  thumbnail: File | null;
  thumbnailPreview: string;
}

interface Chapter {
  id?: string;
  title: string;
  description: string;
  order: number;
  contents: any[];
  isExpanded?: boolean;
}

const categories = [
  "English Language",
  "Spanish Language",
  "Japanese Language",
  "Korean Language",
  "Business English",
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Mathematics",
  "Science"
];

const ImprovedCreateCourse: React.FC<CreateCourseProps> = ({ onCourseCreated }) => {
  const { token } = useAuth();
  const [courseData, setCourseData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    price: '',
    level: 'beginner',
    duration: '',
    requirements: [''],
    thumbnail: null,
    thumbnailPreview: ''
  });
  
  const [courseStatus, setCourseStatus] = useState<'draft' | 'published'>('draft');
  const [newTag, setNewTag] = useState<string>('');
  const [newRequirement, setNewRequirement] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentCourseId, setCurrentCourseId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'course' | 'chapters'>('course');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      ['clean']
    ],
  };
  
  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value
    });
  };

  const handleDescriptionChange = (content: string) => {
    setCourseData({
      ...courseData,
      description: content
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      
      setCourseData({
        ...courseData,
        thumbnail: file,
        thumbnailPreview: previewUrl
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData({
        ...courseData,
        tags: [...courseData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCourseData({
      ...courseData,
      tags: courseData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setCourseData({
        ...courseData,
        requirements: [...courseData.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const updateRequirement = (index: number, value: string) => {
    const updatedRequirements = [...courseData.requirements];
    updatedRequirements[index] = value;
    setCourseData({
      ...courseData,
      requirements: updatedRequirements
    });
  };

  const removeRequirement = (index: number) => {
    setCourseData({
      ...courseData,
      requirements: courseData.requirements.filter((_, i) => i !== index)
    });
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (courseData.requirements.length === 0 || 
         (courseData.requirements.length === 1 && courseData.requirements[0] === '')) {
        setError('Please add at least one course requirement');
        setIsLoading(false);
        return;
      }
      
      const formData = new FormData();
      Object.entries(courseData).forEach(([key, value]) => {
        if (key !== 'thumbnailPreview' && key !== 'tags' && key !== 'requirements' && value !== null) {
          formData.append(key, value instanceof File ? value : String(value));
        }
      });
      
      formData.append('tags', JSON.stringify(courseData.tags));
      formData.append('requirements', JSON.stringify(courseData.requirements.filter(req => req.trim() !== '')));
      formData.append('status', courseStatus);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/courses`, 
        formData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token
          }
        }
      );
      
      setCurrentCourseId(response.data._id);
      setSuccessMessage(`Course ${courseStatus === 'published' ? 'published' : 'created'} successfully! ${courseStatus === 'draft' ? 'Now add chapters and content.' : ''}`);
      setSuccess(true);
      
      if (courseStatus === 'draft') {
        setCurrentStep('chapters');
      } else {
        // If the course is published, redirect to the admin dashboard
        setTimeout(() => {
          if (onCourseCreated) onCourseCreated();
        }, 2000);
      }

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.message || 'Failed to create course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishCourse = async () => {
    if (!currentCourseId) {
      setError('Please create a course first');
      return;
    }

    if (chapters.length === 0) {
      setError('Please add at least one chapter before publishing');
      return;
    }

    let hasContent = false;
    for (const chapter of chapters) {
      if (chapter.contents && chapter.contents.length > 0) {
        hasContent = true;
        break;
      }
    }

    if (!hasContent) {
      setError('Please add content to at least one chapter before publishing');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/courses/${currentCourseId}/publish`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      setSuccessMessage('Course published successfully!');
      setSuccess(true);

      setTimeout(() => {
        if (onCourseCreated) onCourseCreated();
      }, 2000);
    } catch (err: any) {
      console.error('Error publishing course:', err);
      setError(err.response?.data?.message || 'Failed to publish course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  const handleError = (message: string) => {
    setError(message);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      {error && (
        <div className="mb-4 p-4 rounded bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 flex items-center">
          <HiOutlineExclamation className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 rounded bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200">
          {successMessage}
        </div>
      )}

      {currentStep === 'course' ? (
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Step 1: Create New Course
          </h2>
          
          <form onSubmit={createCourse} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={courseData.title}
                onChange={handleChange}
                required
                placeholder="Enter a clear, descriptive title for your course"
                className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
              />
            </div>
            
            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Thumbnail
              </label>
              <div className="mt-1 flex items-center">
                {courseData.thumbnailPreview ? (
                  <div className="relative">
                    <img 
                      src={courseData.thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-48 h-32 object-cover rounded-md border dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setCourseData({
                        ...courseData,
                        thumbnail: null,
                        thumbnailPreview: ''
                      })}
                      className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <HiOutlineTrash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                    <div className="text-center">
                      <HiOutlinePhotograph className="mx-auto h-10 w-10 text-gray-400" />
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Upload thumbnail
                      </div>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`ml-4 ${courseData.thumbnailPreview ? 'block' : 'hidden'}`}
                />
                {!courseData.thumbnailPreview && (
                  <label
                    htmlFor="thumbnail"
                    className="ml-4 cursor-pointer py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Browse
                    <input
                      type="file"
                      id="thumbnail"
                      name="thumbnail"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Recommended size: 1280x720px (16:9 ratio)
              </p>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Description
              </label>
              <div className="mt-1 bg-white dark:bg-gray-700 rounded-md border dark:border-gray-600">
                <ReactQuill
                  theme="snow"
                  value={courseData.description}
                  onChange={handleDescriptionChange}
                  modules={quillModules}
                  formats={quillFormats}
                  className="h-48"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Describe what students will learn in your course
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course Requirements
                </label>
                <div className="space-y-2">
                  {courseData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder={`Requirement ${index + 1}`}
                        className="flex-1 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                      />
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="ml-2 p-2 text-gray-400 hover:text-red-500"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Add a new requirement"
                      className="flex-1 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequirement();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="ml-2 p-2 text-primary dark:text-secondary hover:text-primary-dark dark:hover:text-secondary-dark"
                    >
                      <HiOutlinePlus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  List the knowledge, skills, or equipment students need to start your course
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={courseData.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {courseData.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1.5 text-blue-500 hover:text-blue-700"
                        >
                          <HiOutlineTrash className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="flex-1 rounded-l-md border-l border-y dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      <HiOutlineTag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    value={courseData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                  />
                </div>
                
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={courseData.level}
                    onChange={handleChange}
                    className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all-levels">All Levels</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="0"
                    value={courseData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Publishing Option
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={courseStatus}
                    onChange={(e) => setCourseStatus(e.target.value as 'draft' | 'published')}
                    className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="published">Publish Immediately</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Draft courses can be edited and published later
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary"
              >
                {isLoading ? 'Creating...' : (courseStatus === 'published' ? 'Create & Publish' : 'Create & Proceed')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Step 2: Add Chapters and Content
            </h2>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setCurrentStep('course')}
                className="py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary"
              >
                Back to Course Details
              </button>
              <button
                type="button"
                onClick={handlePublishCourse}
                disabled={isLoading}
                className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {isLoading ? 'Publishing...' : 'Publish Course'}
              </button>
            </div>
          </div>
          
          <div className="mb-8">
            <ChapterCreator 
              courseId={currentCourseId}
              chapters={chapters}
              setChapters={setChapters}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
          
          <div>
            <ChapterContent
              chapters={chapters}
              setChapters={setChapters}
              courseId={currentCourseId}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedCreateCourse;
