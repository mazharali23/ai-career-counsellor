import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';

const Auth = function() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = function(e) {
    const { name, value } = e.target;
    setFormData(function(prev) {
      const newData = Object.assign({}, prev);
      newData[name] = value;
      return newData;
    });
    setError('');
  };

  const handleSubmit = function(e) {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(function() {
      if (formData.email && formData.password) {
        const userData = {
          name: formData.name || formData.email.split('@')[0],
          email: formData.email,
          // Add some default user data
          coursesEnrolled: 0,
          coursesCompleted: 0,
          applicationsSubmitted: 0,
          goalsAchieved: 0,
          joinDate: new Date().toISOString()
        };
        
        const result = login(userData);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError('Failed to save user data');
        }
      } else {
        setError('Please fill in all fields');
      }
      setLoading(false);
    }, 1000);
  };

  // Rest of the Auth component remains the same...
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8' },
    React.createElement(
      'div',
      { className: 'max-w-md w-full space-y-8' },
      React.createElement(
        'div',
        { className: 'bg-white rounded-2xl shadow-2xl p-8' },
        
        // Header
        React.createElement(
          'div',
          { className: 'text-center mb-8' },
          React.createElement('div', { className: 'mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl mb-4' }, '🎯'),
          React.createElement('h2', { className: 'text-3xl font-bold text-gray-900' }, isLogin ? 'Welcome Back' : 'Create Account'),
          React.createElement('p', { className: 'text-gray-600 mt-2' }, isLogin ? 'Sign in to continue your career journey' : 'Start your AI-powered career journey')
        ),
        
        // Toggle Buttons
        React.createElement(
          'div',
          { className: 'flex rounded-xl bg-gray-100 p-1 mb-8' },
          React.createElement(
            'button',
            {
              className: `flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`,
              onClick: function() { setIsLogin(true); }
            },
            'Sign In'
          ),
          React.createElement(
            'button',
            {
              className: `flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${!isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`,
              onClick: function() { setIsLogin(false); }
            },
            'Sign Up'
          )
        ),
        
        // Error Message
        error && React.createElement('div', { className: 'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center' }, error),
        
        // Form
        React.createElement(
          'form',
          { onSubmit: handleSubmit, className: 'space-y-6' },
          !isLogin && React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Full Name'),
            React.createElement('input', {
              type: 'text',
              name: 'name',
              value: formData.name,
              onChange: handleInputChange,
              className: 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200',
              placeholder: 'Enter your full name',
              required: !isLogin
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Email Address'),
            React.createElement('input', {
              type: 'email',
              name: 'email',
              value: formData.email,
              onChange: handleInputChange,
              className: 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200',
              placeholder: 'Enter your email',
              required: true
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Password'),
            React.createElement('input', {
              type: 'password',
              name: 'password',
              value: formData.password,
              onChange: handleInputChange,
              className: 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200',
              placeholder: 'Enter your password',
              required: true
            })
          ),
          React.createElement(
            'button',
            { type: 'submit', disabled: loading, className: 'w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center' },
            loading ? React.createElement(
              React.Fragment,
              null,
              React.createElement('div', { className: 'w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3' }),
              isLogin ? 'Signing In...' : 'Creating Account...'
            ) : (isLogin ? 'Sign In' : 'Create Account')
          )
        ),
        
        // Footer
        React.createElement(
          'div',
          { className: 'text-center mt-8 pt-6 border-t border-gray-200' },
          React.createElement(
            'p',
            { className: 'text-gray-600' },
            isLogin ? 'Don\'t have an account? ' : 'Already have an account? ',
            React.createElement(
              'button',
              { 
                onClick: function() { setIsLogin(!isLogin); },
                className: 'text-blue-600 hover:text-blue-700 font-semibold'
              },
              isLogin ? 'Sign up here' : 'Sign in here'
            )
          )
        )
      )
    )
  );
};

export default Auth;
