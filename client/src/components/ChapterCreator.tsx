import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlus } from 'react-icons/hi';

interface Chapter {
  id?: string;
  title: string;
  description: string;
  order: number;
  contents: any[];
  isExpanded?: boolean;
}

interface ChapterCreatorProps {
  courseId: string;
  chapters: Chapter[];
  setChapters: (chapters: Chapter[]) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const ChapterCreator: React.FC<ChapterCreatorProps> = ({ 
  courseId, 
  chapters, 
  setChapters,
  onSuccess,
  onError
}) => {
  const { token } = useAuth();
  const [newChapter, setNewChapter] = useState<{ title: string; description: string }>({ 
    title: '', 
    description: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewChapter({
      ...newChapter,
      [e.target.name]: e.target.value
    });
  };

  const addChapter = async () => {
    if (!newChapter.title.trim()) {
      onError('Chapter title is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/courses/${courseId}/chapters`,
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
      onSuccess('Chapter added successfully!');
    } catch (err: any) {
      console.error('Error adding chapter:', err);
      onError(err.response?.data?.message || 'Failed to add chapter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Add New Chapter
      </h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chapter Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={newChapter.title}
            onChange={handleChapterChange}
            placeholder="Enter chapter title"
            className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chapter Description
          </label>
          <textarea
            id="description"
            name="description"
            value={newChapter.description}
            onChange={handleChapterChange}
            placeholder="Enter chapter description"
            rows={3}
            className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addChapter}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : (
              <>
                <HiOutlinePlus className="-ml-1 mr-2 h-4 w-4" />
                Add Chapter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterCreator;
