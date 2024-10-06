import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';

const QuizSelectionPage = () => {
  const [level, setLevel] = useState('');
  const [questionCount, setQuestionCount] = useState('');
  const navigate = useNavigate();

  // Levels for selection
// Updated levels for selection
const levels = ['Level 1 - Numbers', 'Level 2 - Letters', 'Level 3 - Words'];;
  
  // Dynamically set question counts (up to 10)
  const questionCounts = [5, 10, 15, 20];

  const handleStartQuiz = () => {
    // Ensure both level and question count are selected
    if (level && questionCount) {
      navigate(`/quiz?level=${level}&questions=${questionCount}`);
    } else {
      alert("Please select both level and the number of questions!");
    }
  };

  return (
    <div>
      <div className="flex justify-center items-center mt-8 w-full bg-white py-12 lg:py-24" id="quizSelectionPage">
        <div>
          <NavBar />
        </div>

        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Quiz Selection</h1>

          <div className="flex justify-center mb-8">
            <div className="w-full max-w-md">
              {/* Dropdown for selecting quiz level */}
              <label htmlFor="level" className="block font-semibold mb-2">Select Quiz Level:</label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="block w-full p-2 border rounded-lg mb-4"
              >
                <option value="" disabled>Select a level</option>
                {levels.map((lvl, idx) => (
                  <option key={idx} value={lvl}>{lvl}</option>
                ))}
              </select>

              {/* Dropdown for selecting question count */}
              <label htmlFor="questionCount" className="block font-semibold mb-2">Select Number of Questions:</label>
              <select
                id="questionCount"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="block w-full p-2 border rounded-lg mb-4"
              >
                <option value="" disabled>Select number of questions</option>
                {questionCounts.map((count, idx) => (
                  <option key={idx} value={count}>{count}</option>
                ))}
              </select>

              {/* Start Quiz Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleStartQuiz}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-200"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default QuizSelectionPage;
