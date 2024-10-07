import React, { useState } from 'react';
import NavBar from './Navbar/NavBar';
import Footer from './Footer';
import {useDocTitle} from './CustomHook';
import axios from 'axios';
import { showSuccessReport } from './notiflixConfig';
import { getCookie } from './CookieManage';
import ReCAPTCHA from 'react-google-recaptcha';

const RECAPTCHA_SITE_KEY = '6LcCN1kqAAAAAD8WSnLa5cZCirN_udQVvfWkpPDg';

const ResetPassword = (props) => {
    useDocTitle('Reset Password - Sign-Connect');

    const username = getCookie('cognitoUsername');  
    const [password, setPassword] = useState('');
    const [reenteredPassword, setReenteredPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [apiErrorMessage, setApiErrorMessage] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState('');
    

    const validateForm = () => {
        let formErrors = {};
        if (!password) formErrors.password = 'Password is required';
        if (!reenteredPassword) formErrors.reenteredPassword = 'Please re-enter your password';
        if (password && reenteredPassword && password !== reenteredPassword) {
            formErrors.match = 'Passwords do not match';
        }    
        return formErrors;
    };

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };

    const clearErrors = () => {
        setErrors({});
        setApiErrorMessage('');
    };

    const clearForm = () => {
        setPassword('');
        setReenteredPassword('');
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        
        // Stop form submission if reCAPTCHA is not check
        if (!recaptchaToken) {
            setApiErrorMessage('Please complete the reCAPTCHA to proceed.');
            return;  
        }

        const formData = {
            username: username,
            password: password
        };

        clearErrors();

        axios({
            method: 'post',
            url: 'https://g3ywl1bwh3.execute-api.ap-southeast-2.amazonaws.com/prod/resetPassword',
            data: formData,
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(function (response) {
            if (response && response.data) {
                showSuccessReport('Success', response.data.message);
                clearForm();
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
            <div>
                <NavBar />
            </div>
            <div id='login' className="mt-4 w-full bg-white py-4 lg:py-8" style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
                <div className="container mx-auto my-8 px-4 lg:px-20" data-aos="zoom-in" style={{ maxWidth: '700px' }} >
                    <form onSubmit={handleSubmit} id="loginForm">
                        <div className="w-full bg-white p-8 my-4 md:px-12 lg:w-full lg:pl-30 lg:pr-30 mr-auto rounded-2xl shadow-2xl">
                            <div className="flex">
                                <h1 className="font-bold text-center lg:text-left text-black-900 uppercase text-3xl mx-auto">Reset Your Password</h1>
                            </div>
                            <hr className="my-4 border-gray-300" />
                            <div className="grid grid-cols-1 gap-5 mt-5 ">
                                <div>
                                    <label htmlFor="password" className="text-gray-700">Enter a new password:</label>
                                    <input
                                        name="password"
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="password"
                                        placeholder="Enter New Password*"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            clearErrors();
                                        }}
                                    />
                                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                                </div>
                                <div>
                                    <label htmlFor="reenteredPassword" className="text-gray-700">Re-enter the password:</label>
                                    <input
                                        name="reenteredPassword"
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="password"
                                        placeholder="Re-enter Password*"
                                        value={reenteredPassword}
                                        onChange={(e) => {
                                            setReenteredPassword(e.target.value);
                                            clearErrors();
                                        }}
                                    />
                                    {errors.reenteredPassword  && <p className="text-red-500 text-sm">{errors.reenteredPassword }</p>}
                                    {errors.match && <p className="text-red-500 text-sm">{errors.match}</p>}
                                </div>
                            </div>

                            {apiErrorMessage && (
                                <div className="text-center text-red-500 mb-3">
                                    {apiErrorMessage}
                                </div>
                            )}

                            <div className="my-2 w-full lg:w-2/4 mt-5 mx-auto">
                                <button
                                    type="submit"
                                    id="submitBtn"
                                    className="uppercase text-sm font-bold tracking-wide bg-gray-500 hover:bg-blue-900 text-gray-100 p-3 rounded-lg w-full focus:outline-none focus:shadow-outline"
                                >
                                    Submit
                                </button>
                            </div>

                            <div className="flex justify-center mt-4">
                                <ReCAPTCHA
                                    sitekey={RECAPTCHA_SITE_KEY}
                                    onChange={handleRecaptchaChange}
                                />
                            </div>
                        </div>
                    </form>                    
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ResetPassword;