import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-lightBg dark:bg-darkBg flex items-center justify-center">
                <div className="text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        switch (user.role) {
            case 'admin':
                return <Navigate to="/admin-dashboard" />;
            case 'teacher':
                return <Navigate to="/teacher-dashboard" />;
            case 'student':
                return <Navigate to="/student-dashboard" />;
            default:
                return <Navigate to="/" />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;