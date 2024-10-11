import React, { useState, useEffect, useRef} from 'react';
import NavBar from '../components/Navbar/NavBar';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import {useDocTitle} from '../components/CustomHook';
import axios from 'axios';
import { showSuccessReport } from '../components/notiflixConfig';
import { isAuthenticated } from '../components/Auth';
import ReCAPTCHA from 'react-google-recaptcha';

const RECAPTCHA_SITE_KEY = '6LdK_FgqAAAAAKuoBJTZo75DOWnWs3wiJJ9TksDR';

const Register = (props) => {
    useDocTitle('Register - Sign-Connect');
    const navigate = useNavigate();
    const recaptchaRef = useRef(null);

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

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [errors, setErrors] = useState({});
    const [apiErrorMessage, setApiErrorMessage] = useState('');

    const isValidPassword = (password) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/;
        return passwordRegex.test(password);
    };

    const passAllowedSpecialChar = (password) => {
        const passwordRegex = /^[A-Za-z0-9@#\$!]{8,}$/;
        return passwordRegex.test(password);
    };

    const isValidUsername = (username) => {
        const usernameRegex = /^[A-Za-z0-9@#\$!]+$/;
        return usernameRegex.test(username);
    };

    const validateForm = () => {
        let formErrors = {};
        if (!username) {
            formErrors.username = 'Username is required';
        } else if (!isValidUsername(username)) {
            formErrors.username = 'Username cannot contain special characters other than @#$!';
        }
        
        if (!password) {
            formErrors.password = 'Password is required';
        } else if (!isValidPassword(password)) {
            formErrors.password = 'Password must be at least 8 characters, contain at least 1 lower case, 1 uppercase letter and 1 number';
        } else if (!passAllowedSpecialChar(password)) {
            formErrors.password = 'Only !@#$ special characters are allowed';
        }
        if (!securityQuestion) formErrors.securityQuestion = 'Please select a security question';
        if (!securityAnswer) formErrors.securityAnswer = 'Security answer is required';
        return formErrors;
    };

    const clearErrors = () => {
        setErrors({});
        setApiErrorMessage('');
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
            password: password,
            "custom:security-question": securityQuestion,  
            "custom:security-answer": securityAnswer
        };

        clearErrors();

        axios({
            method: 'post',
            url: 'https://g3ywl1bwh3.execute-api.ap-southeast-2.amazonaws.com/prod/register',
            data: formData,
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(function (response) {
            if (response && response.data) {
                showSuccessReport('Success', response.data.message);
                navigate('/login');
            }
        })
        .catch(function (error) {
            // Handle errors
            if (error.response && error.response.data) {
                setApiErrorMessage(error.response.data.message);
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                }
            } else {
                setApiErrorMessage('Something went wrong');
            }
        });
    };

    return (
        <>
            <div className="flex justify-center items-center mt-8 w-full bg-white py-12 lg:py-8" id='RegisterPage'>
                <div>
                    <NavBar />
                </div>
                <div id='register' className="mt-8 w-full bg-white py-12 lg:py-24 flex justify-center items-center" style={{ height: '100vh' }}>
                    <div className="container mx-auto my-8 px-4 lg:px-20" data-aos="zoom-in" style={{ maxWidth: '700px' }} >
                        <form onSubmit={handleSubmit} id="registerForm">
                            <div className="w-full bg-white p-8 my-4 md:px-12 lg:px-10 mr-auto rounded-2xl shadow-2xl">
                                <div className="flex justify-center">
                                    <h1 className="font-bold text-center text-blue-900 uppercase text-4xl">Register</h1>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
                                    <div>
                                        <label htmlFor="username" className="text-gray-700">Username:</label>
                                        <input
                                            name="username"
                                            className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                            type="text"
                                            placeholder="Enter Username*"
                                            value={username}
                                            onChange={(e) => {
                                                setUsername(e.target.value);
                                                clearErrors();
                                                
                                            }}
                                        />
                                        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="text-gray-700">Password:</label>
                                        <input
                                            name="password"
                                            className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                            type="password"
                                            placeholder="Enter Password*"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                clearErrors();
                                            }}
                                        />
                                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                                    </div>
                                </div>
                                <div className="mt-4 mb-6 text-center text-sm text-red-500 font-semibold">
                                    Please do not use real personal details as your username.
                                </div>

                                <div className="my-4">
                                    <label htmlFor="securityQuestion" className="text-gray-700">Please select a security question</label>
                                    <select
                                        name="securityQuestion"
                                        id="securityQuestion"
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        value={securityQuestion}
                                        onChange={(e) => {
                                            setSecurityQuestion(e.target.value);
                                            clearErrors();
                                        }}
                                    >
                                        <option value="">Please select a security question</option>
                                        <option value="1">What's your favourite colour?</option>
                                        <option value="2">What's your favourite fruit?</option>
                                        <option value="3">What's your favourite movie?</option>
                                        <option value="4">What's your favourite animal?</option>
                                    </select>
                                    {errors.securityQuestion && <p className="text-red-500 text-sm">{errors.securityQuestion}</p>}
                                </div>

                                <div className="my-4">
                                    <label htmlFor="securityAnswer" className="text-gray-700">Please enter your security answer:</label>
                                    <input
                                        name="securityAnswer"
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="text"
                                        placeholder="Enter your Answer*"
                                        value={securityAnswer}
                                        onChange={(e) => {
                                            setSecurityAnswer(e.target.value);
                                            clearErrors();
                                        }}
                                    />
                                    {errors.securityAnswer && <p className="text-red-500 text-sm">{errors.securityAnswer}</p>}
                                </div>

                                {apiErrorMessage && (
                                    <div className="text-center text-red-500 mb-3">
                                        {apiErrorMessage}
                                    </div>
                                )}

                                <div className="my-2 w-1/2 lg:w-2/4 mt-5 mx-auto">
                                    <button
                                        type="submit"
                                        id="submitBtn"
                                        className="uppercase text-sm font-bold tracking-wide bg-gray-500 hover:bg-blue-900 text-gray-100 p-3 rounded-lg w-full focus:outline-none focus:shadow-outline"
                                    >
                                        Sign Up
                                    </button>
                                </div>

                                <hr className="my-4 border-gray-300" />
                                <div className="flex justify-center items-center my-4">
                                    <Link to="/login" className="flex justify-center text-gray-500 hover:text-blue-500 focus:outline-none text-lg">
                                        Already have an account?
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
            </div>
            <Footer />
        </>
    );
};

export default Register;