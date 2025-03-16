import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMail, HiOfficeBuilding, HiAcademicCap, HiSearch } from 'react-icons/hi';
import { teachersData } from './TeachersData';

// Language subjects available in the educational center
const subjects = [
  "All Languages",
  "English Language",
  "Spanish Language",
  "Japanese Language"
];

function Teachers() {
  const [selectedSubject, setSelectedSubject] = useState("All Languages");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter teachers based on subject and search query
  const filteredTeachers = teachersData.filter(teacher => {
    const subjectMatch = 
      selectedSubject === "All Languages" || 
      teacher.department === selectedSubject;
    
    const search = searchQuery.toLowerCase();
    const searchMatch = 
      teacher.name.toLowerCase().includes(search) ||
      teacher.title.toLowerCase().includes(search) ||
      teacher.department.toLowerCase().includes(search) ||
      teacher.specializations.some(spec => 
        spec.toLowerCase().includes(search)
      );

    return subjectMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Our Language Teachers
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Learn from expert language instructors from around the world
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="w-full md:w-64">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2 rounded-md border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search teachers..."
              className="w-full p-2 rounded-md border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeachers.map(teacher => (
            <Link
              key={teacher.id}
              to={`/teacher/${teacher.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <img
                src={teacher.image}
                alt={teacher.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {teacher.name}
                </h3>
                <p className="text-primary dark:text-secondary font-medium mb-2">
                  {teacher.title}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {teacher.department}
                </p>
                <div className="space-y-2">
                  {teacher.specializations.slice(0, 2).map((spec, index) => (
                    <span
                      key={index}
                      className="inline-block mr-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No teachers found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Teachers;