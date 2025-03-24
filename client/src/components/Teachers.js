import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiMail, HiOfficeBuilding, HiSearch, HiFilter, HiChevronRight } from 'react-icons/hi';
import axios from 'axios';

const subjects = [
  "All Languages",
  "English Language",
  "Spanish Language",
  "Japanese Language",
  "Korean Language"
];

function Teachers() {
  const [selectedSubject, setSelectedSubject] = useState("All Languages");
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch teachers from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/public/teachers`);
        setTeachers(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Failed to load teachers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Filter teachers based on selected subject and search query
  const filteredTeachers = teachers.filter(teacher => {
    const subjectMatch = 
      selectedSubject === "All Languages" || 
      teacher.department === selectedSubject;
    
    const search = searchQuery.toLowerCase();
    const searchMatch = 
      teacher.name.toLowerCase().includes(search) ||
      (teacher.title && teacher.title.toLowerCase().includes(search)) ||
      (teacher.department && teacher.department.toLowerCase().includes(search)) ||
      (teacher.specializations && teacher.specializations.some(spec => 
        spec.toLowerCase().includes(search)
      ));

    return subjectMatch && searchMatch;
  });

  // Loading skeleton UI
  const TeacherSkeleton = () => (
    <>
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
          <div className="h-64 bg-gray-300 dark:bg-gray-700"></div>
          <div className="p-6">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded-full mr-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
            <div className="space-y-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="inline-block mr-2 h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg">
      {/* Hero Section */}
      <div className="bg-indigo-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Meet Our Expert Teachers
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Learn from experienced language instructors who are passionate about helping you achieve your language goals
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Expert Teachers', value: teachers.length },
            { label: 'Languages Taught', value: subjects.length - 1 },
            { label: 'Years Experience', value: '10+' },
            { label: 'Student Success Rate', value: '95%' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary dark:text-secondary mb-2">
                {loading && stat.label === 'Expert Teachers' ? '...' : stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Language
              </label>
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-2 pl-3 pr-10 rounded-md border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none"
                  disabled={loading}
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <HiFilter className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Teachers
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  className="w-full p-2 pl-10 rounded-md border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                />
                <HiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-8">
            <p className="text-center">{error}</p>
            <div className="text-center mt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <TeacherSkeleton />
          ) : filteredTeachers.length > 0 ? (
            filteredTeachers.map(teacher => (
              <Link
                key={teacher._id}
                to={`/teacher/${teacher._id}`}
                className="group bg-indigo-50/80 dark:bg-gray-800 dark:hover:bg-gray-750 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-secondary transition-colors duration-300">
                    {teacher.name}
                  </h3>
                  <p className="text-primary dark:text-secondary font-medium mt-1 mb-2">
                    {teacher.title}
                  </p>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                    <HiOfficeBuilding className="w-4 h-4 mr-2" />
                    {teacher.department}
                  </div>
                  <div className="space-y-2 mb-4">
                    {teacher.specializations && teacher.specializations.slice(0, 3).map((spec, index) => (
                      <span
                        key={index}
                        className="inline-block mr-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <HiMail className="w-4 h-4 inline mr-1" />
                      Contact Available
                    </div>
                    <div className="text-primary dark:text-secondary flex items-center group-hover:translate-x-1 transition-transform duration-300">
                      View Profile
                      <HiChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <HiSearch className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                No teachers found matching your criteria
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Teachers;