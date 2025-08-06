import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if user is logged in on app start
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: email,
        profile: {
          interests: ['Technology', 'Programming'],
          skills: ['JavaScript', 'React'],
          education: { level: 'Bachelor' },
          location: { city: 'New York' }
        }
      };
      
      const mockToken = 'mock-jwt-token-12345';
      
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return { success: true, message: 'Login successful' };
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      const mockUser = {
        id: '1',
        name: userData.name,
        email: userData.email,
        profile: {
          interests: [],
          skills: [],
          education: {},
          location: {}
        }
      };
      
      const mockToken = 'mock-jwt-token-12345';
      
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return { success: true, message: 'Registration successful' };
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (profileData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      return { success: false, message: 'Profile update failed. Please try again.' };
    }
  };

  const value = {
    user,
    isLoading,
    token,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
