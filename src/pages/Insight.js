import React, { useState, useEffect } from 'react';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';
import {useDocTitle} from '../components/CustomHook';
import upArrow from '../images/up-arrow.png';

const Insight = () => {
    useDocTitle('Insight - Sign-Connect');
    const [scrollProgress, setScrollProgress] = useState(0);

    // Handle scroll progress
    const handleScroll = () => {
        const scrollTop = window.scrollY; // Current scroll position
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = (scrollTop / documentHeight) * 100;

        setScrollProgress(scrollPercentage);
    };

    //Update while scrolling
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };
    return (
        <>
            <div
                    style={{ width: `${scrollProgress}%` }}
                    className="fixed top-0 left-0 h-1 bg-red-500 z-50 transition-all duration-200"
            />
            <div className="flex justify-center items-center mt-8 w-full bg-white py-12 lg:py-2" id='InsightPage'>                
                <div>
                    <NavBar />
                </div>
                <div className="m-auto overflow-hidden mt-8 lg:mt-4 p-2 md:p-12 h-5/6 ml-11" data-aos="zoom-in">
                    <div id='insight' className="flex flex-col lg:flex-row py-8 justify-between text-center lg:text-left w-full">
                        <div className="lg:w-full flex flex-col justify-center" data-aos="zoom-in" data-aos-delay="200">
                            <h2 className="mb-5 md:text-4xl text-3xl font-bold text-blue-900">
                                Insight
                            </h2>
                            <div className="overflow-hidden p-0 h-5/6 py-8"> 
                                <h2 className="mb-5 md:text-2xl font-bold text-black-900">
                                    Where do Auslan Users Live?
                                </h2>
                                <div className="text-xl font-semibold tracking-tight text-gray-500">
                                    Australia is home to a diverse population of Auslan users. The map below shows the distribution of Auslan speakers across the country.
                                </div>                           
                            </div>
                            <div className="iframe-container w-full flex justify-center">
                                <iframe 
                                    frameBorder="0" 
                                    scrolling="no" 
                                    title="Where do Auslan Users Live?"
                                    style={{ width: '100%', minHeight: '1005px' }} 
                                    src="https://www.sbs.com.au/census-explorer-2021/?languages=auslan&topic=cultural-diversity&lang=en&embed=where-do-people-live">
                                    Sorry your browser does not support inline frames.
                                </iframe>
                            </div>
                            <div className="overflow-hidden p-0 h-5/6 py-8">
                                <h2 className="mb-5 md:text-2xl font-bold text-black-900">
                                    Age and Gender of Auslan Users
                                </h2>
                                <div className="text-xl font-semibold tracking-tight text-gray-500">
                                    The following data provides an overview of the age distribution and gender demographics of Auslan speakers in Australia.
                                </div>                           
                            </div>
                            <div className="iframe-container w-full flex justify-center">
                                <iframe 
                                    frameBorder="0" 
                                    scrolling="no" 
                                    title="Age and Gender of Auslan Users"
                                    style={{ width: '100%', minHeight: '1005px' }} 
                                    src="https://www.sbs.com.au/census-explorer-2021/?lang=en&languages=auslan&topic=cultural-diversity&embed=how-old-are-people">
                                    Sorry your browser does not support inline frames.
                                </iframe>
                            </div>
                            <div className="overflow-hidden p-0 h-5/6 py-8">
                                <h2 className="mb-5 md:text-2xl font-bold text-black-900">
                                    Income Details of Auslan Users
                                </h2>
                                <div className="text-xl font-semibold tracking-tight text-gray-500">
                                    The income levels of Auslan users provide insights into their economic participation. The chart below shows the distribution of personal incomes among Auslan speakers.
                                </div>                           
                            </div>
                            <div className="iframe-container w-full flex justify-center">                                
                                <iframe 
                                    frameBorder="0" 
                                    scrolling="no" 
                                    title="Income Details of Auslan Users"
                                    style={{ width: '100%', minHeight: '1005px' }} 
                                    src="https://www.sbs.com.au/census-explorer-2021/?lang=en&languages=auslan&topic=work-and-income&embed=what-are-peoples-annual-personal-incomes">
                                    Sorry your browser does not support inline frames.
                                </iframe>
                            </div>
                            <div className="overflow-hidden p-0 h-5/6 py-8">
                                <h2 className="mb-5 md:text-2xl font-bold text-black-900">
                                    Education Levels of Auslan Users
                                </h2>
                                <div className="text-xl font-semibold tracking-tight text-gray-500">
                                    The educational attainment of Auslan speakers varies, reflecting the broader Australian population. The chart below provides insight into their education levels.
                                </div>                           
                            </div>
                            <div className="iframe-container w-full flex justify-center">                                
                                <iframe 
                                    frameBorder="0" 
                                    scrolling="no" 
                                    title="Education Levels of Auslan Users"
                                    style={{ width: '100%', minHeight: '1005px' }} 
                                    src="https://www.sbs.com.au/census-explorer-2021/?lang=en&languages=auslan&topic=education&embed=what-level-of-education-do-people-have">
                                    Sorry your browser does not support inline frames.
                                </iframe>
                            </div>
                            <div className="overflow-hidden p-0 h-5/6 py-8">
                                <h2 className="mb-5 md:text-2xl font-bold text-black-900">
                                    Industries Where Auslan Users Work
                                </h2>
                                <div className="text-xl font-semibold tracking-tight text-gray-500">
                                    Auslan speakers are employed across various industries in Australia. The chart below details the most common industries for employment among Auslan users.
                                </div>      
                            </div>
                            <div className="iframe-container w-full flex justify-center">                                
                                <iframe 
                                    frameBorder="0" 
                                    scrolling="no" 
                                    title="Industries Where Auslan Users Work"
                                    style={{ width: '100%', minHeight: '1005px' }} 
                                    src="https://www.sbs.com.au/census-explorer-2021/?lang=en&languages=auslan&topic=work-and-income&embed=what-industries-do-people-typically-work-in">
                                    Sorry your browser does not support inline frames.
                                </iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <img
                        src={upArrow}  //
                        alt="Back to Top"
                        onClick={scrollToTop}
                        className="fixed bottom-10 right-10 w-12 h-12 cursor-pointer opacity-60 hover:opacity-30"
            />
        </>
    );
}

export default Insight;
