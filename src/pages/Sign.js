import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';

const Sign = () => {
  const { hand_sign } = useParams(); // Get the lesson_id from the route parameter
  const [sign, setSign] = useState(null); // Store the single sign object

  useEffect(() => {
    // Fetch the single Auslan sign using the lesson_id from the route params
    const fetchSign = async () => {
      const response = await fetch(`https://lnenem9b6b.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1/hand_signs/hand_sign?hand_sign=${hand_sign}`);
      // const response = await fetch(`http://localhost:8000/api/v1/hand_signs/hand_sign?hand_sign=${hand_sign}`);
      const data = await response.json();
      setSign(data[0]);  // Since the API returns one item, set it directly
    };
    fetchSign();
  }, [hand_sign]);

  if (!sign) {
    return <div>Loading...</div>;  // Show a loading state while the data is being fetched
  }

  return (
    <>
      <div className="flex justify-center items-center mt-8 w-full bg-white py-12 lg:py-24" id='lessonDetails'>
        <div>
          <NavBar />
        </div>

        <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Hand Sign: {sign.AuslanSign}</h1> {/* Hand sign displayed on top */}
          {/* Display the sign's details */}
          <div>
            <div className="flex items-center justify-between mb-4">
              {/* Image on the left */}
              <div className="w-1/2">
                <img src={sign.ImageUrl} alt={sign.AuslanSign} className="w-full mb-4" />
              </div>

              {/* Video on the right */}
              <div className="w-1/2">
                <video key={sign.AuslanSign} controls className="w-full">
                  <source src={sign.VideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Sign;
