import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiLockClosed, HiMail, HiUser, HiArrowRight, HiAcademicCap } from 'react-icons/hi';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!name.trim()) {
                throw new Error('Name is required');
            }

            if (!email.trim() || !email.includes('@')) {
                throw new Error('Valid email is required');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // All new registrations are students by default
            await register(name.trim(), email.trim(), password, 'student');
            navigate('/');
        } catch (err: any) {
            console.error('Registration error:', err);
            
            // Handle different types of errors
            if (err.message.includes('fetch')) {
                setError('Network error. Please check your connection.');
            } else if (typeof err.message === 'string') {
                setError(err.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-lightBg dark:bg-darkBg flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-16 -right-16 w-96 h-96 rounded-full bg-primary/5 dark:bg-secondary/5"></div>
                <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-primary/10 dark:bg-secondary/10"></div>
                <div className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full bg-primary/5 dark:bg-secondary/5"></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row w-full max-w-5xl">
                {/* Left side - Register Form */}
                <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl md:rounded-r-none md:rounded-l-2xl shadow-xl order-2 md:order-1">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h2>
                        <p className="text-gray-600 dark:text-gray-400">Join our learning platform and start your educational journey</p>
                    </div>
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 border-l-4 border-red-500">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email address
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiLockClosed className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        minLength={6}
                                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Minimum 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Password must be at least 6 characters long</p>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Creating account...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <span>Create account</span>
                                        <HiArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </button>
                        </div>
                        
                        <div className="relative flex items-center justify-center mt-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Already have an account?</span>
                            </div>
                        </div>
                        
                        <div className="mt-2 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                            <Link
                                to="/login"
                                className="font-medium text-primary dark:text-secondary hover:text-primary/90 dark:hover:text-secondary/90 inline-flex items-center"
                            >
                                Sign in to your account
                                <HiArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                            
                            <button
                                type="button"
                                className="font-medium text-primary dark:text-secondary hover:text-primary/90 dark:hover:text-secondary/90 inline-flex items-center"
                                onClick={() => navigate('/contact')}
                            >
                                Want to teach?
                                <HiAcademicCap className="ml-1 h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Right side - Illustration/Content */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-700 to-primary/90 dark:from-teal-700 dark:to-secondary/90 rounded-r-2xl p-8 text-white flex-col justify-center order-1 md:order-2">
                    <h1 className="text-4xl font-bold mb-6">Start Your Learning Journey Today</h1>
                    <p className="text-lg mb-8 opacity-90">Join thousands of students already learning with our comprehensive courses and expert instructors.</p>
                    
                    <div className="space-y-4">
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <div className="bg-white/20 rounded-full p-2 mr-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="font-semibold text-lg">Personalized Learning</div>
                            </div>
                            <p className="text-white/80 ml-10">Customized learning paths tailored to your unique needs and goals</p>
                        </div>
                        
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <div className="bg-white/20 rounded-full p-2 mr-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="font-semibold text-lg">Learn at Your Own Pace</div>
                            </div>
                            <p className="text-white/80 ml-10">Access course materials 24/7 and study whenever it fits your schedule</p>
                        </div>
                        
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <div className="bg-white/20 rounded-full p-2 mr-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="font-semibold text-lg">Expert Community</div>
                            </div>
                            <p className="text-white/80 ml-10">Connect with peers and learn from experienced instructors in your field</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;