import React, { useState, useEffect, useRef } from 'react';
import {useDocTitle} from '../components/CustomHook';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../components/WebsiteLock';
import { setCookie } from '../components/CookieManage';

const Login = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
    }, [navigate]);

    useDocTitle('Website Authentication - TA16');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let formErrors = {};
        if (!username) formErrors.username = 'Username is required';
        if (!password) formErrors.password = 'Password is required';
            return formErrors;
    };

    const clearErrors = () => {
        setErrors({});
        setErrorMessage('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        const formData = {
            username: username,
            password: password
        };

        clearErrors();

        axios({
            method: 'post',
            url: 'https://g3ywl1bwh3.execute-api.ap-southeast-2.amazonaws.com/prod/websiteLogin',
            data: formData,
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(function (response) {
            if (response && response.data) {
                const { websiteAuth} = response.data;
                setCookie('websiteAuth', websiteAuth, 1);
                navigate('/');
            }            
        })
        .catch(function (error) {
            // Handle errors
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message);
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                }
            } else {
                setErrorMessage('Something went wrong');
            }
        });
    };

    return (
        <>
            <div id='login' className="mt-8 w-full bg-white py-12 lg:py-24" style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
                <div className="my-4" data-aos="zoom-in">
                    <form onSubmit={handleSubmit} id="loginForm">
                        <div className="w-full bg-white p-8 my-4 md:px-12 lg:w-full lg:pl-30 lg:pr-30 mr-auto rounded-2xl shadow-2xl">
                            <div className="flex">
                                <h1 className="font-bold text-center lg:text-left text-blue-900 uppercase text-4xl mx-auto">TA16 Sign-Connect Website Login</h1>
                            </div>

                            <div className="grid grid-cols-1 gap-5 mt-5 ">
                                <div>
                                    <label htmlFor="username" className="text-gray-700">Username:</label>
                                    <input
                                        name="username"
                                        className="w-full lg:w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="text"
                                        placeholder="Enter Username*"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                        }}
                                    />
                                    {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                                </div>
                            </div>
                                
                            <div className="grid grid-cols-1 gap-5 mt-5">
                                <div>
                                    <label htmlFor="password" className="text-gray-700">Password:</label>
                                    <input
                                        name="password"
                                        className="w-full lg:w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="password"
                                        placeholder="Enter Password*"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                        }}
                                    />
                                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                                </div>
                            </div>

                            {errorMessage && (
                                <div style={{ color: 'red', marginBottom: '10px' }} className="text-center">
                                    {errorMessage}
                                </div>
                            )}

                            <div className="my-2 w-full lg:w-2/4 mt-5 mx-auto">
                                <button
                                    type="submit"
                                    id="submitBtn"
                                    className="uppercase text-sm font-bold tracking-wide bg-gray-500 hover:bg-blue-900 text-gray-100 p-3 rounded-lg w-full focus:outline-none focus:shadow-outline"
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;