import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Courses from './components/Courses';
import Performance from './pages/Performance';
import Contact from './pages/Contact';
import CourseDetail from './components/CourseDetail';
import EnrollmentPage from './components/EnrollmentPage';
import Teachers from './components/Teachers';
import TeacherDetail from './components/TeacherDetail';
import Students from './components/Students';
import SuccessStories from './components/SuccessStories';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import Blog from './pages/Blog';
import BlogPostDetail from './pages/BlogPostDetail';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Router>
      <AuthProvider>
        <div className={darkMode ? 'dark' : ''}>
          <div className="min-h-screen bg-lightBg dark:bg-darkBg text-gray-700 dark:text-darkText transition-colors duration-300">
            <Navbar onToggleDarkMode={toggleDarkMode} isDarkMode={darkMode} />

            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:courseId" element={<CourseDetail />} />
                <Route 
                  path="/enroll/:courseId" 
                  element={
                    <ProtectedRoute>
                      <EnrollmentPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/teacher/:teacherId" element={<TeacherDetail />} />
                <Route 
                  path="/students" 
                  element={
                    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <Students />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <TeacherDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/success-stories" element={<SuccessStories />} />
                <Route 
                  path="/performance" 
                  element={
                    <ProtectedRoute>
                      <Performance />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPostDetail />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
