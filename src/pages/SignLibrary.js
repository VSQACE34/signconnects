import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';
import { useParams } from "react-router-dom";

const SignLibrary = () => {
    const [signs, setSigns] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // Add state for search query

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`https://lnenem9b6b.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1/hand_signs/`);
            // const response = await fetch(`http://localhost:8000/api/v1/hand_signs`);
            const data = await response.json();
            setSigns(data);
        };
        fetchData();
    }, []);

    // Filter signs based on search query
    const filteredSigns = signs.filter(sign => 
        sign.AuslanSign.toLowerCase().includes(searchQuery.toLowerCase()) // Match case insensitive search
    );

    return (
        <>
            <div>
                <NavBar />
            </div>

            <div className="flex justify-center items-center w-full bg-white py-12" id='Sign Library'>
                <div className="container mx-auto">
                    
                    <div id="signs" className="bg-gray-100 py-12 mt-12">
                        <section data-aos="zoom-in-down">
                            <div className="my-4 py-4">
                                <h2 className="my-2 text-center text-3xl text-blue-900 uppercase font-bold">Sign Library</h2>

                                <div className='flex justify-center'>
                                    <div className='w-24 border-b-4 border-blue-900'></div>
                                </div>
                                {/* Search bar */}
                    <div className="flex justify-center mt-4">
                        <input
                            type="text"
                            className="px-4 py-2 border rounded-md w-1/2"
                            placeholder="Search for a sign..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)} // Update search query
                        />
                    </div>
                            </div>

                            <div className="px-12" data-aos="fade-down" data-aos-delay="600">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

                                    {/* Display filtered signs */}
                                    {filteredSigns.map((sign, index) => (
                                        <div
                                            key={index}
                                            className="bg-white transition-all ease-in-out duration-400 overflow-hidden text-gray-700 hover:bg-gray-500 hover:text-white rounded-lg shadow-2xl p-3 group flex flex-col justify-between"
                                        >
                                            <div className="m-2 text-justify text-sm">
                                                <img
                                                    alt="card img"
                                                    className="rounded-t group-hover:scale-[1.15] transition duration-1000 ease-in-out"
                                                    src={sign.ImageUrl}
                                                />
                                                <h2 className="font-semibold my-4 text-2xl text-center">{sign.AuslanSign}</h2>
                                            </div>
                                            <div className="mt-auto">
                                                <Link to={`/hand_sign/${sign.AuslanSign}`} className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-3 my-4 text-lg shadow-xl rounded-xl">
                                                    Select
                                                    <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Show message if no signs match the search query */}
                                {filteredSigns.length === 0 && (
                                    <div className="text-center mt-8 text-gray-600">
                                        No signs found for "{searchQuery}".
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                </div>
            </div>

            <Footer />
        </>
    )
}

export default SignLibrary;
