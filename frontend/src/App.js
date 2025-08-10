import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import Home from './pages/Home/Home.js';
import Dashboard from './pages/Dashboard/Dashboard.js';
import Chat from './pages/Chat/Chat.js';
import Opportunities from './pages/Opportunities/Opportunities.js';
import Auth from './pages/Auth/Auth.js';
import Profile from './pages/Profile/Profile.js';

// Navigation Component (same as before but now uses useAuth)
const Navbar = function() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return React.createElement(
    'nav',
    { className: 'bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50' },
    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
      React.createElement(
        'div',
        { className: 'flex justify-between items-center h-16' },
        
        // Logo
        React.createElement(
          Link,
          { to: '/', className: 'flex items-center space-x-3' },
          React.createElement('div', { className: 'w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl' }, '🎯'),
          React.createElement('span', { className: 'text-xl font-bold text-gray-900' }, 'AI Career Counsellor')
        ),
        
        // Desktop Navigation  
        React.createElement(
          'div',
          { className: 'hidden md:flex items-center space-x-8' },
          React.createElement(Link, { to: '/', className: 'text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200' }, 'Home'),
          isAuthenticated ? [
            React.createElement(Link, { key: 'dashboard', to: '/dashboard', className: 'text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200' }, 'Dashboard'),
            React.createElement(Link, { key: 'chat', to: '/chat', className: 'text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200' }, 'Chat'),
            React.createElement(Link, { key: 'opportunities', to: '/opportunities', className: 'text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200' }, 'Opportunities'),
            React.createElement(Link, { key: 'profile', to: '/profile', className: 'text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200' }, 'Profile'),
            React.createElement(
              'div',
              { key: 'user-info', className: 'flex items-center space-x-3' },
              React.createElement('span', { className: 'text-sm text-gray-600' }, `Hi, ${user?.name || 'User'}!`),
              React.createElement(
                'button',
                { onClick: logout, className: 'bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200' },
                'Logout'
              )
            )
          ] : [
            React.createElement(Link, { key: 'auth', to: '/auth', className: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200' }, 'Get Started')
          ]
        ),
        
        // Mobile menu button
        React.createElement(
          'div',
          { className: 'md:hidden' },
          React.createElement(
            'button',
            { 
              onClick: function() { setIsMobileMenuOpen(!isMobileMenuOpen); },
              className: 'text-gray-600 hover:text-blue-600 focus:outline-none'
            },
            React.createElement(
              'svg',
              { className: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M4 6h16M4 12h16M4 18h16' })
            )
          )
        )
      )
    ),
    
    // Mobile menu
    isMobileMenuOpen && React.createElement(
      'div',
      { className: 'md:hidden bg-white border-t border-gray-200' },
      React.createElement(
        'div',
        { className: 'px-2 pt-2 pb-3 space-y-1' },
        React.createElement(Link, { to: '/', className: 'block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium' }, 'Home'),
        isAuthenticated ? [
          React.createElement('div', { key: 'user-mobile', className: 'px-3 py-2 text-sm text-gray-500 border-b border-gray-200' }, `Logged in as ${user?.name || 'User'}`),
          React.createElement(Link, { key: 'dashboard', to: '/dashboard', className: 'block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium' }, 'Dashboard'),
          React.createElement(Link, { key: 'chat', to: '/chat', className: 'block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium' }, 'Chat'),
          React.createElement(Link, { key: 'opportunities', to: '/opportunities', className: 'block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium' }, 'Opportunities'),
          React.createElement(Link, { key: 'profile', to: '/profile', className: 'block px-3 py-2 text-gray-600 hover:text-blue-600 font-medium' }, 'Profile'),
          React.createElement('button', { key: 'logout', onClick: logout, className: 'block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-medium' }, 'Logout')
        ] : [
          React.createElement(Link, { key: 'auth', to: '/auth', className: 'block px-3 py-2 text-blue-600 hover:bg-blue-50 font-medium' }, 'Get Started')
        ]
      )
    )
  );
};

// Protected Route Component
const ProtectedRoute = function(props) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return React.createElement(
      'div',
      { className: 'min-h-screen bg-gray-50 flex items-center justify-center' },
      React.createElement('div', { className: 'w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin' })
    );
  }
  
  if (!isAuthenticated) {
    return React.createElement(Navigate, { to: '/auth', replace: true });
  }
  
  return props.children;
};

// App Layout Component
const AppLayout = function() {
  return React.createElement(
    'div',
    { className: 'App min-h-screen bg-gray-50' },
    React.createElement(Navbar),
    React.createElement(
      'main',
      null,
      React.createElement(
        Routes,
        null,
        React.createElement(Route, { path: '/', element: React.createElement(Home) }),
        React.createElement(Route, { path: '/auth', element: React.createElement(Auth) }),
        React.createElement(Route, { 
          path: '/dashboard', 
          element: React.createElement(ProtectedRoute, null, React.createElement(Dashboard))
        }),
        React.createElement(Route, { 
          path: '/chat', 
          element: React.createElement(ProtectedRoute, null, React.createElement(Chat))
        }),
        React.createElement(Route, { 
          path: '/opportunities', 
          element: React.createElement(ProtectedRoute, null, React.createElement(Opportunities))
        }),
        React.createElement(Route, { 
          path: '/profile', 
          element: React.createElement(ProtectedRoute, null, React.createElement(Profile))
        })
      )
    )
  );
};

const App = function() {
  return React.createElement(
    Router,
    null,
    React.createElement(
      AuthProvider,
      null,
      React.createElement(AppLayout)
    )
  );
};

export default App;
