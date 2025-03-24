import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiAcademicCap, HiChartBar, HiClock, HiBookOpen } from 'react-icons/hi';
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
    const { user, token } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/student/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const data = await response.json();
                setDashboardData(data);
            } catch (err) {
                setError('Error loading dashboard data');
                console.error('Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user && token) {
            fetchDashboardData();
        }
    }, [user, token]);

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
                {/* Welcome Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Welcome back, {user?.name}!
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Track your learning progress and achievements
                    </p>
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