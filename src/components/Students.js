import React from 'react';
import { topStudentsData } from './StudentsData';

const Students = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {topStudentsData.map((student) => (
        <div key={student.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
          <div className="p-6">
            <img
              src={student.image}
              alt={student.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
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
  );
};

export default Students;