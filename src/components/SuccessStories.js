import React from 'react';
import { studentAchievements } from './StudentsAchievements';

function SuccessStories() {
  return (
    <div className="py-16 bg-indigo-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
          Success Stories
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {studentAchievements.map((student) => (
            <div key={student.id} className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <img
                  src={student.image}
                  alt={student.name}
                  className="w-20 h-20 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {student.name}
                  </h3>
                  <p className="text-primary dark:text-secondary">
                    {student.university}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg italic">
                "{student.story}"
              </p>
              <div className="mt-4 p-4 bg-indigo-50 dark:bg-gray-600 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  Achievement: {student.achievement}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SuccessStories;