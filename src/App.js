import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { HiMoon, HiSun } from 'react-icons/hi';
import Courses from './components/Courses';
import FeaturedCourses from './components/FeaturedCourses';
import CourseDetail from './components/CourseDetail';
import EnrollmentPage from './components/EnrollmentPage';
import Teachers from './components/Teachers';
import TeacherDetail from './components/TeacherDetail';
import Students from './components/Students';
import SuccessStories from './components/SuccessStories';
import { teachersData } from './components/TeachersData';

function HomeContent() {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero Section */}
      <div className="bg-indigo-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-5xl">
              Transform Your Future with Quality
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              Join our learning community and unlock your potential
            </p>
            <button 
              onClick={() => navigate('/courses')}
              className="mt-8 bg-primary dark:bg-secondary text-white px-8 py-3 rounded-md hover:bg-indigo-700 dark:hover:bg-amber-600 transition-colors duration-300"
            >
              Explore Courses
            </button>
          </div>
        </div>
      </div>

      {/* Featured Courses Section */}
      <FeaturedCourses />

      {/* Teachers Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {teachersData.slice(0, 6).map((teacher) => (
              <Link 
                key={teacher.id} 
                to={`/teacher/${teacher.id}`}
                className="text-center group"
              >
                <div className="relative mb-4">
                  <img 
                    src={teacher.image} 
                    alt={teacher.name}
                    className="w-32 h-32 mx-auto rounded-full object-cover group-hover:ring-4 ring-primary dark:ring-secondary transition-all duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-secondary">
                  {teacher.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{teacher.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Top Students Section */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">Top Performing Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 mr-4"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Student Name</h3>
                    <p className="text-gray-600 dark:text-gray-400">Course Name</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Score: 98%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories Section */}
      <div className="py-16 bg-indigo-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-400 mb-4">"Success story quote goes here..."</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 mr-4"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Graduate Name</h3>
                    <p className="text-gray-600 dark:text-gray-400">Current Position</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">What Our Students Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-4">"Testimonial quote goes here..."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 mr-3"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Student Name</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Course Name</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Categories Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">Course Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Programming', 'Design', 'Business', 'Marketing'].map((category) => (
              <div key={category} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-primary dark:text-secondary">{category}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">12 Courses</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <Router>
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText transition-colors duration-300">
          {/* Navbar */}
          <nav className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex-shrink-0">
                  <Link to="/" className="text-2xl font-bold text-primary dark:text-secondary">EduCenter Test</Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:block">
                  <div className="ml-10 flex items-center space-x-4">
                    <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary px-3 py-2 transition-colors duration-300">Home</Link>
                    <Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary px-3 py-2 transition-colors duration-300">Courses</Link>
                    <Link to="/teachers" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary px-3 py-2 transition-colors duration-300">Teachers</Link>
                    <Link to="/success-stories" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary px-3 py-2 transition-colors duration-300">Success Stories</Link>
                    <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary px-3 py-2 transition-colors duration-300">Contact</Link>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                    aria-label="Toggle dark mode"
                  >
                    {darkMode ? (
                      <HiSun className="w-6 h-6 text-amber-500 transform transition-transform duration-500 hover:rotate-90" />
                    ) : (
                      <HiMoon className="w-6 h-6 text-gray-700 transform transition-transform duration-500 hover:-rotate-90" />
                    )}
                  </button>

                  {/* Mobile menu button */}
                  <button
                    onClick={toggleMobileMenu}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                    aria-label="Toggle mobile menu"
                  >
                    <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1.5 transition-all duration-300 transform origin-right" style={{ transform: isMobileMenuOpen ? 'rotate(-45deg) translate(0, -2px)' : 'none' }}></div>
                    <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1.5 transition-all duration-300" style={{ opacity: isMobileMenuOpen ? 0 : 1 }}></div>
                    <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 transform origin-right" style={{ transform: isMobileMenuOpen ? 'rotate(45deg) translate(0, 2px)' : 'none' }}></div>
                  </button>
                </div>
              </div>

              {/* Mobile Navigation Menu */}
              <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <Link to="/" className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary px-3 py-2 rounded-md transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                  <Link to="/courses" className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary px-3 py-2 rounded-md transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Courses</Link>
                  <Link to="/teachers" className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary px-3 py-2 rounded-md transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Teachers</Link>
                  <Link to="/success-stories" className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary px-3 py-2 rounded-md transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Success Stories</Link>
                  <Link to="/contact" className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary px-3 py-2 rounded-md transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Routes */}
          <Routes>
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/enroll/:courseId" element={<EnrollmentPage />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teacher/:teacherId" element={<TeacherDetail />} />
            <Route path="/students" element={<Students />} />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/" element={<HomeContent />} />
          </Routes>

          {/* Footer */}
          <footer className="bg-gray-800 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xl font-bold font mb-4">EduCenter</h3>
                  <p className="text-gray-400">Transforming lives through education</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Courses</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Teachers</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Contact Info</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li>contact@educenter.com</li>
                    <li>+1 234 567 8900</li>
                    <li>123 Education St, City</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Follow Us</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                    <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                    <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
                <p>&copy; 2024 EduCenter. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
