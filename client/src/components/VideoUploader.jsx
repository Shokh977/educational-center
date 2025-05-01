import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const VideoUploader = () => {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [cloudinaryStatus, setCloudinaryStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Function to check Cloudinary configuration
  const checkCloudinaryConfig = async () => {
    try {
      setError(null);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/videos/test-config`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-auth-token': token
          }
        }
      );
      
      setCloudinaryStatus(response.data);
    } catch (err) {
      console.error('Error checking Cloudinary config:', err);
      setError(err.response?.data?.message || 'Failed to check Cloudinary configuration');
      setCloudinaryStatus(null);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError(`Invalid file type: ${selectedFile.type}. Please upload a video file (MP4, WebM, Ogg, MOV, AVI).`);
        fileInputRef.current.value = null;
        return;
      }
      
      // Validate file size (100MB limit)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File is too large. Maximum size is 100MB.');
        fileInputRef.current.value = null;
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a video file to upload.');
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      setUploadResult(null);
      
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title);
      formData.append('description', description);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/videos/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
            'x-auth-token': token
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );
      
      setUploadResult(response.data);
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      fileInputRef.current.value = null;
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Video upload failed');
      setUploadResult(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Video Uploader</h2>
      
      {/* Cloudinary Configuration Status */}
      <div className="mb-6">
        <button
          onClick={checkCloudinaryConfig}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          disabled={uploading}
        >
          Check Cloudinary Configuration
        </button>
        
        {cloudinaryStatus && (
          <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <h3 className="font-semibold mb-2">Cloudinary Status: {cloudinaryStatus.status}</h3>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(cloudinaryStatus.config, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      {/* Upload Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            disabled={uploading}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="video" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Video File (MP4, WebM, Ogg, MOV, AVI up to 100MB)
          </label>
          <input
            type="file"
            id="video"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="w-full text-gray-700 dark:text-gray-300"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
            disabled={uploading}
          />
          {file && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}
        
        {uploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center mt-1">{uploadProgress}%</p>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={uploading || !file}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
      
      {/* Upload Results */}
      {uploadResult && (
        <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 rounded">
          <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">Upload Successful!</h3>
          <div className="mt-2">
            <p className="text-sm font-semibold mb-1">Video URL:</p>
            <a
              href={uploadResult.video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 break-all"
            >
              {uploadResult.video.url}
            </a>
          </div>
          
          {uploadResult.video.thumbnailUrl && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-1">Thumbnail:</p>
              <img
                src={uploadResult.video.thumbnailUrl}
                alt="Video thumbnail"
                className="w-full max-w-xs h-auto rounded"
              />
            </div>
          )}
          
          <div className="mt-4 p-2 bg-white dark:bg-gray-700 rounded overflow-x-auto">
            <pre className="text-xs">
              {JSON.stringify(uploadResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
