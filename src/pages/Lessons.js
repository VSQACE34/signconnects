import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';
import axios from 'axios';
import { setCookie, getCookie } from '../components/CookieManage';
import {useDocTitle} from '../components/CustomHook';

const Lessons = () => {
  useDocTitle('Lessons - Sign-Connect');
  const { course_id } = useParams(); // Get the course_id from the route parameter
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate(); // Hook for navigation
  setCookie('course_id', course_id, 2);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`https://lnenem9b6b.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1/lessons/?course_id=${course_id}&user_id=${getCookie('userId')}`);
    //   const response = await fetch(`http://localhost:8000/api/v1/lessons/?course_id=${course_id}&user_id=${getCookie('userId')}`);
      const data = await response.json();
      setLessons(data);
    };
    fetchData();
  }, [course_id]);

  const handleStartLesson = async (lessonId, userId) => {
    try {
        // const response = await fetch(`https://lnenem9b6b.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1/lessons/?course_id=${course_id}&user_id=${getCookie('userId')}`);
      // Make an API request to start the lesson
      const response = await axios.post('https://lnenem9b6b.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1/lessons/start_a_lesson', {
    //   const response = await axios.post('http://localhost:8000/api/v1/lessons/start_a_lesson', {
        lesson_id: lessonId,
        user_id: userId,
      });
      console.log('Lesson started successfully:', response.data);

      // After successful API call, navigate to the lesson details page
      navigate(`/lesson/${lessonId}`);
    } catch (error) {
      console.error('Failed to start the lesson:', error);
    }
  };

  const handleContinueLesson = (lessonId) => {
    // Directly navigate to the lesson details page
    navigate(`/lesson/${lessonId}`);
  };

  return (
    <>
      <div className="flex justify-center items-center mt-8 w-full bg-white py-12 lg:py-24" id="lessonDetails">
        <NavBar />

        <div className="container mx-auto">
          <div id="lessons" className="bg-gray-100 py-12 mt-12">
            <section data-aos="zoom-in-down">
              <div className="my-4 py-4">
                <h2 className="my-2 text-center text-3xl text-blue-900 uppercase font-bold">Lessons</h2>

                <div className="flex justify-center">
                  <div className="w-24 border-b-4 border-blue-900"></div>
                </div>
              </div>

              <div className="px-12" data-aos="fade-down" data-aos-delay="600">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {lessons.map((lesson, index) => (
                    <div
                      key={index}
                      className="bg-white transition-all ease-in-out duration-400 overflow-hidden text-gray-700 hover:bg-gray-500 hover:text-white rounded-lg shadow-2xl p-3 group"
                    >
                      <div className="m-2 text-justify text-sm">
                        <img
                          alt="card img"
                          className="rounded-t group-hover:scale-[1.15] transition duration-1000 ease-in-out"
                          src={lesson.ImageURL}
                        />
                        <h2 className="font-semibold my-4 text-2xl text-center">{lesson.Lesson}</h2>
                        <p className="text-md font-medium">{lesson.Description}</p>
                        <p className="text-md font-medium mt-2">Difficulty: {lesson.Difficulty}</p>
                      </div>
                      
                      {/* Conditionally render Start or Continue button based on lesson status */}
                      {lesson.Status === "Not Yet Started" ? (
                        <button
                          onClick={() => handleStartLesson(lesson.ID, getCookie('userId'))}
                          className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-3 my-4 text-lg shadow-xl rounded-xl"
                        >
                          Start
                          <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      ) : lesson.Status === "In Progress" ? (
                        <button
                          onClick={() => navigate(`/lesson/${lesson.ID}`)}
                          className="text-white bg-green-600 hover:bg-green-500 inline-flex items-center justify-center w-full px-6 py-3 my-4 text-lg shadow-xl rounded-xl"
                        >
                          Continue
                          <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      ) : lesson.Status === "Completed" ? (
                        // Show the "Review" button for completed lessons
                        <button
                          onClick={() => navigate(`/lesson/${lesson.ID}/review`)}
                          className="text-white bg-yellow-600 hover:bg-yellow-500 inline-flex items-center justify-center w-full px-6 py-3 my-4 text-lg shadow-xl rounded-xl"
                        >
                          Review
                          <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
          <div className="mt-8 flex justify-center">
            <Link
                  to="/courses"
                  className="bg-gray-500 hover:bg-blue-400 text-gray-100 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-xl"
                >
                  Back to Courses
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Lessons;
