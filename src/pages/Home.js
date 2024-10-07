import React from 'react';
// import Cta from '../components/Cta';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Intro from '../components/Intro';
import SignLibrary from '../components/SignLibrary';
import Courses from '../components/Courses';
import { AuthProvider } from '../components/AuthContext';



const Home = () => {
    return (
        <>
            <AuthProvider>
                <Hero />
                <Intro />
                <Courses />
                <SignLibrary />
                {/* <Cta/>                 */}
                <Footer />
            </AuthProvider>
        </>

    )
}

export default Home;

