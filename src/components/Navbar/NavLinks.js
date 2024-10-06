import React from 'react';
import { HashLink } from 'react-router-hash-link';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, handleLogout } from '../Auth';
import { useAuth } from '../AuthContext';

const scrollWithOffset = (el) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -50; // Adjust the value for the offset to match your navbar height
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
};


const NavLinks = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    return (
        <>
            <HashLink className="px-4 font-extrabold text-gray-500 hover:text-blue-900" smooth to="/#about" scroll={el => scrollWithOffset(el)}>
                About
            </HashLink>
            <HashLink className="px-4 font-extrabold text-gray-500 hover:text-blue-900" smooth to="/#courses" scroll={el => scrollWithOffset(el)}>
                Courses
            </HashLink>
            <HashLink className="px-4 font-extrabold text-gray-500 hover:text-blue-900" smooth to="/#signs" scroll={el => scrollWithOffset(el)}>
                Sign Library
            </HashLink>
            {!isAuthenticated() ? (
                <>
                    <HashLink className="text-gray-500 hover:bg-blue-100 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-xl" smooth to="/login">
                        Log In
                    </HashLink>
                    <HashLink className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-xl" smooth to="/register">
                        Join Us
                    </HashLink>
                    </>
                ) : (
                    <button className="text-white bg-red-600 hover:bg-red-500 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-xl"onClick={() => handleLogout(navigate, logout)}>                    
                        Log Out
                    </button>
            )}
        </>
    )
}

export default NavLinks;
