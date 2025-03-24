import React, { useState, useEffect } from 'react';
import { HiStar, HiFilter, HiSearch } from 'react-icons/hi';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const categories = [
  "All Languages",
  "English Language",
  "Spanish Language",
  "Japanese Language",
  "Korean Language",
  "Business English"
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("All Languages");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCourses, setTotalCourses] = useState(0);

  // Fetch courses based on filters
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (selectedCategory !== "All Languages") {
          params.append('category', selectedCategory);
        }
        if (selectedLevel !== "All Levels") {
          params.append('level', selectedLevel);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        // Make API request
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/public/courses?${params.toString()}`
        );
        
        // Update state with fetched data
        setCourses(response.data);
        setTotalCourses(response.data.length); // For display purposes
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [selectedCategory, selectedLevel, searchQuery]);

  // Handle initial course parameter
  useEffect(() => {
    const courseId = searchParams.get('course');
    if (courseId) {
      // If we have a course ID in URL, we could fetch that specific course
      // and set the category filter based on that course's category
      const fetchCourseDetails = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/public/courses/${courseId}`
          );
          if (response.data) {
            setSelectedCategory(response.data.category);
          }
        } catch (err) {
          console.error('Error fetching course details:', err);
        }
      };
      
      fetchCourseDetails();
    }
  }, [searchParams]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchParams(prev => {
      if (category === "All Languages") {
        prev.delete('category');
      } else {
        prev.set('category', category);
      }
      return prev;
    });
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submit (if needed for immediate search)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The search will be triggered by the useEffect
  };

  // Loading skeleton UI
  const LoadingSkeleton = () => (
    <>
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full mr-1"></div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );

  // Error component
  const ErrorMessage = () => (
    <div className="col-span-full text-center py-8">
      <p className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary dark:bg-secondary text-white rounded hover:bg-primary/90 dark:hover:bg-secondary/90"
      >
        Try Again
      </button>
    </div>
  );

  // Show message when no courses match the filters
  const NoCoursesFound = () => (
    <div className="col-span-full text-center py-8">
      <p className="text-gray-600 dark:text-gray-400 text-lg">
        No courses found matching your criteria. Try adjusting your filters.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search for language courses..."
                className="w-full px-4 py-2 pl-10 pr-4 rounded-md border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <HiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                <HiFilter className="mr-2" /> Filters
              </h3>
              
              {/* Language Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Language</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full p-2 rounded-md border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Level</h4>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full p-2 rounded-md border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Filter Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {loading ? 'Loading courses...' : `Showing ${courses.length} courses`}
                </p>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <LoadingSkeleton />
              ) : error ? (
                <ErrorMessage />
              ) : courses.length > 0 ? (
                courses.map(course => (
                  <Link 
                    key={course._id} 
                    to={`/course/${course._id}`}
                    className="bg-indigo-50/80 dark:bg-gray-700 dark:hover:bg-gray-650 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">{course.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {course.instructor?.name || 'Instructor'}
                      </p>
                      <div className="flex items-center mb-2">
                        <span className="text-amber-500 font-semibold">{course.rating?.toFixed(1) || '0.0'}</span>
                        <div className="flex items-center ml-1">
                          {[...Array(5)].map((_, i) => (
                            <HiStar key={i} className={`w-4 h-4 ${i < Math.floor(course.rating || 0) ? 'text-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          ({course.students?.toLocaleString() || '0'})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-primary dark:text-secondary">
                          ${course.price?.toFixed(2) || '0.00'}
                        </span>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{course.duration || 'N/A'}</span>
                          <span>•</span>
                          <span>{course.level?.charAt(0).toUpperCase() + course.level?.slice(1) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <NoCoursesFound />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Courses;