import Courses from '../components/Courses';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';
import { AuthProvider } from '../components/AuthContext';
import {useDocTitle} from '../components/CustomHook';


const CoursePage = () => {
    useDocTitle('Courses - Sign-Connect');
    return (
        <>
            <div className="flex justify-center items-center mt-8 w-full bg-white py-12 lg:py-24" id='CoursePage'>
                <div>
                    <NavBar />
                </div>           
                <AuthProvider>                
                    <Courses />
                </AuthProvider>            
            </div>
            <Footer />
        </>

    )
}

export default CoursePage;
