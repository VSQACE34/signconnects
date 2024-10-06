import { Link } from "react-router-dom";
import NavBar from "../components/Navbar/NavBar";
import Footer from "../components/Footer";

export default function NotFound() {
    return (
        <>
            <div>
                <NavBar />
            </div>

            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
                <h1 className="text-5xl font-bold text-red-600">404</h1>
                <p className="text-lg text-gray-600 mb-4">Oops! The page you're looking for doesn't exist.</p>
                <Link to="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Go back to Home
                </Link>

            </div>

            <Footer />
        </>

    )
}
