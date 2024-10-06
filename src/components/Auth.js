import { showSuccessReport } from '../components/notiflixConfig';
import { deleteCookie, getCookie } from '../components/CookieManage';
import { useAuth } from '../components/AuthContext';

export const isAuthenticated = () => {
    return !!getCookie('accessToken');
}

// Modified handleLogout function
export const handleLogout = (navigate, logout) => {
    deleteCookie('accessToken');
    deleteCookie('idToken');
    deleteCookie('refreshToken');
    deleteCookie('userId');
    logout(); // Call the logout function from AuthContext to update isLoggedIn state
    showSuccessReport('Successfully Logged Out', 'Hope to see you again!');
    navigate('/');
};
