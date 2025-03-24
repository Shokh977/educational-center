import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { HiStar } from 'react-icons/hi';

// Define interfaces for our data
interface Course {
  _id: string;
  title: string;
  image: string;
  instructor: {
    _id: string;
    name: string;
  };
  rating: number;
  students: number;
  price: number;
  duration: string;
  level: string;
}

interface Teacher {
  _id: string;
  name: string;
  image: string;
  title: string;
  department: string;
}

interface Student {
  _id: string;
  name: string;
  grade: string;
  gpa: number;
  examScore: number;
  achievements: string[];
}

interface SuccessStory {
  _id: string;
  name: string;
  image: string;
  university: string;
  story: string;
  achievement: string;
}

const Home: React.FC = () => {
  // State for each section data
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [featuredTeachers, setFeaturedTeachers] = useState<Teacher[]>([]);
  const [topStudents, setTopStudents] = useState<Student[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState({
    courses: true,
    teachers: true,
    students: true,
    stories: true
  });
  const [error, setError] = useState({
    courses: '',
    teachers: '',
    students: '',
    stories: ''
  });

  useEffect(() => {
    // Function to fetch all data for home page
    const fetchHomePageData = async () => {
      try {
        // Fetch featured courses
        const coursesPromise = axios.get(`${process.env.REACT_APP_API_URL}/api/public/featured-courses`);
        
        // Fetch featured teachers
        const teachersPromise = axios.get(`${process.env.REACT_APP_API_URL}/api/public/featured-teachers`);
        
        // Fetch top students
        const studentsPromise = axios.get(`${process.env.REACT_APP_API_URL}/api/public/top-students`);
        
        // Fetch success stories
        const storiesPromise = axios.get(`${process.env.REACT_APP_API_URL}/api/public/success-stories`);
        
        // Wait for all requests to complete
        const [coursesRes, teachersRes, studentsRes, storiesRes] = await Promise.all([
          coursesPromise,
          teachersPromise,
          studentsPromise,
          storiesPromise
        ]);
        
        // Update state with fetched data
        setFeaturedCourses(coursesRes.data);
        setFeaturedTeachers(teachersRes.data);
        setTopStudents(studentsRes.data);
        setSuccessStories(storiesRes.data);
        
        // Update loading states
        setLoading({
          courses: false,
          teachers: false,
          students: false,
          stories: false
        });
      } catch (err) {
        console.error('Error fetching home page data:', err);
        // Handle errors for each section
        if (axios.isAxiosError(err)) {
          if (err.request && !err.response) {
            // Network error - can't reach the server
            setError({
              courses: 'Network error. Please check your connection.',
              teachers: 'Network error. Please check your connection.',
              students: 'Network error. Please check your connection.',
              stories: 'Network error. Please check your connection.'
            });
          } else {
            // Server responded with an error
            const message = err.response?.data?.message || 'An error occurred';
            setError(prev => ({
              ...prev,
              courses: message,
              teachers: message,
              students: message,
              stories: message
            }));
          }
        }
      }
    };

    fetchHomePageData();
  }, []); // Empty dependency array means this runs once on component mount

  // Function to render loading skeleton for courses
  const renderCoursesSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded-full mr-1"></div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Function to render error message
  const renderError = (message: string) => (
    <div className="text-center py-10">
      <p className="text-red-500 dark:text-red-400">{message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-primary dark:bg-secondary text-white rounded-md hover:bg-primary/90 dark:hover:bg-secondary/90"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg">
      {/* Hero Section */}
      <section className="py-16 bg-indigo-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-5xl mb-4">
            Transform Your Future with Quality Education
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join our learning community and unlock your potential
          </p>
          <Link 
            to="/courses"
            className="inline-block bg-primary hover:bg-primary/90 dark:bg-secondary dark:hover:bg-secondary/90 text-white px-8 py-3 rounded-md transition-colors duration-300"
          >
            Explore Courses
          </Link>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Featured Courses</h2>
            <Link 
              to="/courses" 
              className="text-primary dark:text-secondary hover:underline"
            >
              View All Courses
            </Link>
          </div>
          
          {loading.courses ? (
            renderCoursesSkeleton()
          ) : error.courses ? (
            renderError(error.courses)
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map(course => (
                <Link 
                  key={course._id} 
                  to={`/course/${course._id}`}
                  className="bg-indigo-50/80 dark:bg-gray-800/90 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">{course.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{course.instructor.name}</p>
                    <div className="flex items-center mb-2">
                      <span className="text-amber-500 font-semibold">{course.rating.toFixed(1)}</span>
                      <div className="flex items-center ml-1">
                        {[...Array(5)].map((_, i) => (
                          <HiStar key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-amber-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">({course.students.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-primary dark:text-secondary">${course.price.toFixed(2)}</span>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{course.duration}</span>
                        <span>•</span>
                        <span>{course.level}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Teachers Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Our Expert Teachers</h2>
            <Link 
              to="/teachers" 
              className="text-primary dark:text-secondary hover:underline"
            >
              View All Teachers
            </Link>
          </div>
          
          {loading.teachers ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center animate-pulse">
                  <div className="w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : error.teachers ? (
            renderError(error.teachers)
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTeachers.map(teacher => (
                <Link 
                  key={teacher._id} 
                  to={`/teacher/${teacher._id}`}
                  className="group"
                >
                  <div className="bg-indigo-50/80 dark:bg-gray-800/90 rounded-lg p-6 text-center">
                    <div className="mb-4">
                      <img 
                        src={teacher.image} 
                        alt={teacher.name}
                        className="w-32 h-32 mx-auto rounded-full object-cover group-hover:ring-4 ring-primary dark:ring-secondary transition-all duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-secondary mb-2">
                      {teacher.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{teacher.title}</p>
                    <p className="text-sm text-primary dark:text-secondary">{teacher.department}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Students Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            Top Performing Students
          </h2>
          
          {loading.students ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error.students ? (
            renderError(error.students)
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topStudents.map((student) => (
                <div key={student._id} className="bg-indigo-50/80 dark:bg-gray-800/90 rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {student.name}
                  </h3>
                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    <p>Grade: {student.grade}</p>
                    <p>GPA: {student.gpa}</p>
                    <p>Exam Score: {student.examScore}%</p>
                    <p className="text-primary dark:text-secondary font-medium">
                      Achievement: {student.achievements[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-16 bg-indigo-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            Success Stories
          </h2>
          
          {loading.stories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md animate-pulse">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full mr-4"></div>
                    <div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
                  <div className="mt-4 p-4 bg-gray-200 dark:bg-gray-600 rounded-lg">
                    <div className="h-4 bg-gray-300 dark:bg-gray-500 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error.stories ? (
            renderError(error.stories)
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {successStories.map((story) => (
                <div key={story._id} className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md">
                  <div className="flex items-center mb-6">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-20 h-20 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {story.name}
                      </h3>
                      <p className="text-primary dark:text-secondary">
                        {story.university}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg italic">
                    "{story.story}"
                  </p>
                  <div className="mt-4 p-4 bg-indigo-50 dark:bg-gray-600 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Achievement: {story.achievement}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
