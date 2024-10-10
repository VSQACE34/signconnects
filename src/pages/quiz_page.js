import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';
import {useDocTitle} from '../components/CustomHook';
import '../index.css'; // Importing CSS for quiz page

const QuizPage = () => {
  useDocTitle('Quiz - Sign-Connect');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0); // Track the current question index
  
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedLevel = params.get('level');
  const selectedQuestionCount = parseInt(params.get('questions'), 10);

  // Fetch quiz data from the API
  useEffect(() => {
    const fetchQuizData = async () => {
      setIsLoading(true);
      let fetchedQuestions = [];
      try {
        for (let i = 0; i < selectedQuestionCount; i++) {
          const response = await fetch(`https://lnenem9b6b.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1/quiz/?type=${getTypeFromLevel(selectedLevel)}`);
          const data = await response.json();

          const formattedQuestion = {
            question: `Select the correct options according to the finger spelling shown in the video`,
            correctAnswer: data.answer,
            videoUrl: data.question,
            options: [data["1"], data["2"], data["3"], data["4"], data["5"]],
          };
          fetchedQuestions.push(formattedQuestion);
        }

        setQuestions(fetchedQuestions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [selectedQuestionCount, selectedLevel]);

  // Helper function to determine quiz type based on level
  const getTypeFromLevel = (level) => {
    switch (level) {
      case 'Level 1 - numbers': return 'number';
      case 'Level 2 - letters': return 'letter';
      case 'Level 3 - words': return 'word';
      default: return 'word'; // default to 'word' if no match
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    setAnswers({ ...answers, [questionIndex]: selectedAnswer });
  };

  // Navigate to the next question
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Navigate to the previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Calculate the score and submit
  const handleSubmit = () => {
    let calculatedScore = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    setIsSubmitted(true);
  };

  // Show a loading screen while fetching questions
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner-border text-blue-500" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // Render the quiz navigation sidebar
  const renderNavigationSidebar = () => (
    <div className="quiz-sidebar bg-gray-100 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Questions</h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((_, index) => (
          <button
            key={index}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold ${
              currentQuestion === index ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-200 text-black border-gray-300'
            }`}
            onClick={() => setCurrentQuestion(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );

  // Render the current quiz question
  const renderQuiz = () => {
    const question = questions[currentQuestion];
    return (
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">Quiz: {selectedLevel}</h2>

        <div className="question-block mb-8 p-6 rounded-lg bg-blue-900-custom text-white shadow-lg">
          <h4 className="font-semibold mb-4 text-lg">{question.question}</h4>
          <div className="video-container mb-4">
            <video src={question.videoUrl} controls className="mx-auto w-full max-w-lg"></video>
          </div>
          <div className="options-container grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 justify-center">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswerSelect(currentQuestion, option)}
                disabled={isSubmitted}
                className={`option-btn p-4 border-8 border-solid rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105 ${
                  answers[currentQuestion] === option ? 'bg-blue-500 text-black border-black' : 'bg-white text-black'
                } ${
                  isSubmitted && question.correctAnswer === option
                    ? 'border-green-500'
                  : isSubmitted && answers[currentQuestion] === option && answers[currentQuestion] !== question.correctAnswer
                    ? 'border-red-500'
                    : ''
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {isSubmitted && (
            <div
              className={`mt-2 text-xl ${
                answers[currentQuestion] === question.correctAnswer ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {answers[currentQuestion] === question.correctAnswer
                ? 'Correct!'
                : `Incorrect! Correct answer is ${question.correctAnswer}`}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
        <div className="flex">
            <Link
              to="/quiz-selection"
              // className="text-gray-500 hover:bg-blue-100 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-lg"
              className="bg-gray-500 hover:bg-blue-400 text-gray-100 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-lg"
            >
              Change Quiz
            </Link>
          </div>
          {currentQuestion > 0 ? (
            <button
              onClick={handlePrevious}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition duration-200"
            >
              &lt; Previous
            </button>
          ) : (
            <div></div>
          )}

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-200"
            >
              Next &gt;
            </button>
          ) : (
            !isSubmitted && (
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition duration-200"
              >
                Submit Quiz
              </button>
            )
          )}          
        </div>

        {isSubmitted && (
          <div className="text-center mt-6">
            <h3 className="text-2xl font-bold">Your Score: {score} / {questions.length}</h3>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <NavBar />
      <div className="w-full bg-white py-8 lg:py-10" id="quizPage">
        <div className="container mx-auto mt-12 mb-12 px-4 flex">
          {/* Render quiz content */}
          <div className="w-3/4">
            {renderQuiz()}
          </div>
          {/* Render navigation sidebar on the right */}
          <div className="w-1/4 ml-8">
            {renderNavigationSidebar()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default QuizPage;
