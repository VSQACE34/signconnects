import Profile from '../components/Profile';
import ResetPassword from '../components/ResetPassword';
import React, { useState } from 'react';
import Footer from '../components/Footer';
import { AuthProvider } from '../components/AuthContext';



const AccountManagement = () => {
    const [activeComponent, setActiveComponent] = useState('resetPassword');
    return (
        <>           
            <AuthProvider>                
                <Profile />
                <div className="flex justify-center mt-8">
                    <div className="inline-block border-b-2 border-gray-200">
                        <button 
                            onClick={() => setActiveComponent('resetPassword')}
                            className={`px-4 py-2 font-bold text-gray-500 hover:text-blue-900 border-b-2 border-transparent ${
                                activeComponent === 'resetPassword' ? 'border-blue-900' : 'hover:border-blue-900'
                            }`}
                        >
                            Reset Password
                        </button>
                    </div>
                </div>
                <div className="content mt-8">
                    {activeComponent === 'resetPassword' && <ResetPassword />}
                </div>
                <Footer />
            </AuthProvider>
        </>

    )
}

export default AccountManagement;
