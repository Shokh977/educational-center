import React from 'react';
import { studentData } from '../data/studentData';

const Performance: React.FC = () => {
  const sortedStudents = [...studentData].sort((a, b) => b.gpa - a.gpa);
  const topPerformer = sortedStudents[0];
  const highestExamScore = [...studentData].sort((a, b) => b.examScore - a.examScore)[0];

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Student Performance</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-indigo-50/80 dark:bg-gray-700 dark:hover:bg-gray-650 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Performer</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {topPerformer.name} - GPA {topPerformer.gpa}
            </p>
          </div>
          <div className="bg-indigo-50/80 dark:bg-gray-700 dark:hover:bg-gray-650 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Highest Exam Score</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {highestExamScore.name} - {highestExamScore.examScore}%
            </p>
          </div>
        </div>

        <div className="bg-indigo-50/80 dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exam Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GPA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Achievements</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {sortedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{student.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{student.examScore}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{student.gpa}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{student.achievements.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
