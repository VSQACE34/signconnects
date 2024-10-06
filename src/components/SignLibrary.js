import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';


const SignLibrary = () => {

    // Initially show only 4 signs
    const [visibleSigns, setVisibleSigns] = useState(4);

    // Function to handle "Load More" button click
    const handleLoadMore = () => {
        setVisibleSigns((prev) => prev + 4); // Show 4 more lessons on each click
    };

    const [signs, setSigns] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('https://lnenem9b6b.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1/hand_signs/');
            // const response = await fetch('http://localhost:8000/api/v1/hand_signs/');
            const data = await response.json();
            setSigns(data);
        };
        fetchData();
    }, []);

    return (
        <div id="signs" className="bg-gray-100 py-12" >
            <section data-aos="zoom-in-down">
                <div className="my-4 py-4">
                    <h2 className="my-2 text-center text-3xl text-blue-900 uppercase font-bold">Sign Library</h2>

                    <div className='flex justify-center'>
                        <div className='w-24 border-b-4 border-blue-900'></div>
                    </div>
                    <h2 className="mt-4 mx-12 text-center text-xl lg:text-2xl font-semibold text-blue-900">We are deeply committed to the growth and success of our clients.</h2>
                </div>

                <div className="px-12" data-aos="fade-down" data-aos-delay="600">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

                        {signs.slice(0, visibleSigns).map((sign, index) => (
                            <div
                                key={index}
                                className="bg-white transition-all ease-in-out duration-400 overflow-hidden text-gray-700 hover:bg-gray-500 hover:text-white rounded-lg shadow-2xl p-3 group "
                            >
                                <div className="m-2 text-justify text-sm">
                                    <img
                                        alt="card img"
                                        className="rounded-t group-hover:scale-[1.15] transition duration-1000 ease-in-out mx-auto"
                                        src={sign.ImageUrl}
                                    />
                                    <h2 className="font-semibold my-4 text-2xl text-center">{sign.AuslanSign}</h2>
                                </div>
                                {/* {isLoggedIn ? (
                                    <button onClick={logout}>Logout</button>
                                ) : (
                                    <button onClick={login}>Login</button>
                                )} */}
                                <Link to={`/hand_sign/${sign.AuslanSign}`} className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-3 my-4 text-lg shadow-xl rounded-xl">
                                    Select
                                    <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                    </svg>
                                </Link>
                            </div>
                        ))}
                    </div>
                    {/* Show the Load More button if there are more lessons to display */}
                    {visibleSigns < signs.length && (
                        <div className="flex justify-center mt-12 text-l">
                            <Link to={`/sign_library`}
                                onClick={handleLoadMore}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Load More
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default SignLibrary;