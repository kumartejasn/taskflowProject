import React, { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext(null);

// Create the Provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  // The login function that components will call
  const login = (newToken) => {
    setToken(newToken);
    // In a real app, you'd also save this to localStorage
  };

  // The logout function
  const logout = () => {
    setToken(null);
    // In a real app, you'd also remove this from localStorage
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context easily
export const useAuth = () => {
  return useContext(AuthContext);
};