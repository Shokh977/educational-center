import React, { useState, useMemo, useEffect } from 'react';
import { HiStar, HiFilter, HiSearch } from 'react-icons/hi';
import { useSearchParams, Link } from 'react-router-dom';
import { courseData } from './FeaturedCourses';

const categories = [
  "All Languages",
  "English Language",
  "Spanish Language",
  "Japanese Language"
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("All Languages");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");

  // Handle initial course parameter
  useEffect(() => {
    const courseId = searchParams.get('course');
    if (courseId) {
      const course = courseData.find(c => c.id === parseInt(courseId));
      if (course) {
        setSelectedCategory(course.category);
      }
    }
  }, [searchParams]);

  // Filter courses based on selected filters and search query
  const filteredCourses = useMemo(() => {
    return courseData.filter(course => {
      // Category filter
      const categoryMatch = 
        selectedCategory === "All Languages" || 
        course.category === selectedCategory;
      
      // Level filter
      const levelMatch = selectedLevel === "All Levels" || course.level === selectedLevel;
      
      // Search query filter
      const search = searchQuery.toLowerCase();
      const searchMatch = 
        course.title.toLowerCase().includes(search) ||
        course.instructor.toLowerCase().includes(search) ||
        course.category.toLowerCase().includes(search);

      return categoryMatch && levelMatch && searchMatch;
    });
  }, [selectedCategory, selectedLevel, searchQuery]);

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
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search for language courses..."
                className="w-full px-4 py-2 pl-10 pr-4 rounded-md border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <HiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
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
                  Showing {filteredCourses.length} of {courseData.length} courses
                </p>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <Link 
                    key={course.id} 
                    to={`/course/${course.id}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">{course.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{course.instructor}</p>
                      <div className="flex items-center mb-2">
                        <span className="text-amber-500 font-semibold">{course.rating}</span>
                        <div className="flex items-center ml-1">
                          {[...Array(5)].map((_, i) => (
                            <HiStar key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">({course.students.toLocaleString()})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-primary dark:text-secondary">${course.price}</span>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{course.duration}</span>
                          <span>•</span>
                          <span>{course.level}</span>
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