import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../components/Navbar/NavBar'; 
import Footer from '../components/Footer';
import '../index.css'


const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false); 

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedLevel = params.get('level');
  const selectedQuestionCount = parseInt(params.get('questions'), 10);

  // Determine API 'type' parameter based on selected level
  const getApiType = () => {
    if (selectedLevel.includes('Numbers')) return 'number';
    if (selectedLevel.includes('Letters')) return 'letter';
    if (selectedLevel.includes('Words')) return 'word';
    return 'word'; // Default to 'word' if not matched
  };

  // Fetch quiz data from the API multiple times
  useEffect(() => {
    const fetchQuizData = async () => {
      setIsLoading(true);
      let fetchedQuestions = [];
      const apiType = getApiType();  // Get the correct type for API
      try {
        for (let i = 0; i < selectedQuestionCount; i++) {
          const response = await fetch(`https://lnenem9b6b.execute-api.ap-southeast-2.amazonaws.com/prod/api/v1/quiz/?type=${apiType}`);
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
  }, [selectedQuestionCount]);

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    setAnswers({ ...answers, [questionIndex]: selectedAnswer });
  };

  // Calculate the score and reveal the answers
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

  // Rendering quiz questions and results
  const renderQuiz = () => {
    return (
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">Quiz: {selectedLevel}</h2>

        {questions.map((question, index) => (
          <div key={index} className="question-block mb-8 p-6 rounded-lg bg-blue-900-custom text-white-custom shadow-lg">
            <h4 className="font-semibold mb-4 text-white-custom text-lg">Select the correct options according to the finger spelling shown in the video</h4>
            <div className="video-container mb-4">
              <video src={question.videoUrl} controls className="mx-auto w-full max-w-lg"></video>
            </div>
            <div className="options-container grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 justify-center">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerSelect(index, option)}
                  disabled={isSubmitted} 
                  className={`option-btn p-4 border rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105 ${
                    answers[index] === option ? 'bg-blue-500 text-white' : 'bg-white text-black'
                  } ${isSubmitted && question.correctAnswer === option ? 'border-green-500' : ''} ${isSubmitted && answers[index] !== question.correctAnswer && answers[index] === option ? 'border-red-500' : ''}`} 
                >
                  {option}
                </button>
              ))}
            </div>
            {isSubmitted && (
              <div className={`mt-2 ${answers[index] === question.correctAnswer ? 'text-green-500' : 'text-red-500'}`}>
                {answers[index] === question.correctAnswer ? 'Correct!' : `Incorrect! Correct answer is ${question.correctAnswer}`}
              </div>
            )}
          </div>
        ))}

        {!isSubmitted && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition duration-200"
            >
              Submit Answers
            </button>
          </div>
        )}

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
        <div className="container mx-auto mt-12 mb-12 px-4">
          {renderQuiz()}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default QuizPage;
