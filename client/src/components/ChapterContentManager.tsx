import React, { useState } from 'react';
import { HiChevronUp, HiChevronDown, HiOutlineVideoCamera, HiOutlineDocumentText, HiOutlineQuestionMarkCircle, HiOutlineTrash } from 'react-icons/hi';
import ChapterVideoUploader from './ChapterVideoUploader';
import ChapterPDFUploader from './ChapterPDFUploader';
import NewQuizCreator from './NewQuizCreator';

interface ContentItem {
  type: 'video' | 'pdf' | 'quiz';
  title: string;
  description?: string;
  file?: File | null;
  duration?: string;
  questions?: QuizQuestion[];
  url?: string;
  publicId?: string;
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

interface ChapterContentManagerProps {
  chapters: Chapter[];
  setChapters: (chapters: Chapter[]) => void;
  courseId: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const ChapterContentManager: React.FC<ChapterContentManagerProps> = ({ 
  chapters, 
  setChapters, 
  courseId, 
  onSuccess, 
  onError 
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(null);
  const [currentContentType, setCurrentContentType] = useState<'video' | 'pdf' | 'quiz'>('video');

  // Toggle chapter expansion
  const toggleChapter = (index: number) => {
    const updatedChapters = [...chapters];
    updatedChapters[index].isExpanded = !updatedChapters[index].isExpanded;
    setChapters(updatedChapters);
  };

  // Function to handle when a video is uploaded
  const handleVideoUploaded = (chapterIndex: number, videoData: any) => {
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
    onSuccess('Video uploaded successfully!');
  };
  
  // Function to handle PDF upload completion
  const handlePdfUploaded = (chapterIndex: number, pdfData: any) => {
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
    onSuccess('PDF document uploaded successfully!');
  };
  
  // Function to handle quiz creation completion
  const handleQuizCreated = (chapterIndex: number, quizData: any) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].contents.push({
      type: 'quiz',
      title: quizData.title,
      description: quizData.description,
      questions: quizData.questions,
      status: 'ready'
    });
    
    setChapters(updatedChapters);
    onSuccess('Quiz created successfully!');
  };

  // Delete content from a chapter
  const deleteContent = (chapterIndex: number, contentIndex: number) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      const updatedChapters = [...chapters];
      updatedChapters[chapterIndex].contents.splice(contentIndex, 1);
      setChapters(updatedChapters);
      onSuccess('Content deleted successfully');
    }
  };

  // Render content item
  const renderContentItem = (content: ContentItem, chapterIndex: number, contentIndex: number) => {
    return (
      <div className="p-3 mb-2 bg-gray-50 dark:bg-gray-700 rounded-md border dark:border-gray-600">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {content.type === 'video' && (
              <HiOutlineVideoCamera className="w-5 h-5 text-blue-500 mr-2" />
            )}
            {content.type === 'pdf' && (
              <HiOutlineDocumentText className="w-5 h-5 text-red-500 mr-2" />
            )}
            {content.type === 'quiz' && (
              <HiOutlineQuestionMarkCircle className="w-5 h-5 text-green-500 mr-2" />
            )}
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {content.title}
              </h4>
              {content.duration && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Duration: {content.duration}
                </p>
              )}
              {content.status && (
                <p className={`text-xs ${
                  content.status === 'ready' ? 'text-green-500' : 
                  content.status === 'error' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  Status: {content.status}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => deleteContent(chapterIndex, contentIndex)}
            className="text-red-500 hover:text-red-700"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {chapters.map((chapter, index) => (
        <div 
          key={chapter.id || index} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
        >
          {/* Chapter Header */}
          <div 
            className="p-4 border-b dark:border-gray-700 flex justify-between items-center cursor-pointer"
            onClick={() => toggleChapter(index)}
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {chapter.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {chapter.contents.length} {chapter.contents.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <div className="flex items-center">
              <button 
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {chapter.isExpanded ? (
                  <HiChevronUp className="w-5 h-5" />
                ) : (
                  <HiChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Chapter Content */}
          {chapter.isExpanded && (
            <div className="p-4">
              {/* Existing content list */}
              {chapter.contents.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Chapter Content
                  </h4>
                  {chapter.contents.map((content, contentIndex) => (
                    renderContentItem(content, index, contentIndex)
                  ))}
                </div>
              )}
              
              {/* Content type selector */}
              <div className="mb-4">
                <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Add New Content
                </h4>
                <div className="flex border-b dark:border-gray-700">
                  <button
                    className={`px-4 py-2 font-medium text-sm ${
                      currentContentType === 'video' 
                        ? 'border-b-2 border-primary dark:border-secondary text-primary dark:text-secondary' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    onClick={() => setCurrentContentType('video')}
                  >
                    <HiOutlineVideoCamera className="inline-block mr-1 w-4 h-4" />
                    Video
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm ${
                      currentContentType === 'pdf' 
                        ? 'border-b-2 border-primary dark:border-secondary text-primary dark:text-secondary' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    onClick={() => setCurrentContentType('pdf')}
                  >
                    <HiOutlineDocumentText className="inline-block mr-1 w-4 h-4" />
                    PDF
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm ${
                      currentContentType === 'quiz' 
                        ? 'border-b-2 border-primary dark:border-secondary text-primary dark:text-secondary' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    onClick={() => setCurrentContentType('quiz')}
                  >
                    <HiOutlineQuestionMarkCircle className="inline-block mr-1 w-4 h-4" />
                    Quiz
                  </button>
                </div>
              </div>
              
              {/* Content upload form */}
              <div className="mt-4">
                {currentContentType === 'video' && (
                  <ChapterVideoUploader
                    chapterId={chapter.id}
                    courseId={courseId}
                    onVideoUploaded={(videoData) => handleVideoUploaded(index, videoData)}
                  />
                )}
                
                {currentContentType === 'pdf' && (
                  <ChapterPDFUploader
                    chapterId={chapter.id}
                    courseId={courseId}
                    onPdfUploaded={(pdfData) => handlePdfUploaded(index, pdfData)}
                  />
                )}
                
                {currentContentType === 'quiz' && (
                  <NewQuizCreator
                    chapterId={chapter.id}
                    onQuizCreated={(quizData) => handleQuizCreated(index, quizData)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {chapters.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No chapters added yet. Add your first chapter to start creating content.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChapterContentManager;
