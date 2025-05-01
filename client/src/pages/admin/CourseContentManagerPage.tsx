import React from 'react';
import { useParams } from 'react-router-dom';
import CourseContentManager from '../../components/admin/CourseContentManager';
import { useAuth } from '../../context/AuthContext';

const CourseContentManagerPage: React.FC = () => {
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();

  // Check if user has admin permissions
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            You don't have permission to access this page.
          </p>
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            Course Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            The course you're looking for does not exist or the URL is incorrect.
          </p>
          <div className="mt-6 text-center">
            <a 
              href="/admin" 
              className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <a 
            href="/admin" 
            className="text-primary dark:text-secondary hover:underline flex items-center"
          >
            ← Back to Dashboard
          </a>
        </div>
        <CourseContentManager />
      </div>
    </div>
  );
};

export default CourseContentManagerPage;