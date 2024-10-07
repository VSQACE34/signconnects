import React from 'react';
import { Navigate } from 'react-router-dom'; 
import { setCookie, getCookie } from '../components/CookieManage';

export const isAuthenticated = () => {
    const authStatus = getCookie('websiteAuth');
    
    if (authStatus === null || authStatus === undefined) {
        setCookie('websiteAuth', 'false', 1);
        return false;
    }

    return authStatus === 'true'; 
}

const WebsiteLock = ({children}) => {
    const auth = isAuthenticated();
    if (!auth) {
        return <Navigate to="/website-login" />;
    }
    return children;
};

export default WebsiteLock;