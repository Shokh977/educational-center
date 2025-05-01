import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiAcademicCap, HiChartBar, HiClock, HiBookOpen } from 'react-icons/hi';
import UserProfile from './UserProfile';
import axios from 'axios';

interface CourseProgress {
    course: {
        _id: string;
        title: string;
        description: string;
    };
    progress: number;
    examResults: {
        examTitle: string;
        score: number;
        maxScore: number;
        dateTaken: string;
    }[];
}

interface DashboardData {
    stats: {
        totalCourses: number;
        completedCourses: number;
        inProgressCourses: number;
        averageProgress: number;
        learningStreak: {
            currentStreak: number;
            longestStreak: number;
            lastActivity: string;
        };
    };
    enrolledCourses: CourseProgress[];
    achievements: {
        name: string;
        description: string;
        earnedDate: string;
        icon: string;
    }[];
    skillsAcquired: {
        name: string;
        level: 'beginner' | 'intermediate' | 'advanced';
        endorsements: number;
    }[];
}

const StudentDashboard: React.FC = () => {
    const { user, token, updateProfile } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showProfileEditor, setShowProfileEditor] = useState(false);

    // Function to handle profile updates
    const handleProfileUpdate = async (name: string, imageFile: File | null) => {
        try {
            setLoading(true);
            await updateProfile(name, imageFile);
            setShowProfileEditor(false);
            // Show success message or notification here if desired
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fix API_BASE_URL to prevent duplicate /api in the path
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    // Remove trailing /api if it exists to prevent duplication
    const API_BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!token) {
                    setError('Authentication token missing. Please log in again.');
                    setLoading(false);
                    return;
                }                // Use the proper URL path for the API
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Dashboard API error:', errorData);
                    throw new Error(errorData.message || 'Failed to fetch dashboard data');
                }

                // Get the user data
                const userData = await response.json();
                
                // Since we don't have a dedicated dashboard endpoint yet, 
                // let's create mock dashboard data based on the user info
                const mockDashboardData = {
                    stats: {
                        totalCourses: 3,
                        completedCourses: 1,
                        inProgressCourses: 2,
                        averageProgress: 45,
                        learningStreak: {
                            currentStreak: 5,
                            longestStreak: 12,
                            lastActivity: new Date().toISOString()
                        }
                    },
                    enrolledCourses: [
                        {
                            course: {
                                _id: '1',
                                title: 'Introduction to Web Development',
                                description: 'Learn the basics of HTML, CSS, and JavaScript'
                            },
                            progress: 75,
                            examResults: []
                        },
                        {
                            course: {
                                _id: '2',
                                title: 'React Fundamentals',
                                description: 'Master React and build modern web applications'
                            },
                            progress: 30,
                            examResults: []
                        },
                        {
                            course: {
                                _id: '3',
                                title: 'Node.js Backend Development',
                                description: 'Build robust backend services with Node.js'
                            },
                            progress: 15,
                            examResults: []
                        }
                    ],
                    achievements: [
                        {
                            name: 'First Course Completed',
                            description: 'You completed your first course!',
                            earnedDate: new Date().toISOString(),
                            icon: '🏆'
                        }
                    ],                    skillsAcquired: [
                        {
                            name: 'HTML',
                            level: 'intermediate' as const,
                            endorsements: 2
                        },
                        {
                            name: 'CSS',
                            level: 'beginner' as const,
                            endorsements: 1
                        }
                    ]
                };
                
                setDashboardData(mockDashboardData);
            } catch (err) {
                console.error('Dashboard error:', err);
                setError(err instanceof Error ? err.message : 'Error loading dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user && token) {
            fetchDashboardData();
        } else if (!loading && !user) {
            setError('Please login to view your dashboard');
        }
    }, [user, token, API_URL]);

    if (loading) {
        return (
            <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-red-600 dark:text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Welcome back, {user?.name}!
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Track your learning progress and achievements
                    </p>
                </div>

                {/* Profile Management Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Profile Settings
                    </h2>
                    <div className="flex justify-between items-start">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Update your profile information
                        </p>
                        <button 
                            onClick={() => setShowProfileEditor(prev => !prev)} 
                            className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-sm"
                        >
                            {showProfileEditor ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                    
                    {showProfileEditor && (
                        <UserProfile 
                            currentName={user?.name || ''} 
                            currentImage={user?.profileImage || 'https://via.placeholder.com/150'} 
                            onSave={handleProfileUpdate}
                        />
                    )}
                </div>

                {/* Learning Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                        <div className="flex items-center">
                            <HiBookOpen className="w-8 h-8 text-primary dark:text-secondary" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Courses
                                </p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    {dashboardData.stats.totalCourses}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                        <div className="flex items-center">
                            <HiAcademicCap className="w-8 h-8 text-primary dark:text-secondary" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Completed
                                </p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    {dashboardData.stats.completedCourses}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                        <div className="flex items-center">
                            <HiChartBar className="w-8 h-8 text-primary dark:text-secondary" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Average Progress
                                </p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    {Math.round(dashboardData.stats.averageProgress)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                        <div className="flex items-center">
                            <HiClock className="w-8 h-8 text-primary dark:text-secondary" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Learning Streak
                                </p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    {dashboardData.stats.learningStreak.currentStreak} days
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Progress */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Your Courses
                    </h2>
                    <div className="space-y-4">
                        {dashboardData.enrolledCourses.map((course) => (
                            <div key={course.course._id} className="border dark:border-gray-700 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                            {course.course.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {course.course.description}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary dark:text-secondary">
                                            {Math.round(course.progress)}%
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Progress
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <div
                                        className="h-2 bg-primary dark:bg-secondary rounded-full"
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievements */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Achievements
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {dashboardData.achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="border dark:border-gray-700 rounded-lg p-4 flex items-start"
                            >
                                <div className="text-3xl mr-4">{achievement.icon}</div>
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                        {achievement.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {achievement.description}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                        Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Skills Acquired
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dashboardData.skillsAcquired.map((skill, index) => (
                            <div
                                key={index}
                                className="border dark:border-gray-700 rounded-lg p-4"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                        {skill.name}
                                    </h3>
                                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary">
                                        {skill.level}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {skill.endorsements} endorsements
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;