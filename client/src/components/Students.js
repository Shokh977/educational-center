import React from 'react';
import { topStudentsData } from './StudentsData';

const Students = () => {
  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Our Students</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topStudentsData.map((student) => (
            <div key={student.id} className="bg-indigo-50/80 dark:bg-gray-700 dark:hover:bg-gray-650 rounded-lg shadow-sm overflow-hidden transform hover:shadow-md transition-all duration-300">
              <div className="p-6">
                <img
                  src={student.image}
                  alt={student.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
                  {student.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  {student.course}
                </p>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-gray-700 dark:text-gray-300 text-center">
                    {student.achievement}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Students;