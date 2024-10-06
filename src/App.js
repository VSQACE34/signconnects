import React, { useEffect } from 'react';
import AOS from 'aos';
import "aos/dist/aos.css";
import './index.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
// All pages
import Home from './pages/Home';
// import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetails';
import NotFound from './pages/NotFound';
import SignLibrary from './pages/SignLibrary';
import Signs from './pages/Sign';
import QuizSelectionPage from './pages/quiz_selection';
import TranslatorPage from './pages/translation';
import QuizPage from './pages/quiz_page';
import ProtectedRoute from './components/ProtectedRoute';
import { useDocTitle } from './components/CustomHook';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './components/AuthContext';

function App() {
  useEffect(() => {
    const aos_init = () => {
      AOS.init({
        once: true,
        duration: 1000,
        easing: 'ease-out-cubic',
      });
    }

    window.addEventListener('load', () => {
      aos_init();
    });
  }, []);

  useDocTitle("Sign Connect");

  return (
    <>
      <AuthProvider>
        <Router>
          <ScrollToTop>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* <Route path="/contact" element={<Contact />} /> */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/sign_library" element={<SignLibrary />} />
              <Route path="/quiz-selection" element={<QuizSelectionPage />} />
              <Route path="/translation" element={<TranslatorPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/hand_sign/:hand_sign" element={<Signs />} />
              <Route path='*' element={<NotFound />} />
              <Route
                path="/lessons/:course_id"
                element={
                  <ProtectedRoute>
                    <Lessons />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lesson/:lesson_id"
                element={
                  <ProtectedRoute>
                    <LessonDetail />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ScrollToTop>
        </Router>
      </AuthProvider>
    </>
  );
}


export default App;
