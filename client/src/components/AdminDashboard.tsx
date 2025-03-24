import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiAcademicCap, HiUserGroup, HiBookOpen, HiPlus, HiPencil, HiTrash, HiCheck, HiX } from 'react-icons/hi';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Course {
  _id: string;
  title: string;
  instructor: {
    _id: string;
    name: string;
  };
  category: string;
  status: 'active' | 'inactive';
}

const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    // Fetch users and courses data
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use axios instead of fetch for better error handling
        const [usersResponse, coursesResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/admin/courses`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);

        setUsers(usersResponse.data);
        setCourses(coursesResponse.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load data. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'admin' && token) {
      fetchData();
    }
  }, [user, token]);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/admin/users/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  };

  const handleToggleCourseStatus = async (courseId: string) => {
    try {
      const course = courses.find(c => c._id === courseId);
      if (!course) return;
      
      const newStatus = course.status === 'active' ? 'inactive' : 'active';

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/admin/courses/${courseId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setCourses(courses.map(course =>
        course._id === courseId ? { ...course, status: newStatus as 'active' | 'inactive' } : course
      ));
    } catch (error) {
      console.error('Error updating course status:', error);
      alert('Failed to update course status. Please try again.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordChangeMessage({
        type: 'error',
        text: 'New passwords do not match'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordChangeMessage({
        type: 'error',
        text: 'New password must be at least 6 characters long'
      });
      return;
    }

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/admin/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setPasswordChangeMessage({
        type: 'success',
        text: 'Password updated successfully'
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      setPasswordChangeMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update password'
      });
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Access denied. Admin privileges required.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-secondary"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary dark:bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary/90 dark:hover:bg-secondary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage users, courses, and website content
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center">
              <HiUserGroup className="w-8 h-8 text-primary dark:text-secondary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {users.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center">
              <HiBookOpen className="w-8 h-8 text-primary dark:text-secondary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Courses
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {courses.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center">
              <HiAcademicCap className="w-8 h-8 text-primary dark:text-secondary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Teachers
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {users.filter(u => u.role === 'teacher').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-primary dark:border-secondary text-primary dark:text-secondary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Users Management
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`${
                activeTab === 'courses'
                  ? 'border-primary dark:border-secondary text-primary dark:text-secondary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Course Management
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`${
                activeTab === 'settings'
                  ? 'border-primary dark:border-secondary text-primary dark:text-secondary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Content Sections */}
        {activeTab === 'users' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Users
                </h2>
                <button className="bg-primary dark:bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary/90 dark:hover:bg-secondary/90">
                  <HiPlus className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map(user => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary p-2"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'courses' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Courses
                </h2>
                <button className="bg-primary dark:bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary/90 dark:hover:bg-secondary/90">
                  Add Course
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {courses.map(course => (
                      <tr key={course._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {course.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {course.instructor?.name || 'Unknown Instructor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {course.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              course.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {course.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleToggleCourseStatus(course._id)}
                            className={`mr-2 ${
                              course.status === 'active'
                                ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300'
                                : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                            }`}
                          >
                            {course.status === 'active' ? (
                              <HiX className="w-5 h-5" />
                            ) : (
                              <HiCheck className="w-5 h-5" />
                            )}
                          </button>
                          <button className="text-primary dark:text-secondary hover:text-primary/90 dark:hover:text-secondary/90">
                            <HiPencil className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                Change Password
              </h2>
              
              {passwordChangeMessage && (
                <div className={`mb-4 p-4 rounded-md ${
                  passwordChangeMessage.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200' 
                    : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200'
                }`}>
                  {passwordChangeMessage.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-primary dark:focus:border-secondary focus:outline-none focus:ring-primary dark:focus:ring-secondary sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    minLength={6}
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-primary dark:focus:border-secondary focus:outline-none focus:ring-primary dark:focus:ring-secondary sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    minLength={6}
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-primary dark:focus:border-secondary focus:outline-none focus:ring-primary dark:focus:ring-secondary sm:text-sm"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;