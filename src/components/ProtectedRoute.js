import React from 'react';
import { Navigate } from 'react-router-dom'; 
import { getCookie } from '../components/CookieManage';

const ProtectedRoute = ({children}) => {
    const isAuthenticated = !!getCookie('accessToken');
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return children;
};

export default ProtectedRoute;