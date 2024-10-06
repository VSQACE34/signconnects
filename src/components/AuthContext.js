import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCookie } from './CookieManage'; // Assuming you're using cookies

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getCookie('accessToken'); // Or check localStorage
    if (token) {
      setIsLoggedIn(true); // Restore login state if token exists
    }
  }, []);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
