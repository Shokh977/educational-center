import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    profileImage?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role: 'student' | 'teacher') => Promise<void>;
    logout: () => void;
    updateProfile: (name: string, imageFile: File | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Fix API_BASE_URL - remove redundant /api if it's already in the environment variable
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    // Remove trailing /api if it exists to prevent duplication
    const API_BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!token) {
                    setLoading(false);
                    return;
                }
                
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                let data;
                try {
                    data = await response.json();
                } catch (parseError) {
                    console.error('Error parsing user data:', parseError);
                    localStorage.removeItem('token');
                    setToken(null);
                    setLoading(false);
                    return;
                }

                if (response.ok) {
                    setUser(data);
                } else {
                    console.error('Failed to validate token:', data);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                localStorage.removeItem('token');
                setToken(null);
            }
            setLoading(false);
        };

        fetchUser();
    }, [token, API_BASE_URL]);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
    
            // Get raw response text for debugging
            const text = await response.text();
            console.log('Raw login response:', text);            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Error parsing login response:', parseError, 'Raw response:', text);
                throw new Error('Server returned invalid JSON');
            }
    
            if (!response.ok) {
                console.error('Login failed:', data);
                throw new Error(data.message || 'Failed to login');
            }
            
            // Log successful login data for debugging
            console.log('Login successful, received data:', {
                token: data.token ? 'Token received' : 'No token',
                user: data.user ? `User with role: ${data.user.role}` : 'No user data',
            });
    
            if (!data.token || !data.user) {
                console.error('Invalid response format:', data);
                throw new Error('Invalid response format from server');
            }
    
            // Store token in localStorage AND a session cookie for better persistence
            localStorage.setItem('token', data.token);
            document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
            
            setToken(data.token);
            setUser(data.user);
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, role: 'student' | 'teacher') => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role })
            });

            let data;
            let text;
            try {
                text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    console.error('Raw response:', text);
                    throw new Error('Server response was not valid JSON');
                }
            } catch (error) {
                console.error('Error reading response:', error);
                throw new Error('Failed to read server response');
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Registration failed');
            }

            if (!data.token || !data.user) {
                console.error('Invalid response format:', data);
                throw new Error('Invalid response format from server');
            }

            // Store token in localStorage AND a session cookie for better persistence
            localStorage.setItem('token', data.token);
            document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
            
            setToken(data.token);
            setUser(data.user);
        } catch (error: any) {            console.error('Registration error details:', error);
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        // Also clear the cookie
        document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
        setToken(null);
        setUser(null);
    };    // Add the updateProfile function
    const updateProfile = async (name: string, imageFile: File | null) => {
        try {
            if (!token || !user) {
                throw new Error('You must be logged in to update your profile');
            }

            let imageUrl = user.profileImage; // Use existing profile image if no new one is provided

            try {
                // Use Cloudinary for image upload instead of Firebase
                if (imageFile) {
                    const { updateUserProfileWithCloudinary } = await import('../services/cloudinary');
                    const newImageUrl = await updateUserProfileWithCloudinary(name, imageFile, user.id);
                    
                    // If a new image was uploaded, update the imageUrl variable
                    if (newImageUrl) {
                        imageUrl = newImageUrl;
                    }
                }
            } catch (profileUpdateError) {
                console.error('Error updating profile image:', profileUpdateError);
                // Continue with the backend update even if image upload fails
            }

            // Update the user profile in your backend
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, profileImage: imageUrl })
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Update the local user state
            setUser(prev => prev ? { ...prev, name, profileImage: imageUrl } : null);
            
            return;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    // Helper function to retrieve token from cookies (for refresh persistence)
    const getTokenFromCookies = () => {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'auth_token') {
                return value;
            }
        }
        return null;
    };

    // On initialization, try to recover token from cookies if not in localStorage
    useEffect(() => {
        if (!token) {
            const cookieToken = getTokenFromCookies();
            if (cookieToken) {
                localStorage.setItem('token', cookieToken);
                setToken(cookieToken);
            }
        }
    }, []);    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};