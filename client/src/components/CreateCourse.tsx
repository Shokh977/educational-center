import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineExclamation, HiOutlineDocumentText, HiOutlineVideoCamera, HiOutlineQuestionMarkCircle, HiChevronUp, HiChevronDown } from 'react-icons/hi';

interface CreateCourseProps {
  onCourseCreated?: () => void;
}

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  level: string;
  duration: string;
  thumbnail: File | null;
}

interface ChapterFormData {
  title: string;
  description: string;
}

interface ContentItem {
  type: 'video' | 'pdf' | 'quiz';
  title: string;
  file?: File | null;
  duration?: string;
  questions?: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Chapter {
  id?: string; // For newly created chapters from API
  title: string;
  description: string;
  order: number;
  contents: ContentItem[];
  isExpanded?: boolean;
}

const CreateCourse: React.FC<CreateCourseProps> = ({ onCourseCreated }) => {
  const { token } = useAuth();
  const [courseData, setCourseData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    price: '',
    level: 'beginner',
    duration: '',
    thumbnail: null
  });
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentCourseId, setCurrentCourseId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'course' | 'chapters'>('course');
  const [newChapter, setNewChapter] = useState<ChapterFormData>({ title: '', description: '' });
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(null);
  const [newContent, setNewContent] = useState<ContentItem>({ type: 'video', title: '' });
  const [activeQuizChapter, setActiveQuizChapter] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCourseData({
        ...courseData,
        thumbnail: e.target.files[0]
      });
    }
  };

  const handleContentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewContent({
        ...newContent,
        file: e.target.files[0]
      });
    }
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewChapter({
      ...newChapter,
      [e.target.name]: e.target.value
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewContent({
      ...newContent,
      [e.target.name]: e.target.value
    });
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Create course first
      const formData = new FormData();
      Object.entries(courseData).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value instanceof File ? value : String(value));
        }
      });

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
      setSuccessMessage('Course created successfully! Now add chapters and content.');
      setSuccess(true);
      setCurrentStep('chapters');

      // Reset success message after a delay
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

  const addChapter = async () => {
    if (!newChapter.title.trim()) {
      setError('Chapter title is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/courses/${currentCourseId}/chapters`,
        {
          title: newChapter.title,
          description: newChapter.description,
          order: chapters.length + 1
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      const newChapterWithId: Chapter = {
        id: response.data._id,
        title: newChapter.title,
        description: newChapter.description,
        order: chapters.length + 1,
        contents: [],
        isExpanded: true
      };

      setChapters([...chapters, newChapterWithId]);
      setNewChapter({ title: '', description: '' });
      setActiveChapterIndex(chapters.length);
      setSuccessMessage('Chapter added successfully!');
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error adding chapter:', err);
      setError(err.response?.data?.message || 'Failed to add chapter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addContent = async (chapterIndex: number) => {
    if (!newContent.title.trim()) {
      setError('Content title is required');
      return;
    }

    if ((newContent.type === 'video' || newContent.type === 'pdf') && !newContent.file) {
      setError(`${newContent.type === 'video' ? 'Video' : 'PDF'} file is required`);
      return;
    }

    if (newContent.type === 'quiz' && (!newContent.questions || newContent.questions.length === 0)) {
      setError('Quiz must have at least one question');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const chapter = chapters[chapterIndex];
      if (!chapter.id) {
        throw new Error('Chapter ID is missing');
      }

      const formData = new FormData();
      formData.append('type', newContent.type);
      formData.append('title', newContent.title);
      
      if (newContent.file) {
        formData.append('file', newContent.file);
      }
      
      if (newContent.duration) {
        formData.append('duration', newContent.duration);
      }
      
      if (newContent.questions) {
        formData.append('questions', JSON.stringify(newContent.questions));
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/chapters/${chapter.id}/content`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token
          }
        }
      );

      // Update local state with new content
      const updatedChapters = [...chapters];
      updatedChapters[chapterIndex].contents.push({...newContent});
      
      setChapters(updatedChapters);
      setNewContent({ type: 'video', title: '' });
      setSuccessMessage('Content added successfully!');
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error adding content:', err);
      setError(err.response?.data?.message || 'Failed to add content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChapter = (index: number) => {
    const updatedChapters = [...chapters];
    updatedChapters[index].isExpanded = !updatedChapters[index].isExpanded;
    setChapters(updatedChapters);
  };

  const handleAddQuizQuestion = () => {
    const updatedContent = { ...newContent };
    
    if (!updatedContent.questions) {
      updatedContent.questions = [];
    }
    
    updatedContent.questions.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    
    setNewContent(updatedContent);
  };

  const handleQuestionChange = (questionIndex: number, field: string, value: string) => {
    if (!newContent.questions) return;
    
    const updatedQuestions = [...newContent.questions];
    
    if (field === 'question') {
      updatedQuestions[questionIndex].question = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.replace('option', ''));
      updatedQuestions[questionIndex].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      updatedQuestions[questionIndex].correctAnswer = parseInt(value);
    }
    
    setNewContent({
      ...newContent,
      questions: updatedQuestions
    });
  };

  const removeQuestion = (questionIndex: number) => {
    if (!newContent.questions) return;
    
    const updatedQuestions = newContent.questions.filter((_, index) => index !== questionIndex);
    
    setNewContent({
      ...newContent,
      questions: updatedQuestions
    });
  };

  const reorderChapter = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === chapters.length - 1)
    ) {
      return;
    }

    const updatedChapters = [...chapters];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap chapters
    [updatedChapters[index], updatedChapters[targetIndex]] = 
    [updatedChapters[targetIndex], updatedChapters[index]];
    
    // Update order numbers
    updatedChapters.forEach((chapter, idx) => {
      chapter.order = idx + 1;
    });
    
    setChapters(updatedChapters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
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
          
          <form onSubmit={createCourse} className="space-y-4">
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
                className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={courseData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={courseData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={courseData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={courseData.level}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (e.g., 8 weeks)
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={courseData.duration}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Thumbnail
              </label>
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  'Creating...'
                ) : (
                  <>
                    <HiOutlinePlus className="w-5 h-5 mr-2" />
                    Create Course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Step 2: Add Chapters and Content
          </h2>
          
          {/* Chapter List */}
          <div className="mb-6 space-y-4">
            {chapters.map((chapter, index) => (
              <div key={index} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleChapter(index)}
                >
                  <div className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">{chapter.order}.</span>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{chapter.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderChapter(index, 'up');
                      }}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      disabled={index === 0}
                    >
                      <HiChevronUp className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        reorderChapter(index, 'down');
                      }}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      disabled={index === chapters.length - 1}
                    >
                      <HiChevronDown className="w-5 h-5" />
                    </button>
                    {chapter.isExpanded ? (
                      <HiChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <HiChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                </div>
                
                {chapter.isExpanded && (
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{chapter.description}</p>
                    
                    {/* Chapter contents */}
                    {chapter.contents.length > 0 ? (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Content</h4>
                        <ul className="space-y-2">
                          {chapter.contents.map((content, contentIndex) => (
                            <li key={contentIndex} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              {content.type === 'video' && (
                                <HiOutlineVideoCamera className="w-5 h-5 text-blue-500 mr-2" />
                              )}
                              {content.type === 'pdf' && (
                                <HiOutlineDocumentText className="w-5 h-5 text-red-500 mr-2" />
                              )}
                              {content.type === 'quiz' && (
                                <HiOutlineQuestionMarkCircle className="w-5 h-5 text-green-500 mr-2" />
                              )}
                              <span className="text-gray-900 dark:text-gray-100">{content.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic mb-4">No content added yet</p>
                    )}
                    
                    {/* Add content form */}
                    {activeChapterIndex === index && (
                      <div className="border dark:border-gray-700 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Add Content</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="content-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Content Type
                            </label>
                            <select
                              id="content-type"
                              name="type"
                              value={newContent.type}
                              onChange={handleContentChange}
                              className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                            >
                              <option value="video">Video</option>
                              <option value="pdf">PDF Document</option>
                              <option value="quiz">Quiz</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="content-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              id="content-title"
                              name="title"
                              value={newContent.title}
                              onChange={handleContentChange}
                              className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                            />
                          </div>
                          
                          {newContent.type === 'video' && (
                            <>
                              <div>
                                <label htmlFor="video-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Video File
                                </label>
                                <input
                                  type="file"
                                  id="video-file"
                                  accept="video/*"
                                  onChange={handleContentFileChange}
                                  className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                                />
                              </div>
                              <div>
                                <label htmlFor="video-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Duration (e.g., 10:30)
                                </label>
                                <input
                                  type="text"
                                  id="video-duration"
                                  name="duration"
                                  value={newContent.duration || ''}
                                  onChange={handleContentChange}
                                  className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                                />
                              </div>
                            </>
                          )}
                          
                          {newContent.type === 'pdf' && (
                            <div>
                              <label htmlFor="pdf-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                PDF File
                              </label>
                              <input
                                type="file"
                                id="pdf-file"
                                accept=".pdf"
                                onChange={handleContentFileChange}
                                className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                              />
                            </div>
                          )}
                          
                          {newContent.type === 'quiz' && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h5 className="font-medium text-gray-800 dark:text-gray-200">Quiz Questions</h5>
                                <button
                                  type="button"
                                  onClick={handleAddQuizQuestion}
                                  className="flex items-center text-sm text-primary dark:text-secondary"
                                >
                                  <HiOutlinePlus className="w-4 h-4 mr-1" />
                                  Add Question
                                </button>
                              </div>
                              
                              {newContent.questions && newContent.questions.length > 0 ? (
                                <div className="space-y-6">
                                  {newContent.questions.map((question, qIndex) => (
                                    <div key={qIndex} className="border dark:border-gray-700 rounded-lg p-3">
                                      <div className="flex justify-between mb-2">
                                        <h6 className="font-medium text-gray-800 dark:text-gray-200">Question {qIndex + 1}</h6>
                                        <button
                                          type="button"
                                          onClick={() => removeQuestion(qIndex)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                      </div>
                                      
                                      <div className="mb-3">
                                        <input
                                          type="text"
                                          placeholder="Enter question"
                                          value={question.question}
                                          onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                          className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                                        />
                                      </div>
                                      
                                      <div className="space-y-2 mb-3">
                                        {question.options.map((option, oIndex) => (
                                          <div key={oIndex} className="flex items-center">
                                            <input
                                              type="radio"
                                              id={`q${qIndex}-option${oIndex}`}
                                              name={`q${qIndex}-correct`}
                                              checked={question.correctAnswer === oIndex}
                                              onChange={() => handleQuestionChange(qIndex, 'correctAnswer', String(oIndex))}
                                              className="mr-2"
                                            />
                                            <input
                                              type="text"
                                              placeholder={`Option ${oIndex + 1}`}
                                              value={option}
                                              onChange={(e) => handleQuestionChange(qIndex, `option${oIndex}`, e.target.value)}
                                              className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 dark:text-gray-400 italic">No questions added yet. Click "Add Question" to start.</p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setActiveChapterIndex(null)}
                            className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => addContent(index)}
                            disabled={isLoading}
                            className="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-md text-sm hover:bg-primary/90 dark:hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary"
                          >
                            {isLoading ? 'Adding...' : 'Add Content'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {activeChapterIndex !== index && (
                      <button
                        type="button"
                        onClick={() => setActiveChapterIndex(index)}
                        className="inline-flex items-center px-4 py-2 bg-primary dark:bg-secondary text-white rounded-md text-sm hover:bg-primary/90 dark:hover:bg-secondary/90"
                      >
                        <HiOutlinePlus className="w-4 h-4 mr-1" />
                        Add Content
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Add Chapter Form */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Add New Chapter</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="chapter-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chapter Title
                </label>
                <input
                  type="text"
                  id="chapter-title"
                  name="title"
                  value={newChapter.title}
                  onChange={handleChapterChange}
                  className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                />
              </div>
              
              <div>
                <label htmlFor="chapter-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="chapter-description"
                  name="description"
                  value={newChapter.description}
                  onChange={handleChapterChange}
                  rows={2}
                  className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                />
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={addChapter}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 bg-primary dark:bg-secondary text-white rounded-md text-sm hover:bg-primary/90 dark:hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary"
                >
                  {isLoading ? 'Adding...' : (
                    <>
                      <HiOutlinePlus className="w-4 h-4 mr-1" />
                      Add Chapter
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="button"
              onClick={() => {
                if (onCourseCreated) {
                  onCourseCreated();
                }
              }}
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Finish Course Creation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;