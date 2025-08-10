import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';

const Home = function() {
  const { user, isAuthenticated } = useAuth();

  return React.createElement(
    'div',
    { className: 'min-h-screen' },
    
    // Hero Section with Gradient Background
    React.createElement(
      'section',
      { className: 'relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 text-white' },
      
      // Animated background elements
      React.createElement('div', { className: 'absolute top-0 left-0 w-72 h-72 bg-white bg-opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-pulse' }),
      React.createElement('div', { className: 'absolute top-0 right-0 w-72 h-72 bg-yellow-300 bg-opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000' }),
      React.createElement('div', { className: 'absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 bg-opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000' }),
      
      React.createElement(
        'div',
        { className: 'relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32' },
        React.createElement(
          'div',
          { className: 'text-center' },
          
          // Dynamic Welcome Message
          React.createElement(
            'h1',
            { className: 'text-4xl sm:text-5xl lg:text-7xl font-bold mb-8 animate-fade-in' },
            React.createElement(
              'span', 
              { className: 'block' }, 
              isAuthenticated ? `Welcome back, ${user?.name || 'User'}!` : 'Your AI-Powered'
            ),
            React.createElement(
              'span',
              { className: 'block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300' },
              isAuthenticated ? 'Ready to Continue?' : 'Career Guide'
            ),
            React.createElement(
              'span',
              { className: 'block text-2xl sm:text-3xl lg:text-4xl mt-4 text-blue-100 font-normal' },
              isAuthenticated ? '🎯 Let\'s Achieve Your Goals' : '🎯 Shape Your Future Today'
            )
          ),
          
          // Dynamic Description
          React.createElement(
            'p',
            { className: 'text-lg sm:text-xl lg:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed' },
            isAuthenticated 
              ? 'Continue your personalized career journey with AI-powered guidance, track your progress, and discover new opportunities tailored just for you.'
              : 'Get personalized career counseling, discover opportunities, and plan your future with our intelligent AI counsellor designed for students from all backgrounds.'
          ),
          
          // Dynamic CTA Buttons
          React.createElement(
            'div',
            { className: 'flex flex-col sm:flex-row gap-6 justify-center items-center mb-16' },
            isAuthenticated ? [
              // For authenticated users
              React.createElement(
                Link,
                { 
                  key: 'dashboard',
                  to: '/dashboard', 
                  className: 'group bg-white text-blue-600 hover:text-blue-700 font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 text-lg'
                },
                React.createElement('span', { className: 'text-2xl' }, '📊'),
                'View Dashboard',
                React.createElement(
                  'svg',
                  { className: 'w-5 h-5 group-hover:translate-x-1 transition-transform duration-200', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
                  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M13 7l5 5m0 0l-5 5m5-5H6' })
                )
              ),
              React.createElement(
                Link,
                { 
                  key: 'chat',
                  to: '/chat', 
                  className: 'group bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-full transition-all duration-300 flex items-center gap-3 text-lg'
                },
                React.createElement('span', { className: 'text-xl' }, '💬'),
                'Continue Chat'
              )
            ] : [
              // For non-authenticated users
              React.createElement(
                Link,
                { 
                  key: 'auth',
                  to: '/auth', 
                  className: 'group bg-white text-blue-600 hover:text-blue-700 font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 text-lg'
                },
                React.createElement('span', { className: 'text-2xl' }, '🚀'),
                'Get Started Free',
                React.createElement(
                  'svg',
                  { className: 'w-5 h-5 group-hover:translate-x-1 transition-transform duration-200', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
                  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M13 7l5 5m0 0l-5 5m5-5H6' })
                )
              ),
              React.createElement(
                'a',
                { 
                  key: 'demo',
                  href: '#features', 
                  className: 'group bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-full transition-all duration-300 flex items-center gap-3 text-lg'
                },
                React.createElement('span', { className: 'text-xl' }, '👀'),
                'See Features'
              )
            ]
          ),
          
          // ✅ FIXED STATS SECTION - Apply .map() to both conditions
          React.createElement(
            'div',
            { className: 'grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto' },
            (isAuthenticated ? [
              { number: user?.coursesCompleted || '3', label: 'Courses Completed', icon: '✅' },
              { number: user?.goalsAchieved || '8', label: 'Goals Achieved', icon: '🎯' },
              { number: user?.skillsLearned || '15', label: 'Skills Learned', icon: '⚡' },
              { number: user?.applicationsSubmitted || '5', label: 'Applications', icon: '📝' }
            ] : [
              { number: '10,000+', label: 'Students Helped', icon: '👨‍🎓' },
              { number: '500+', label: 'Career Paths', icon: '🛤️' },
              { number: '95%', label: 'Success Rate', icon: '🎯' },
              { number: '24/7', label: 'AI Support', icon: '🤖' }
            ]).map(function(stat, index) {
              return React.createElement(
                'div',
                { key: index, className: 'text-center' },
                React.createElement('div', { className: 'text-3xl mb-2' }, stat.icon),
                React.createElement('div', { className: 'text-2xl sm:text-3xl font-bold mb-2' }, stat.number),
                React.createElement('div', { className: 'text-blue-100 text-sm font-medium' }, stat.label)
              );
            })
          )
        )
      )
    ),
    
    // Features Section (only show for non-authenticated users)
    !isAuthenticated && React.createElement(
      'section',
      { id: 'features', className: 'py-20 lg:py-32 bg-gray-50' },
      React.createElement(
        'div',
        { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
        
        // Section Header
        React.createElement(
          'div',
          { className: 'text-center mb-20' },
          React.createElement('h2', { className: 'text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6' }, 'Why Choose AI Career Counsellor?'),
          React.createElement('p', { className: 'text-xl text-gray-600 max-w-3xl mx-auto' }, 'Our platform bridges the gap in career guidance accessibility with cutting-edge AI technology')
        ),
        
        // Features Grid
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8' },
          [
            { 
              icon: '🤖', 
              title: 'AI-Powered Guidance', 
              desc: 'Get personalized career recommendations based on your interests, skills, and academic performance using advanced machine learning.',
              color: 'from-blue-500 to-cyan-500'
            },
            { 
              icon: '🎯', 
              title: 'Smart Matching', 
              desc: 'Our advanced algorithms analyze thousands of data points to match you with careers that perfectly align with your unique profile.',
              color: 'from-purple-500 to-pink-500'
            },
            { 
              icon: '📊', 
              title: 'Progress Tracking', 
              desc: 'Monitor your career journey with beautiful dashboards, analytics, and milestone tracking to stay motivated.',
              color: 'from-green-500 to-emerald-500'
            },
            { 
              icon: '🌍', 
              title: 'Local Opportunities', 
              desc: 'Discover scholarships, courses, internships, and job opportunities specifically available in your geographic area.',
              color: 'from-orange-500 to-red-500'
            }
          ].map(function(feature, index) {
            return React.createElement(
              'div',
              { 
                key: index, 
                className: 'group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100'
              },
              React.createElement(
                'div',
                { className: `w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300` },
                React.createElement('span', { className: 'text-2xl' }, feature.icon)
              ),
              React.createElement('h3', { className: 'text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300' }, feature.title),
              React.createElement('p', { className: 'text-gray-600 leading-relaxed' }, feature.desc)
            );
          })
        )
      )
    ),
    
    // CTA Section (show different CTA for authenticated vs non-authenticated)
    React.createElement(
      'section',
      { className: 'py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white' },
      React.createElement(
        'div',
        { className: 'max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8' },
        React.createElement(
          'h2', 
          { className: 'text-3xl sm:text-4xl font-bold mb-6' }, 
          isAuthenticated ? `Ready to Continue, ${user?.name || 'User'}?` : 'Ready to Start Your Career Journey?'
        ),
        React.createElement(
          'p', 
          { className: 'text-xl text-blue-100 mb-10' }, 
          isAuthenticated 
            ? 'Your personalized AI counsellor is waiting to help you achieve your next career milestone.'
            : 'Join thousands of students who have already discovered their perfect career path with our AI-powered platform.'
        ),
        React.createElement(
          Link,
          { 
            to: isAuthenticated ? '/chat' : '/auth',
            className: 'inline-flex items-center gap-3 bg-white text-blue-600 font-bold text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300'
          },
          React.createElement('span', { className: 'text-2xl' }, isAuthenticated ? '💬' : '✨'),
          isAuthenticated ? 'Continue Your Journey' : 'Start Your Journey Now',
          React.createElement(
            'svg',
            { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M13 7l5 5m0 0l-5 5m5-5H6' })
          )
        )
      )
    )
  );
};

export default Home;
