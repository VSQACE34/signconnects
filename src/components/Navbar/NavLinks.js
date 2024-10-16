import React from 'react';
import { HashLink } from 'react-router-hash-link';
import { useNavigate, useLocation  } from 'react-router-dom';
import { isAuthenticated, handleLogout } from '../Auth';
import { useAuth } from '../AuthContext';
import ProfileIcon from '../../images/profileIcon.png';

const scrollWithOffset = (el) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -50; // Adjust the value for the offset to match your navbar height
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
};


const NavLinks = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path) => {
        return location.pathname == path ? 'border-b-2 border-blue-900 mt-s' : '';
    };
    
    return (
        <>
            <HashLink className={`px-4 font-extrabold text-gray-500 hover:text-blue-900 pb-2 ${isActive("/")}`} smooth to="/" scroll={el => scrollWithOffset(el)}>
                Home
            </HashLink>
            <HashLink className={`px-4 font-extrabold text-gray-500 hover:text-blue-900 pb-2 ${isActive("/courses")}`} smooth to="/courses" scroll={el => scrollWithOffset(el)}>
                Courses
            </HashLink>
            <HashLink className={`px-4 font-extrabold text-gray-500 hover:text-blue-900 pb-2 ${isActive("/sign_library")}`} smooth to="/sign_library">
                Sign Library
            </HashLink>
            <HashLink className={`px-4 font-extrabold text-gray-500 hover:text-blue-900 pb-2 ${isActive("/quiz-selection")}`} smooth to="/quiz-selection">
                Quiz 
            </HashLink>
            <HashLink className={`px-4 font-extrabold text-gray-500 hover:text-blue-900 pb-2 ${isActive("/insight")}`} smooth to="/insight">
                Insight
            </HashLink>
            <HashLink className={`px-4 font-extrabold text-gray-500 hover:text-blue-900 pb-2 ${isActive("/translation")}`} smooth to="/translation">
            AUSLAN Translator
            {/* Beta Tag */}
            <span className="ml-2 text-xs text-white bg-red-500 px-1.5 py-0.5 rounded-full">
                beta
            </span>
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
                    <>
                        <HashLink className="inline-flex items-center px-2" smooth to="/account-management">
                            <img 
                                src={ProfileIcon}
                                alt="Profile Icon" 
                                className="w-10 h-10 rounded-full object-cover transform translate-y-4"
                            />
                        </HashLink>
                        
                        <button className="text-white bg-red-600 hover:bg-red-500 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-xl"onClick={() => handleLogout(navigate, logout)}>                    
                            Log Out
                        </button>
                    </>
                )
            }
        </>
    )
}

export default NavLinks;
