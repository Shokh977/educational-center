import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiSun, HiMoon, HiUserCircle } from 'react-icons/hi';

interface NavbarProps {
    onToggleDarkMode: () => void;
    isDarkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleDarkMode, isDarkMode }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileDropdownOpen(false);
    };

    const getDashboardLink = (): string => {
        if (!user) return '/';
        switch (user.role) {
            case 'admin':
                return '/admin-dashboard';
            case 'teacher':
                return '/teacher-dashboard';
            case 'student':
                return '/student-dashboard';
            default:
                return '/';
        }
    };    const renderNavLinks = () => {
        const commonLinks = [
            { to: '/', text: 'Home' },
            { to: '/courses', text: 'Courses' },
            { to: '/teachers', text: 'Teachers' },
        ];

        const adminLinks = [
            { to: '/admin-dashboard', text: 'Admin Dashboard' },
            { to: '/students', text: 'Students' },
            { to: '/performance', text: 'Performance' },
        ];

        const teacherLinks = [
            { to: '/teacher-dashboard', text: 'Teacher Dashboard' },
            { to: '/students', text: 'Students' },
            { to: '/performance', text: 'Performance' },
        ];

        const studentLinks = [
            { to: '/student-dashboard', text: 'My Dashboard' },
            { to: '/performance', text: 'My Performance' },
        ];

        let links = [...commonLinks];

        if (user) {
            switch (user.role) {
                case 'admin':
                    links = [...links, ...adminLinks];
                    break;
                case 'teacher':
                    links = [...links, ...teacherLinks];
                    break;
                case 'student':
                    links = [...links, ...studentLinks];
                    break;
            }
        }

        return links.map(link => {
            const isActive = location.pathname === link.to;
            return (
                <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                        isActive
                            ? 'text-primary dark:text-secondary bg-gray-100 dark:bg-gray-700 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    {link.text}
                </Link>
            );
        });
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link 
                            to="/" 
                            className={`text-xl font-bold ${
                                location.pathname === '/'
                                    ? 'text-primary dark:text-secondary'
                                    : 'text-gray-700 dark:text-gray-100 hover:text-primary dark:hover:text-secondary'
                            }`}
                        >
                            EduPortal
                        </Link>

                        <div className="hidden md:flex items-center space-x-4 ml-10">
                            {renderNavLinks()}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onToggleDarkMode}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                <HiSun className="w-6 h-6 text-yellow-500" />
                            ) : (
                                <HiMoon className="w-6 h-6 text-gray-600" />
                            )}
                        </button>                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary"                                >
                                    {user.profileImage ? (
                                        <>
                                        {console.log('Profile image URL:', user.profileImage)}
                                        <img 
                                            src={user.profileImage} 
                                            alt={user.name} 
                                            className="w-8 h-8 rounded-full object-cover"
                                            onError={(e) => {
                                                console.error('Error loading profile image');
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                // Fall back to the user icon
                                                const parent = (e.target as HTMLElement).parentElement;
                                                if (parent) {
                                                    const icon = document.createElement('span');
                                                    icon.className = "w-8 h-8";
                                                    parent.appendChild(icon);
                                                }
                                            }}
                                        />
                                        </>
                                    ) : (
                                        <HiUserCircle className="w-8 h-8" />
                                    )}
                                    <span className="hidden md:block">{user.name}</span>
                                </button>

                                {isProfileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                                        <div className="py-1">
                                            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                                Signed in as<br />
                                                <span className="font-medium">{user.email}</span>
                                            </div>
                                            <div className="border-t border-gray-100 dark:border-gray-600"></div>
                                            <Link
                                                to={getDashboardLink()}
                                                className={`block px-4 py-2 text-sm ${
                                                    location.pathname === getDashboardLink()
                                                        ? 'bg-gray-100 dark:bg-gray-600 text-primary dark:text-secondary font-medium'
                                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                }`}
                                                onClick={() => setIsProfileDropdownOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                                        location.pathname === '/login'
                                            ? 'text-primary dark:text-secondary font-medium'
                                            : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary'
                                    }`}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    className={`px-3 py-2 rounded-md ${
                                        location.pathname === '/register'
                                            ? 'bg-primary/90 dark:bg-secondary/90'
                                            : 'bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90'
                                    } text-white`}
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                            aria-label="Toggle mobile menu"
                        >
                            <div 
                                className="w-6 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1.5 transition-all duration-300 transform origin-right"
                                style={{ transform: isMobileMenuOpen ? 'rotate(-45deg) translate(0, -2px)' : 'none' }}
                            ></div>
                            <div 
                                className="w-6 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1.5 transition-all duration-300"
                                style={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                            ></div>
                            <div 
                                className="w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 transform origin-right"
                                style={{ transform: isMobileMenuOpen ? 'rotate(45deg) translate(0, 2px)' : 'none' }}
                            ></div>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {renderNavLinks()}
                        {!user && (
                            <>
                                <Link
                                    to="/login"
                                    className={`block px-3 py-2 rounded-md transition-colors duration-200 ${
                                        location.pathname === '/login'
                                            ? 'text-primary dark:text-secondary bg-gray-100 dark:bg-gray-700 font-medium'
                                            : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    className={`block px-3 py-2 rounded-md ${
                                        location.pathname === '/register'
                                            ? 'bg-primary/90 dark:bg-secondary/90'
                                            : 'bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90'
                                    } text-white`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
