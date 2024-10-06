import React, { useState, useEffect } from 'react';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';
import {useDocTitle} from '../components/CustomHook';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../components/Auth';


const ForgotPassword = (props) => {
    const navigate = useNavigate();
    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
    }, [navigate]);

    useDocTitle('Forgotten Password - Sign-Connect');

    const [username, setUsername] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [errors, setErrors] = useState({});
    const [apiErrorMessage, setApiErrorMessage] = useState('');

    const validateForm = () => {
        let formErrors = {};
        if (!username) formErrors.username = 'Username is required';
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

        const formData = {
            username: username,
            "custom:security-question": securityQuestion,  
            "custom:security-answer": securityAnswer
        };

        clearErrors();

        axios({
            method: 'post',
            url: 'https://g3ywl1bwh3.execute-api.ap-southeast-2.amazonaws.com/prod/forgotPassword',
            data: formData,
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(function (response) {
            if (response && response.data) {
                const token = response.data.token;
                navigate(`/reset-password?username=${username}&token=${token}`);
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
            <div id='login' className="mt-8 w-full bg-white py-12 lg:py-24" style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
                <div className="container mx-auto my-8 px-4 lg:px-20" data-aos="zoom-in" style={{ maxWidth: '700px' }} >
                    <form onSubmit={handleSubmit} id="loginForm">
                        <div className="w-full bg-white p-8 my-4 md:px-12 lg:w-full lg:pl-30 lg:pr-30 mr-auto rounded-2xl shadow-2xl">
                            <div className="flex">
                                <h1 className="font-bold text-center lg:text-left text-black-900 uppercase text-3xl mx-auto">Find Your Account</h1>
                            </div>
                            <hr className="my-4 border-gray-300" />
                            <div className="grid grid-cols-1 gap-5 mt-5 ">
                                <div>
                                    <label htmlFor="username" className="text-gray-700 text-2xl">Please enter your username</label>
                                    <input
                                        name="username"
                                        className="w-full lg:w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="text"
                                        placeholder="Your Username*"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            clearErrors();
                                        }}
                                    />
                                    {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                                </div>
                            </div>     

                            <div className="my-4">
                                <label htmlFor="securityQuestion" className="text-gray-700">Please select the security question you used for registration</label>
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
                                    <option value="">Please select your security question</option>
                                    <option value="1">What's your favourite colour?</option>
                                    <option value="2">What's your favourite fruit?</option>
                                    <option value="3">What's your favourite movie?</option>
                                    <option value="4">What's your favourite animal?</option>
                                </select>
                                {errors.securityQuestion && <p className="text-red-500 text-sm">{errors.securityQuestion}</p>}
                            </div>

                            <div className="my-4">
                                <label htmlFor="securityAnswer" className="text-gray-700">Please enter the security answer you used for registration:</label>
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

                            <div className="my-2 w-full lg:w-2/4 mt-5 mx-auto">
                                <button
                                    type="submit"
                                    id="submitBtn"
                                    className="uppercase text-sm font-bold tracking-wide bg-gray-500 hover:bg-blue-900 text-gray-100 p-3 rounded-lg w-full focus:outline-none focus:shadow-outline"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </form>
                    
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ForgotPassword;