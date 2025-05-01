import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import debounce from 'lodash.debounce';
import { 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlineExclamation, 
  HiOutlineDocumentText, 
  HiOutlineVideoCamera, 
  HiOutlineQuestionMarkCircle, 
  HiChevronUp, 
  HiChevronDown,
  HiX,
  HiOutlinePhotograph,
  HiOutlineTag,
  HiPlay,
  HiDocumentDownload,
  HiOutlineClock,
  HiOutlineSave
} from 'react-icons/hi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ChapterCreator from './ChapterCreator';
import ChapterContent from './ChapterContent';

// Add type definitions for drag-and-drop context
interface DropResultType {
  source: {
    index: number;
  };
  destination?: {
    index: number;
  };
}

interface DroppableProvidedType {
  innerRef: React.RefCallback<HTMLDivElement>;
  droppableProps: React.HTMLAttributes<HTMLDivElement>;
  placeholder?: React.ReactElement;
}

interface DraggableProvidedType {
  innerRef: React.RefCallback<HTMLDivElement>;
  draggableProps: React.HTMLAttributes<HTMLDivElement>;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

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
  description?: string;
  url?: string;    // For storing the uploaded video/pdf URL from Cloudinary
  publicId?: string; // For storing the Cloudinary public ID for videos
  status?: 'draft' | 'uploading' | 'ready' | 'error';
  uploadProgress?: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Chapter {
  id?: string;
  title: string;
  description: string;
  order: number;
  contents: ContentItem[];
  isExpanded?: boolean;
}

interface VideoPreviewProps {
  file: File;
  duration: string;
  onDurationChange: (duration: string) => void;
}

interface PdfPreviewProps {
  file: File;
}

interface ContentPreviewProps {
  type: string;
  file: File | null;
  duration?: string;
  onDurationChange?: (duration: string) => void;
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

const VideoPreview: React.FC<VideoPreviewProps> = ({ file, duration, onDurationChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = URL.createObjectURL(file);
  
  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      const videoDuration = videoRef.current.duration;
      const minutes = Math.floor(videoDuration / 60);
      const seconds = Math.floor(videoDuration % 60);
      const formattedDuration = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
      
      if (!duration) {
        onDurationChange(formattedDuration);
      }
    }
  };
  
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);
  
  return (
    <div className="mt-2">
      <div className="rounded-lg overflow-hidden border dark:border-gray-700">
        <video 
          ref={videoRef}
          className="w-full" 
          controls
          onLoadedMetadata={handleLoadedMetadata}
        >
          <source src={videoUrl} type={file.type} />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
        <HiOutlineClock className="mr-1" />
        {duration || 'Calculating duration...'}
      </div>
    </div>
  );
};

const PdfPreview: React.FC<PdfPreviewProps> = ({ file }) => {
  const pdfUrl = URL.createObjectURL(file);
  
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between p-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center">
          <HiDocumentDownload className="w-8 h-8 text-red-600 mr-3" />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <a 
          href={pdfUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-3 py-1 bg-primary dark:bg-secondary text-white rounded hover:bg-primary/90 dark:hover:bg-secondary/90"
        >
          Preview
        </a>
      </div>
    </div>
  );
};

const ContentPreview: React.FC<ContentPreviewProps> = ({ type, file, duration, onDurationChange }) => {
  if (!file) return null;
  
  return (
    <div className="mt-4">
      <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Preview</h5>
      {type === 'video' && onDurationChange && (
        <VideoPreview file={file} duration={duration || ''} onDurationChange={onDurationChange} />
      )}
      {type === 'pdf' && (
        <PdfPreview file={file} />
      )}
    </div>
  );
};

const CreateCourse: React.FC<CreateCourseProps> = ({ onCourseCreated }) => {
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
  const [newChapter, setNewChapter] = useState<ChapterFormData>({ title: '', description: '' });
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(null);
  const [newContent, setNewContent] = useState<ContentItem>({ type: 'video', title: '' });
  const [activeQuizChapter, setActiveQuizChapter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [draftId, setDraftId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [currentContentType, setCurrentContentType] = useState<'video' | 'pdf' | 'quiz'>('video');
  
  // Function to handle video upload completion
  const handleVideoUploaded = (chapterIndex: number, videoData: VideoData) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].contents.push({
      type: 'video',
      title: videoData.title,
      description: videoData.description,
      url: videoData.url,
      publicId: videoData.publicId,
      duration: videoData.duration?.toString(),
      status: 'ready'
    });
    
    setChapters(updatedChapters);
    setSuccessMessage('Video uploaded successfully!');
    setSuccess(true);
    
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };
  
  // Function to handle PDF upload completion
  const handlePdfUploaded = (chapterIndex: number, pdfData: PDFData) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].contents.push({
      type: 'pdf',
      title: pdfData.title,
      description: pdfData.description,
      url: pdfData.url,
      publicId: pdfData.publicId,
      status: 'ready'
    });
    
    setChapters(updatedChapters);
    setSuccessMessage('PDF document uploaded successfully!');
    setSuccess(true);
    
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };
  
  // Function to handle quiz creation completion
  const handleQuizCreated = (chapterIndex: number, quizData: { title: string; description: string; questions: any[] }) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].contents.push({
      type: 'quiz',
      title: quizData.title,
      description: quizData.description,
      questions: quizData.questions,
      status: 'ready'
    });
    
    setChapters(updatedChapters);
    setSuccessMessage('Quiz created successfully!');
    setSuccess(true);
    
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

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

  const handleContentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
      
      setNewContent({
        ...newContent,
        file
      });
      
      if (newContent.type === 'video' || newContent.type === 'pdf') {
        setFilePreviewUrl(URL.createObjectURL(file));
      }
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

  const handleDragEnd = (result: DropResultType) => {
    if (!result.destination) return;
    
    const items = Array.from(chapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setChapters(reorderedItems);
  };

  // Auto-save debounced function
  const debouncedSaveDraft = useCallback(
    debounce(async (data: CourseFormData, courseId?: string) => {
      setIsSaving(true);
      
      try {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'thumbnailPreview' && key !== 'tags' && key !== 'requirements' && value !== null) {
            formData.append(key, value instanceof File ? value : String(value));
          }
        });
        
        formData.append('tags', JSON.stringify(data.tags));
        formData.append('requirements', JSON.stringify(data.requirements.filter(req => req.trim() !== '')));
        
        if (courseId) {
          formData.append('draftId', courseId);
        }
        
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/courses/drafts`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
              'x-auth-token': token
            }
          }
        );
        
        if (!courseId && response.data.courseId) {
          setDraftId(response.data.courseId);
        }
        
        setLastSaved(new Date());
      } catch (err) {
        console.error('Error saving draft:', err);
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [token]
  );

  useEffect(() => {
    if (currentStep === 'course' && courseData.title.trim() !== '') {
      debouncedSaveDraft(courseData, draftId);
    }
    
    return () => {
      debouncedSaveDraft.cancel();
    };
  }, [courseData, draftId, currentStep, debouncedSaveDraft]);

  useEffect(() => {
    return () => {
      if (courseData.thumbnailPreview) {
        URL.revokeObjectURL(courseData.thumbnailPreview);
      }
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [courseData.thumbnailPreview, filePreviewUrl]);

  useEffect(() => {
    const loadDrafts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/courses/drafts`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-auth-token': token
            }
          }
        );
        
        if (response.data.length > 0) {
          const latestDraft = response.data[0];
          setDraftId(latestDraft._id);
          
          if (window.confirm(`Would you like to load your latest draft "${latestDraft.title}"?`)) {
            const draftResponse = await axios.get(
              `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/courses/drafts/${latestDraft._id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'x-auth-token': token
                }
              }
            );
            
            const draft = draftResponse.data;
            
            setCourseData({
              title: draft.title || '',
              description: draft.description || '',
              category: draft.category || '',
              tags: draft.tags || [],
              price: draft.price?.toString() || '',
              level: draft.level || 'beginner',
              duration: draft.duration || '',
              requirements: draft.requirements || [''],
              thumbnail: null,
              thumbnailPreview: draft.thumbnail ? 
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${draft.thumbnail}` : ''
            });
          }
        }
      } catch (err) {
        console.error('Error loading drafts:', err);
      }
    };
    
    loadDrafts();
  }, [token]);

  const saveDraft = async () => {
    setIsSaving(true);
    setError('');
    
    try {
      const formData = new FormData();
      Object.entries(courseData).forEach(([key, value]) => {
        if (key !== 'thumbnailPreview' && key !== 'tags' && key !== 'requirements' && value !== null) {
          formData.append(key, value instanceof File ? value : String(value));
        }
      });
      
      formData.append('tags', JSON.stringify(courseData.tags));
      formData.append('requirements', JSON.stringify(courseData.requirements.filter(req => req.trim() !== '')));
      
      if (draftId) {
        formData.append('draftId', draftId);
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/courses/drafts`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token
          }
        }
      );
      
      if (!draftId && response.data.courseId) {
        setDraftId(response.data.courseId);
      }
      
      setLastSaved(new Date());
      setSuccessMessage('Draft saved successfully!');
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving draft:', err);
      setError(err.response?.data?.message || 'Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
                      <HiX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
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
                        className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600 focus:outline-none"
                      >
                        <HiX className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 rounded-l-md border-r-0 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
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
                    className="rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 px-3 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500"
                  >
                    <HiOutlineTag className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  placeholder="e.g., 8 weeks"
                  className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Status
              </label>
              <select
                id="status"
                name="status"
                value={courseStatus}
                onChange={(e) => setCourseStatus(e.target.value as 'draft' | 'published')}
                required
                className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            
            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={saveDraft}
                disabled={isSaving}
                className="flex items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  'Saving...'
                ) : (
                  <>
                    <HiOutlineSave className="w-5 h-5 mr-2" />
                    Save Draft
                  </>
                )}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  'Creating...'
                ) : (
                  <>
                    <HiOutlinePlus className="w-5 h-5 mr-2" />
                    {courseStatus === 'published' ? 'Publish Course' : 'Create Course'}
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
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="chapters">
              {(provided: DroppableProvidedType) => (
                <div
                  className="mb-6 space-y-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {chapters.map((chapter, index) => (
                    <Draggable key={chapter.id || index} draggableId={chapter.id || `chapter-${index}`} index={index}>
                      {(provided: DraggableProvidedType) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          <div 
                            className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between cursor-pointer"
                            {...provided.dragHandleProps}
                            onClick={() => toggleChapter(index)}
                          >
                            <div className="flex items-center">
                              <span className="text-gray-500 dark:text-gray-400 mr-2">{chapter.order}.</span>
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">{chapter.title}</h3>
                            </div>
                            <div className="flex items-center space-x-2">
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
                              
                              {chapter.contents.length > 0 ? (
                                <div className="mb-6">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Content</h4>
                                  <div className="space-y-2">
                                    {chapter.contents.map((content, contentIndex) => (
                                      <div key={contentIndex} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
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
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 dark:text-gray-400 italic mb-4">No content added yet</p>
                              )}
                                {activeChapterIndex === index && (
                                <div className="border dark:border-gray-700 rounded-lg p-4 mb-4">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Add Content</h4>
                                  
                                  <div className="mb-4">
                                    <div className="flex space-x-2 mb-4">
                                      <button
                                        type="button"
                                        onClick={() => setCurrentContentType('video')}
                                        className={`flex items-center px-3 py-2 rounded ${
                                          currentContentType === 'video'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                      >
                                        <HiOutlineVideoCamera className="w-5 h-5 mr-2" />
                                        Video
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setCurrentContentType('pdf')}
                                        className={`flex items-center px-3 py-2 rounded ${
                                          currentContentType === 'pdf'
                                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                      >
                                        <HiOutlineDocumentText className="w-5 h-5 mr-2" />
                                        PDF
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setCurrentContentType('quiz')}
                                        className={`flex items-center px-3 py-2 rounded ${
                                          currentContentType === 'quiz'
                                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                      >
                                        <HiOutlineQuestionMarkCircle className="w-5 h-5 mr-2" />
                                        Quiz
                                      </button>
                                    </div>
                                    
                                    {currentContentType === 'video' && (
                                      <ChapterVideoUploader
                                        chapterId={chapter.id}
                                        courseId={currentCourseId}
                                        onVideoUploaded={(videoData) => handleVideoUploaded(index, videoData)}
                                      />
                                    )}
                                    
                                    {currentContentType === 'pdf' && (
                                      <ChapterPDFUploader
                                        chapterId={chapter.id}
                                        courseId={currentCourseId}
                                        onPdfUploaded={(pdfData) => handlePdfUploaded(index, pdfData)}
                                      />
                                    )}
                                    
                                    {currentContentType === 'quiz' && (
                                      <ChapterQuizCreator
                                        onQuizCreated={(quizData) => handleQuizCreated(index, quizData)}
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
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
                                  
                                  <ContentPreview 
                                    type={newContent.type} 
                                    file={newContent.file || null} 
                                    duration={newContent.duration} 
                                    onDurationChange={(duration) => setNewContent({ ...newContent, duration })}
                                  />
                                  
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
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
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