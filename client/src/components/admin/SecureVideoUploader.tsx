import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { BiUpload, BiLoaderCircle, BiCheck, BiX } from 'react-icons/bi';

interface SecureVideoUploaderProps {
  contentId: string; 
  onSuccess: (playbackId: string) => void;
  onError: (error: string) => void;
}

const SecureVideoUploader: React.FC<SecureVideoUploaderProps> = ({ contentId, onSuccess, onError }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get the API URL from environment variable or default
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        setUploadStatus('idle');
        setUploadError(null);
      } else {
        setUploadError('Please select a video file');
      }
    }
  };

  const initiateUpload = async () => {
    if (!contentId || !file) return;
    
    try {
      setUploadStatus('uploading');
      setProgress(0);
      
      // Get a direct upload URL from our server
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/secure-videos/upload-url`, 
        { contentId },
        { headers: { 'x-auth-token': token } }
      );
      
      const { uploadUrl } = response.data;
      setUploadUrl(uploadUrl);
      
      // Upload directly to Mux using the URL
      const formData = new FormData();
      formData.append('file', file);
      
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
          );
          setProgress(percentCompleted);
        },
      });
      
      setUploadStatus('success');
      onSuccess('Video upload complete. Processing will continue in the background.');
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadError(error.response?.data?.message || 'Failed to upload video');
      onError(error.response?.data?.message || 'Failed to upload video');
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus('idle');
    setProgress(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderUploadButton = () => {
    if (uploadStatus === 'idle') {
      return (
        <button
          onClick={initiateUpload}
          disabled={!file}
          className={`px-4 py-2 rounded flex items-center ${
            file 
              ? 'bg-primary text-white hover:bg-primary-dark' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <BiUpload className="mr-2" size={20} />
          Upload Video
        </button>
      );
    } else if (uploadStatus === 'uploading') {
      return (
        <div className="flex items-center">
          <BiLoaderCircle className="animate-spin mr-2 text-primary" size={20} />
          <span>Uploading... {progress}%</span>
        </div>
      );
    } else if (uploadStatus === 'success') {
      return (
        <div className="flex items-center">
          <BiCheck className="mr-2 text-green-500" size={20} />
          <span className="text-green-500">Upload Complete</span>
          <button 
            onClick={resetUpload}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <BiX size={20} />
          </button>
        </div>
      );
    } else if (uploadStatus === 'error') {
      return (
        <div className="flex items-center">
          <BiX className="mr-2 text-red-500" size={20} />
          <span className="text-red-500">Upload Failed</span>
          <button 
            onClick={resetUpload}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <BiX size={20} />
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="mt-2">
      <div className="flex flex-col space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Upload Video
          </label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
          />
          
          {file && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected file: {file.name} ({Math.round(file.size / 1024 / 1024 * 10) / 10} MB)
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          {renderUploadButton()}
        </div>
        
        {uploadStatus === 'uploading' && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {uploadError && (
          <div className="text-red-500 text-sm">{uploadError}</div>
        )}

        <div className="mt-2 text-sm text-gray-500">
          Video will be securely stored and encrypted. Only enrolled students will be able to view this content.
        </div>
      </div>
    </div>
  );
};

export default SecureVideoUploader;