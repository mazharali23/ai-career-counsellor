import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = function() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = function({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    // Check if user is logged in on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = function() {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user'); // Remove corrupted data
    }
    setLoading(false);
  };

  const login = function(userData) {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Failed to save user data' };
    }
  };

  const logout = function() {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = function(updatedData) {
    try {
      const newUserData = { ...user, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};
