import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { BiTrash, BiEdit, BiPlus, BiVideo, BiFile, BiX, BiSave, BiUpload } from 'react-icons/bi';
import { HiDocumentText, HiPlay, HiLockClosed } from 'react-icons/hi';

// Define interfaces for the data models
interface Content {
  _id?: string;
  type: 'video' | 'pdf' | 'quiz';
  title: string;
  description?: string;
  file?: string | File;
  duration?: string;
  questions?: any[];
  order: number;
  tempId?: string; // Used for new items before they're saved
}

interface Chapter {
  _id?: string;
  title: string;
  description?: string;
  course: string;
  order: number;
  contents: Content[];
  tempId?: string; // Used for new items before they're saved
}

interface Course {
  _id: string;
  title: string;
  chapters: Chapter[];
}

// Custom type definitions for drag-and-drop
interface DropResultType {
  source: {
    index: number;
    droppableId: string;
  };
  destination?: {
    index: number;
    droppableId: string;
  };
  type: string;
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

const CourseContentManager: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [chapterFiles, setChapterFiles] = useState<{ [key: string]: { videoFile?: File; pdfFile?: File } }>({});

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Update file state for a specific chapter
  const handleFileChange = (chapterId: string, file: File, type: 'video' | 'pdf') => {
    setChapterFiles((prev) => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        [`${type}File`]: file,
      },
    }));
  };

  // Clear file state for a specific chapter
  const clearChapterFiles = (chapterId: string) => {
    setChapterFiles((prev) => {
      const updated = { ...prev };
      delete updated[chapterId];
      return updated;
    });
  };

  // Fetch course data including chapters and contents
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        // Fetch the course data
        const courseRes = await axios.get(`${apiUrl}/api/courses/${courseId}`, {
          headers: { 'x-auth-token': token }
        });
        
        // Fetch all chapters for this course
        const chaptersRes = await axios.get(`${apiUrl}/api/courses/${courseId}/chapters`, {
          headers: { 'x-auth-token': token }
        });
        
        setCourse(courseRes.data);
        
        // Sort chapters by order
        const sortedChapters = chaptersRes.data.sort((a: Chapter, b: Chapter) => a.order - b.order);
        
        // Sort contents within each chapter
        const chaptersWithSortedContents = sortedChapters.map((chapter: Chapter) => ({
          ...chapter,
          contents: chapter.contents.sort((a: Content, b: Content) => a.order - b.order)
        }));
        
        setChapters(chaptersWithSortedContents);
      } catch (err: any) {
        console.error('Error fetching course data:', err);
        setError(err.response?.data?.message || 'Failed to load course data');
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, apiUrl]);

  // Handle drag and drop reordering of chapters and contents
  const handleDragEnd = async (result: DropResultType) => {
    const { source, destination, type } = result;
    
    // If dropped outside a droppable area
    if (!destination) return;
    
    // If dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (type === 'chapter') {
        // Reordering chapters
        const reorderedChapters = [...chapters];
        const [movedChapter] = reorderedChapters.splice(source.index, 1);
        reorderedChapters.splice(destination.index, 0, movedChapter);
        
        // Update order numbers
        const updatedChapters = reorderedChapters.map((chapter, index) => ({
          ...chapter,
          order: index + 1
        }));
        
        setChapters(updatedChapters);
        
        // Update order in the database
        await axios.put(
          `${apiUrl}/api/courses/${courseId}/chapters/reorder`,
          { chapterOrder: updatedChapters.map(ch => ({ id: ch._id, order: ch.order })) },
          { headers: { 'x-auth-token': token }
        });
      } else if (type === 'content') {
        // Extract chapter IDs from droppable IDs
        const sourceChapterId = source.droppableId.replace('chapter-', '');
        const destChapterId = destination.droppableId.replace('chapter-', '');
        
        const newChapters = [...chapters];
        
        // Find the source and destination chapter indices
        const sourceChapterIndex = newChapters.findIndex(ch => 
          ch._id === sourceChapterId || ch.tempId === sourceChapterId
        );
        const destChapterIndex = newChapters.findIndex(ch => 
          ch._id === destChapterId || ch.tempId === destChapterId
        );
        
        // If source chapter not found, return
        if (sourceChapterIndex === -1) return;
        
        // Get the source chapter and content
        const sourceChapter = newChapters[sourceChapterIndex];
        const [movedContent] = sourceChapter.contents.splice(source.index, 1);
        
        // Get the destination chapter
        const destChapter = newChapters[destChapterIndex];
        
        // Add the content to the destination chapter
        destChapter.contents.splice(destination.index, 0, movedContent);
        
        // Update order numbers for both source and destination chapter contents
        sourceChapter.contents = sourceChapter.contents.map((content, idx) => ({
          ...content,
          order: idx + 1
        }));
        
        destChapter.contents = destChapter.contents.map((content, idx) => ({
          ...content,
          order: idx + 1
        }));
        
        setChapters(newChapters);
        
        // Update order in the database
        await axios.put(
          `${apiUrl}/api/courses/${courseId}/contents/reorder`,
          { 
            sourceChapterId: sourceChapterId,
            destChapterId: destChapterId,
            contentOrder: {
              source: sourceChapter.contents.map(c => ({ id: c._id, order: c.order })),
              destination: destChapter.contents.map(c => ({ id: c._id, order: c.order }))
            }
          },
          { headers: { 'x-auth-token': token }
        });
      }
    } catch (err: any) {
      console.error('Error reordering items:', err);
      setError('Failed to update order. Please try again.');
    }
  };

  // Open modal to add or edit a chapter
  const openChapterModal = (chapter?: Chapter) => {
    if (chapter) {
      setCurrentChapter(chapter);
    } else {
      // Create a new chapter object
      setCurrentChapter({
        title: '',
        course: courseId || '',
        order: chapters.length + 1,
        contents: [],
        tempId: `temp-${Date.now()}`
      });
    }
    setIsChapterModalOpen(true);
  };

  // Open modal to add or edit content
  const openContentModal = (chapterId: string, content?: Content) => {
    const chapter = chapters.find(ch => ch._id === chapterId || ch.tempId === chapterId);
    
    if (!chapter) return;
    
    setCurrentChapter(chapter);
    
    if (content) {
      setCurrentContent(content);
    } else {
      // Create a new content object
      setCurrentContent({
        type: 'video',
        title: '',
        description: '',
        order: chapter.contents.length + 1,
        tempId: `temp-${Date.now()}`
      });
    }
    setIsContentModalOpen(true);
  };

  // Save or update a chapter
  const saveChapter = async () => {
    if (!currentChapter || !currentChapter.title.trim()) {
      setError('Chapter title is required');
      return;
    }
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      let updatedChapter: Chapter;
      
      if (currentChapter._id) {
        // Update existing chapter
        const res = await axios.put(
          `${apiUrl}/api/chapters/${currentChapter._id}`,
          {
            title: currentChapter.title,
            description: currentChapter.description || ''
          },
          { headers: { 'x-auth-token': token }
        });
        updatedChapter = res.data;
        
        // Update in state
        setChapters(chapters.map(ch => ch._id === updatedChapter._id ? updatedChapter : ch));
      } else {
        // Create new chapter
        const res = await axios.post(
          `${apiUrl}/api/chapters`,
          {
            title: currentChapter.title,
            description: currentChapter.description || '',
            course: courseId,
            order: currentChapter.order
          },
          { headers: { 'x-auth-token': token }
        });
        updatedChapter = res.data;
        
        // Add to state
        setChapters([...chapters, updatedChapter]);
      }
      
      setIsChapterModalOpen(false);
      setCurrentChapter(null);
    } catch (err: any) {
      console.error('Error saving chapter:', err);
      setError(err.response?.data?.message || 'Failed to save chapter');
    } finally {
      setSaving(false);
    }
  };

  // Handle file upload (video or PDF)
  const uploadFile = async (file: File, type: 'video' | 'pdf') => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axios.post(
        `${apiUrl}/api/upload/${type}`,
        formData,
        {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percentCompleted);
          }
        }
      );
      
      return res.data.url;
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
      throw new Error(`Failed to upload ${type}`);
    }
  };

  // Save or update content
  const saveContent = async () => {
    if (!currentChapter || !currentContent || !currentContent.title.trim()) {
      setError('Content title is required');
      return;
    }
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Get chapter-specific file states
      const chapterFileState = chapterFiles[currentChapter._id || currentChapter.tempId || ''] || {};
      let fileUrl = currentContent.file as string;

      if (currentContent.type === 'video' && chapterFileState.videoFile) {
        fileUrl = await uploadFile(chapterFileState.videoFile, 'video');
      } else if (currentContent.type === 'pdf' && chapterFileState.pdfFile) {
        fileUrl = await uploadFile(chapterFileState.pdfFile, 'pdf');
      }

      // Prepare content data
      const contentData = {
        type: currentContent.type,
        title: currentContent.title,
        description: currentContent.description || '',
        file: fileUrl,
        duration: currentContent.type === 'video' ? currentContent.duration : undefined,
        order: currentContent.order || (currentChapter.contents.length + 1), // Ensure order is set
      };
      
      let updatedContent: Content;
      
      if (currentContent._id) {
        // Update existing content
        const res = await axios.put(
          `${apiUrl}/api/chapters/${currentChapter._id}/contents/${currentContent._id}`,
          contentData,
          { headers: { 'x-auth-token': token }
        });
        updatedContent = res.data;
        
        // Update in state
        const updatedChapters = chapters.map(ch => {
          if (ch._id === currentChapter._id) {
            return {
              ...ch,
              contents: ch.contents.map(c => 
                c._id === updatedContent._id ? updatedContent : c
              )
            };
          }
          return ch;
        });
        
        setChapters(updatedChapters);
      } else {
        // Create new content
        const res = await axios.post(
          `${apiUrl}/api/chapters/${currentChapter._id}/contents`,
          contentData,
          { headers: { 'x-auth-token': token }
        });
        updatedContent = res.data;
        
        // Update in state
        const updatedChapters = chapters.map(ch => {
          if (ch._id === currentChapter._id) {
            return {
              ...ch,
              contents: [...ch.contents, updatedContent]
            };
          }
          return ch;
        });
        
        setChapters(updatedChapters);
      }
      
      setIsContentModalOpen(false);
      setCurrentContent(null);
      clearChapterFiles(currentChapter._id || currentChapter.tempId || '');
    } catch (err: any) {
      console.error('Error saving content:', err);
      setError(err.response?.data?.message || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  // New function to finish the course and publish it
  const finishCourse = async () => {
    if (chapters.length === 0) {
      setError('You must add at least one chapter with content before finishing the course');
      return;
    }

    // Check if all chapters have content
    const emptyChapters = chapters.filter(ch => !ch.contents || ch.contents.length === 0);
    if (emptyChapters.length > 0) {
      setError(`${emptyChapters.length} chapter(s) have no content. All chapters must have at least one lesson.`);
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${apiUrl}/api/courses/${courseId}/publish`,
        { status: 'published' },
        { headers: { 'x-auth-token': token }
      });
      
      // Show success message
      setError(null);
      alert('Course successfully published!');
      
      // Navigate to course detail page or admin dashboard
      navigate(`/admin/courses/${courseId}`);
    } catch (err: any) {
      console.error('Error publishing course:', err);
      setError(err.response?.data?.message || 'Failed to publish course');
    } finally {
      setSaving(false);
    }
  };

  // Delete a chapter
  const deleteChapter = async (chapterId: string) => {
    if (!window.confirm('Are you sure you want to delete this chapter and all its contents?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${apiUrl}/api/chapters/${chapterId}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Remove from state
      setChapters(chapters.filter(ch => ch._id !== chapterId));
    } catch (err: any) {
      console.error('Error deleting chapter:', err);
      setError(err.response?.data?.message || 'Failed to delete chapter');
    }
  };

  // Delete content
  const deleteContent = async (chapterId: string, contentId: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${apiUrl}/api/chapters/${chapterId}/contents/${contentId}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Update in state
      const updatedChapters = chapters.map(ch => {
        if (ch._id === chapterId) {
          return {
            ...ch,
            contents: ch.contents.filter(c => c._id !== contentId)
          };
        }
        return ch;
      });
      
      setChapters(updatedChapters);
    } catch (err: any) {
      console.error('Error deleting content:', err);
      setError(err.response?.data?.message || 'Failed to delete content');
    }
  };

  // Get icon for content type
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <BiVideo className="text-blue-500" />;
      case 'pdf':
        return <BiFile className="text-red-500" />;
      case 'quiz':
        return <HiDocumentText className="text-green-500" />;
      default:
        return <HiDocumentText />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500">Course not found</h2>
          <button 
            onClick={() => navigate('/admin')} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="float-right"
          >
            <BiX className="h-5 w-5" />
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">
          Course Content: {course.title}
        </h1>
        <div className="space-x-3">
          <button
            onClick={() => openChapterModal()}
            className="px-4 py-2 bg-primary text-white rounded flex items-center hover:bg-primary-dark"
          >
            <BiPlus className="mr-1" /> Add Chapter
          </button>
          <button
            onClick={finishCourse}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded flex items-center hover:bg-green-700"
          >
            <BiSave className="mr-1" /> Finish Course
          </button>
        </div>
      </div>
      
      {/* Drag and Drop Chapter List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="chapters" type="chapter">
          {(provided: DroppableProvidedType) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-4"
            >
              {chapters.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-md dark:text-gray-300">
                  <p>No chapters yet. Click "Add Chapter" to create your first chapter.</p>
                </div>
              ) : (
                chapters.map((chapter, chapterIndex) => (
                  <Draggable 
                    key={chapter._id || chapter.tempId || `chapter-${chapterIndex}`} 
                    draggableId={chapter._id || chapter.tempId || `chapter-${chapterIndex}`} 
                    index={chapterIndex}
                  >
                    {(provided: DraggableProvidedType) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 overflow-hidden"
                      >
                        {/* Chapter Header */}
                        <div 
                          className="p-4 bg-gray-100 dark:bg-gray-800 flex justify-between items-center"
                          {...provided.dragHandleProps}
                        >
                          <h3 className="font-semibold dark:text-white">
                            {chapterIndex + 1}. {chapter.title}
                          </h3>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openChapterModal(chapter)}
                              className="p-1 text-gray-600 hover:text-primary dark:text-gray-300"
                              title="Edit Chapter"
                            >
                              <BiEdit className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => deleteChapter(chapter._id || '')}
                              className="p-1 text-gray-600 hover:text-red-500 dark:text-gray-300"
                              title="Delete Chapter"
                            >
                              <BiTrash className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Contents List */}
                        <Droppable 
                          droppableId={`chapter-${chapter._id || chapter.tempId}`} 
                          type="content"
                        >
                          {(provided: DroppableProvidedType) => (
                            <div
                              ref={(instance) => provided.innerRef(instance as HTMLDivElement)}
                              {...provided.droppableProps}
                              className="p-4"
                            >
                              {chapter.contents && chapter.contents.length > 0 ? (
                                <ul className="space-y-2">
                                  {chapter.contents.map((content, contentIndex) => (
                                    <Draggable
                                      key={content._id || content.tempId || `content-${contentIndex}`}
                                      draggableId={content._id || content.tempId || `content-${contentIndex}`}
                                      index={contentIndex}
                                    >
                                      {(provided: DraggableProvidedType) => (
                                        <div
                                          ref={(instance) => provided.innerRef(instance as unknown as HTMLDivElement)}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="p-3 bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded flex justify-between items-center"
                                        >
                                          <div className="flex items-center">
                                            <span className="mr-3">
                                              {getContentIcon(content.type)}
                                            </span>
                                            <div>
                                              <p className="font-medium dark:text-white">{content.title}</p>
                                              {content.duration && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                  Duration: {content.duration}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex space-x-2">
                                            <button 
                                              onClick={() => openContentModal(chapter._id || chapter.tempId || '', content)}
                                              className="p-1 text-gray-600 hover:text-primary dark:text-gray-300"
                                              title="Edit Content"
                                            >
                                              <BiEdit className="h-5 w-5" />
                                            </button>
                                            <button 
                                              onClick={() => deleteContent(chapter._id || '', content._id || '')}
                                              className="p-1 text-gray-600 hover:text-red-500 dark:text-gray-300"
                                              title="Delete Content"
                                            >
                                              <BiTrash className="h-5 w-5" />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                                  No content in this chapter yet
                                </div>
                              )}
                              {provided.placeholder}
                              
                              {/* Add Content Button */}
                              <div className="mt-4 text-center">
                                <button
                                  onClick={() => openContentModal(chapter._id || chapter.tempId || '')}
                                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded flex items-center mx-auto hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                  <BiPlus className="mr-1" /> Add Lesson
                                </button>
                              </div>
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Chapter Modal */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              {currentChapter?._id ? 'Edit Chapter' : 'Add New Chapter'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chapter Title*
                </label>
                <input
                  type="text"
                  value={currentChapter?.title || ''}
                  onChange={(e) => setCurrentChapter({
                    ...currentChapter!,
                    title: e.target.value
                  })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  placeholder="Enter chapter title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={currentChapter?.description || ''}
                  onChange={(e) => setCurrentChapter({
                    ...currentChapter!,
                    description: e.target.value
                  })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setIsChapterModalOpen(false);
                    setCurrentChapter(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={saveChapter}
                  disabled={saving}
                  className={`px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark flex items-center ${
                    saving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <BiSave className="mr-1" /> Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Modal */}
      {isContentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              {currentContent?._id ? 'Edit Lesson' : 'Add New Lesson'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content Type*
                </label>
                <select
                  value={currentContent?.type || 'video'}
                  onChange={(e) => {
                    // Reset both file states when switching content types to avoid using the wrong file
                    clearChapterFiles(currentChapter?._id || currentChapter?.tempId || '');
                    setCurrentContent({
                      ...currentContent!,
                      type: e.target.value as 'video' | 'pdf' | 'quiz',
                      file: undefined // Clear the file when changing content type
                    });
                  }}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF Document</option>
                  {/* <option value="quiz">Quiz</option> */}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title*
                </label>
                <input
                  type="text"
                  value={currentContent?.title || ''}
                  onChange={(e) => setCurrentContent({
                    ...currentContent!,
                    title: e.target.value
                  })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  placeholder="Enter content title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={currentContent?.description || ''}
                  onChange={(e) => setCurrentContent({
                    ...currentContent!,
                    description: e.target.value
                  })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              
              {/* File Upload - Video */}
              {currentContent?.type === 'video' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Video Duration (format: HH:MM:SS)*
                    </label>
                    <input
                      type="text"
                      value={currentContent?.duration || ''}
                      onChange={(e) => setCurrentContent({
                        ...currentContent!,
                        duration: e.target.value
                      })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      placeholder="00:10:30"
                      pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {currentContent.file ? 'Replace Video File' : 'Upload Video File'}
                    </label>
                    <div className="flex items-center mt-1">
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileChange(
                              currentChapter?._id || currentChapter?.tempId || '',
                              e.target.files[0],
                              'video'
                            );
                          }
                        }}
                        accept="video/*"
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center"
                      >
                        <BiUpload className="mr-2" />
                        {chapterFiles[currentChapter?._id || currentChapter?.tempId || '']?.videoFile
                          ? chapterFiles[currentChapter?._id || currentChapter?.tempId || ''].videoFile?.name
                          : 'Select Video File'}
                      </label>
                      {currentContent.file && !chapterFiles[currentChapter?._id || currentChapter?.tempId || '']?.videoFile && (
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <HiPlay className="mr-1" /> Current video: {typeof currentContent.file === 'string' ? 
                            currentContent.file.split('/').pop() : 'Uploaded file'}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Supported formats: MP4, WebM, MOV (max 500MB)
                    </p>
                  </div>
                </>
              )}
              
              {/* File Upload - PDF */}
              {currentContent?.type === 'pdf' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {currentContent.file ? 'Replace PDF File' : 'Upload PDF Document'}
                  </label>
                  <div className="flex items-center mt-1">
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(
                            currentChapter?._id || currentChapter?.tempId || '',
                            e.target.files[0],
                            'pdf'
                          );
                        }
                      }}
                      accept="application/pdf"
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="px-4 py-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded cursor-pointer hover:bg-red-200 dark:hover:bg-red-800 flex items-center"
                    >
                      <BiUpload className="mr-2" />
                      {chapterFiles[currentChapter?._id || currentChapter?.tempId || '']?.pdfFile
                        ? chapterFiles[currentChapter?._id || currentChapter?.tempId || ''].pdfFile?.name
                        : 'Select PDF File'}
                    </label>
                    {currentContent.file && !chapterFiles[currentChapter?._id || currentChapter?.tempId || '']?.pdfFile && (
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <HiDocumentText className="mr-1" /> Current PDF: {typeof currentContent.file === 'string' ? 
                          currentContent.file.split('/').pop() : 'Uploaded file'}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    PDF documents only (max 50MB)
                  </p>
                </div>
              )}
              
              {/* Upload Progress Bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setIsContentModalOpen(false);
                    setCurrentContent(null);
                    clearChapterFiles(currentChapter?._id || currentChapter?.tempId || '');
                    setUploadProgress(0);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={saveContent}
                  disabled={saving}
                  className={`px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark flex items-center ${
                    saving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <BiSave className="mr-1" /> Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseContentManager;