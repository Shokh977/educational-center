import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role: 'student' | 'teacher') => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
            console.log('Raw login response:', text);
    
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Error parsing login response:', parseError, 'Raw response:', text);
                throw new Error('Server returned invalid JSON');
            }
    
            if (!response.ok) {
                throw new Error(data.message || 'Failed to login');
            }
    
            if (!data.token || !data.user) {
                console.error('Invalid response format:', data);
                throw new Error('Invalid response format from server');
            }
    
            localStorage.setItem('token', data.token);
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
                // First try to get the raw text
                text = await response.text();
                // Then try to parse it as JSON
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

            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
        } catch (error: any) {
            console.error('Registration error details:', error);
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
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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