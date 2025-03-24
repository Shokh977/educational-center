import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiAcademicCap, HiUserGroup, HiClipboardCheck, HiChat, HiChartBar } from 'react-icons/hi';

const TeacherDashboard = () => {
  const { user } = useAuth();

  // Mock data - In a real app, this would come from your backend
  const teachingCourses = [
    { 
      id: 1, 
      name: 'English for Beginners', 
      studentsCount: 25,
      averageScore: 85,
      nextClass: 'Tomorrow, 10:00 AM',
      recentSubmissions: 5
    },
    { 
      id: 2, 
      name: 'Advanced English Conversation', 
      studentsCount: 15,
      averageScore: 78,
      nextClass: 'Thursday, 2:00 PM',
      recentSubmissions: 3
    },
  ];

  const recentMessages = [
    { id: 1, student: 'John Doe', message: 'Question about homework', time: '1 hour ago' },
    { id: 2, student: 'Jane Smith', message: 'Assignment submission', time: '3 hours ago' },
  ];

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your courses and track student progress.
          </p>
        </div>

        {/* Teaching Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: HiAcademicCap, label: 'Active Courses', value: teachingCourses.length },
            { icon: HiUserGroup, label: 'Total Students', value: '40' },
            { icon: HiClipboardCheck, label: 'Pending Reviews', value: '8' },
            { icon: HiChartBar, label: 'Average Score', value: '82%' },
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center">
                <stat.icon className="w-8 h-8 text-primary dark:text-secondary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Course Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Your Courses
            </h2>
            <Link
              to="/create-course"
              className="bg-primary dark:bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary/90 dark:hover:bg-secondary/90"
            >
              Create New Course
            </Link>
          </div>
          <div className="grid gap-6">
            {teachingCourses.map(course => (
              <div key={course.id} className="border dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Next Class: {course.nextClass}
                    </p>
                  </div>
                  <Link
                    to={`/course/${course.id}/manage`}
                    className="text-primary dark:text-secondary hover:underline"
                  >
                    Manage Course
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {course.studentsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {course.averageScore}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">New Submissions</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {course.recentSubmissions}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Recent Messages
          </h2>
          <div className="divide-y dark:divide-gray-700">
            {recentMessages.map(message => (
              <div key={message.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {message.student}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {message.message}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {message.time}
                    </span>
                    <Link
                      to="/messages"
                      className="ml-4 text-primary dark:text-secondary hover:underline"
                    >
                      <HiChat className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/messages"
            className="block text-center mt-4 text-primary dark:text-secondary hover:underline"
          >
            View All Messages
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;