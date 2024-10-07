import React, { useState, useEffect, useRef } from 'react';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';
import {useDocTitle} from '../components/CustomHook';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../components/Auth';
import { setCookie } from '../components/CookieManage';
import { useAuth } from '../components/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';

const RECAPTCHA_SITE_KEY = '6LdK_FgqAAAAAKuoBJTZo75DOWnWs3wiJJ9TksDR';

const Login = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const recaptchaRef = useRef(null);

    const { login } = useAuth();
    
    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
        const recaptchaScript = document.createElement('script');
        recaptchaScript.src = "https://www.google.com/recaptcha/api.js";
        recaptchaScript.async = true;
        recaptchaScript.defer = true;
        document.body.appendChild(recaptchaScript);
    }, [navigate]);

    useDocTitle('Login - Sign-Connect');

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
        recaptchaRef.current.execute();
    };

    const handleRecaptchaChange = () => {
        const formData = {
            username: username,
            password: password
        };

        clearErrors();

        axios({
            method: 'post',
            url: 'https://g3ywl1bwh3.execute-api.ap-southeast-2.amazonaws.com/prod/login',
            data: formData,
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(function (response) {
            if (response && response.data) {
                const { accessToken, idToken, refreshToken, userId, username: cognitoUsername } = response.data;

                // Token hndling
                setCookie('accessToken', accessToken, 7);
                setCookie('idToken', idToken, 7);
                setCookie('refreshToken', refreshToken, 7);
                setCookie('userId', userId, 7);
                setCookie('cognitoUsername', cognitoUsername, 7);
                navigate('/');
                login();
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
            <div>
                <NavBar />
            </div>
            <div id='login' className="mt-8 w-full bg-white py-12 lg:py-24" style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
                <div className="my-4" data-aos="zoom-in">
                    <form onSubmit={handleSubmit} id="loginForm">
                        <div className="w-full bg-white p-8 my-4 md:px-12 lg:w-full lg:pl-30 lg:pr-30 mr-auto rounded-2xl shadow-2xl">
                            <div className="flex">
                                <h1 className="font-bold text-center lg:text-left text-blue-900 uppercase text-4xl mx-auto">Login</h1>
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

                            <div className="flex justify-center items-center my-2">
                                <Link to="/forgot-password" className="flex justify-center text-gray-500 hover:text-blue-500 focus:outline-none text-sm">
                                    Forgotten Password?
                                </Link>                                
                            </div>
                            
                            <hr className="my-4 border-gray-300" />
                            <div className="flex justify-center items-center my-4">
                                <Link to="/register" className="uppercase text-sm font-bold tracking-wide bg-gray-500 hover:bg-green-900 text-gray-100 p-3 rounded-lg focus:outline-none focus:shadow-outline">
                                    Create new account
                                </Link>
                            </div>
                        </div>
                    </form>
                    <ReCAPTCHA
                        sitekey={RECAPTCHA_SITE_KEY}
                        size="invisible"
                        ref={recaptchaRef}
                        onChange={handleRecaptchaChange}
                    />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Login;