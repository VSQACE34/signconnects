import React, { useState, useEffect } from 'react';
// import Cta from '../components/Cta';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Intro from '../components/Intro';
import SignLibrary from '../components/SignLibrary';
import Courses from '../components/Courses';
import { AuthProvider } from '../components/AuthContext';
import upArrow from '../images/up-arrow.png';

const Home = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    // Handle scroll progress
    const handleScroll = () => {
        const scrollTop = window.scrollY; // Current scroll position
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight; // Total scrollable area
        const scrollPercentage = (scrollTop / documentHeight) * 100;

        setScrollProgress(scrollPercentage); // Set the scroll progress percentage
    };

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
            <AuthProvider>
                <div
                    style={{ width: `${scrollProgress}%` }}
                    className="fixed top-0 left-0 h-1 bg-red-500 z-50 transition-all duration-200"
                />
                <Hero />
                <Intro />
                <Courses />
                <SignLibrary />
                {/* <Cta/>                 */}
                <Footer />
                <img
                        src={upArrow}  //
                        alt="Back to Top"
                        onClick={scrollToTop}
                        className="fixed bottom-10 right-10 w-12 h-12 cursor-pointer opacity-60 hover:opacity-30"
                />
            </AuthProvider>
        </>

    )
}

export default Home;

