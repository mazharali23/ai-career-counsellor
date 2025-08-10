import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in
    const storedUserId = localStorage.getItem('userId');
    const storedUser = localStorage.getItem('user');
    
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Generate temporary user ID for demo
      const tempId = `user_${Date.now()}`;
      setUserId(tempId);
      localStorage.setItem('userId', tempId);
    }
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  const login = (userData) => {
    setUser(userData);
    setUserId(userData.id);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userId', userData.id);
  };
  
  const logout = () => {
    setUser(null);
    setUserId(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  };
  
  return (
    <UserContext.Provider value={{ user, userId, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
