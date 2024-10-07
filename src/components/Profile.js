import React , { useState, useEffect } from 'react';
import { getCookie } from '../components/CookieManage';
import NavBar from '../components/Navbar/NavBar';

const Profile = () => {
    const [username, setUsername] = useState('');
    useEffect(() => {
        const storedUsername = getCookie('cognitoUsername');
        setUsername(storedUsername);
    }, []);
    return (
        <>
            <div className="profile" id='profile'>
                <div>
                    <NavBar/>
                </div> 
                <div className="m-auto overflow-hidden mx-4 mt-8 lg:mt-4 p-2 md:p-12 h-5/6 ml-11" data-aos="zoom-in">
                    <div id='profile' className="flex flex-col lg:flex-row py-8 justify-between text-center lg:text-left w-full">
                        <div className="lg:w-1/2 flex flex-col justify-center" data-aos="zoom-in" data-aos-delay="200">
                            <h2 className="mb-5 md:text-4xl text-3xl font-bold text-blue-900">
                                Profile
                            </h2>
                            <div className="text-xl font-semibold tracking-tight mb-5 text-gray-500">
                                Manage Your Profile
                            </div>
                            {username && (
                                <div className="text-3xl font-semibold text-blue-700">
                                    {username.toUpperCase()}
                                </div>
                            )}
                        </div>                        
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;