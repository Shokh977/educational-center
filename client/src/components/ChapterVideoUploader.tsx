import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { HiOutlineUpload, HiOutlineX, HiCheck, HiExclamation } from 'react-icons/hi';

interface VideoUploaderProps {
  chapterId?: string;
  courseId?: string;
  onVideoUploaded: (videoData: VideoData) => void;
  title?: string;
  description?: string;
}

export interface VideoData {
  url: string;
  thumbnailUrl?: string;
  publicId: string;
  duration?: number;
  title: string;
  description?: string;
}

const ChapterVideoUploader: React.FC<VideoUploaderProps> = ({ 
  chapterId, 
  courseId, 
  onVideoUploaded,
  title = '',
  description = '' 
}) => {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState(title);
  const [videoDescription, setVideoDescription] = useState(description);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError(`Invalid file type: ${selectedFile.type}. Please upload a video file (MP4, WebM, Ogg, MOV, AVI).`);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Validate file size (100MB limit)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File is too large. Maximum size is 100MB.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Create a preview URL
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(selectedFile));
    }
  };
  const uploadVideo = async () => {
    if (!file) {
      setError('Please select a video file to upload.');
      return;
    }

    if (!videoTitle.trim()) {
      setError('Please enter a video title.');
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      
      // Determine the API endpoint based on whether we're adding to a chapter
      const endpoint = chapterId 
        ? `${process.env.REACT_APP_API_URL}/api/chapters/${chapterId}/video`
        : `${process.env.REACT_APP_API_URL}/api/videos/upload`;
      
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', videoTitle);
      formData.append('description', videoDescription || '');
      
      // Add course ID if available
      if (courseId) formData.append('courseId', courseId);
      
      const response = await axios.post(
        endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(progress);
          }
        }
      );
      
      // Call the callback with the uploaded video data
      onVideoUploaded({
        url: response.data.video.url,
        thumbnailUrl: response.data.video.thumbnailUrl,
        publicId: response.data.video.publicId,
        duration: response.data.video.duration,
        title: videoTitle,
        description: videoDescription
      });
      
      // Clean up
      setFile(null);
      setVideoTitle('');
      setVideoDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Video upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  const cancelUpload = () => {
    if (file && preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setVideoTitle(title);
    setVideoDescription(description);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Upload Video Content</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="video-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Video Title
          </label>
          <input
            type="text"
            id="video-title"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Enter video title"
            className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary"
            disabled={uploading}
          />
        </div>
        
        <div>
          <label htmlFor="video-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="video-description"
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
            placeholder="Enter video description"
            rows={3}
            className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary"
            disabled={uploading}
          />
        </div>
        
        <div>
          <label htmlFor="video-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Video File (MP4, WebM, Ogg, MOV, AVI up to 100MB)
          </label>
          <div className="mt-1">
            <input
              type="file"
              id="video-file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
              disabled={uploading}
            />
          </div>
          
          {file && (
            <div className="mt-2 flex items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={cancelUpload}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          
          {preview && (
            <div className="mt-2">
              <video 
                src={preview} 
                controls 
                className="max-w-full h-auto rounded-md border dark:border-gray-600"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md flex items-center">
            <HiExclamation className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        
        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading...</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{uploadProgress}%</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-primary dark:bg-secondary h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={uploadVideo}
            disabled={!file || uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center">
                <HiOutlineUpload className="mr-2 h-4 w-4" />
                Upload Video
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterVideoUploader;
