import React, { useState, useEffect } from 'react';

const Profile = function() {
  const [profile, setProfile] = useState({ name: '', email: '', education: '', location: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(function() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setProfile(function(prev) { return Object.assign({}, prev, userData); });
  }, []);

  const handleInputChange = function(e) {
    const { name, value } = e.target;
    setProfile(function(prev) {
      const newProfile = Object.assign({}, prev);
      newProfile[name] = value;
      return newProfile;
    });
  };

  const handleSave = function() {
    setLoading(true);
    setTimeout(function() {
      localStorage.setItem('user', JSON.stringify(profile));
      setIsEditing(false);
      setLoading(false);
    }, 1000);
  };

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50 py-8' },
    React.createElement(
      'div',
      { className: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8' },
      
      // Header Card
      React.createElement(
        'div',
        { className: 'bg-white rounded-2xl shadow-lg p-8 mb-8' },
        React.createElement(
          'div',
          { className: 'flex flex-col md:flex-row md:items-center md:justify-between' },
          React.createElement(
            'div',
            { className: 'flex items-center space-x-6' },
            React.createElement('div', { className: 'w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg' }, (profile.name || 'U').charAt(0).toUpperCase()),
            React.createElement(
              'div',
              null,
              React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, profile.name || 'User Profile'),
              React.createElement('p', { className: 'text-lg text-gray-600 mt-1' }, profile.email || 'No email set'),
              React.createElement(
                'div',
                { className: 'flex items-center mt-2' },
                React.createElement('div', { className: 'w-3 h-3 bg-green-500 rounded-full mr-2' }),
                React.createElement('span', { className: 'text-sm text-green-600 font-medium' }, 'Profile Active')
              )
            )
          ),
          React.createElement(
            'button',
            {
              className: 'mt-6 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200',
              onClick: function() { isEditing ? handleSave() : setIsEditing(true); },
              disabled: loading
            },
            loading ? React.createElement(
              React.Fragment,
              null,
              React.createElement('div', { className: 'w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' }),
              'Saving...'
            ) : (isEditing ? 'Save Changes' : 'Edit Profile')
          )
        )
      ),
      
      // Profile Content
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 lg:grid-cols-3 gap-8' },
        
        // Main Content
        React.createElement(
          'div',
          { className: 'lg:col-span-2' },
          React.createElement(
            'div',
            { className: 'bg-white rounded-2xl shadow-lg p-8' },
            React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-6' }, 'Personal Information'),
            
            isEditing ? React.createElement(
              'div',
              { className: 'space-y-6' },
              React.createElement(
                'div',
                null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Full Name'),
                React.createElement('input', {
                  type: 'text',
                  name: 'name',
                  value: profile.name || '',
                  onChange: handleInputChange,
                  className: 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Email Address'),
                React.createElement('input', {
                  type: 'email',
                  name: 'email',
                  value: profile.email || '',
                  onChange: handleInputChange,
                  className: 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Education Level'),
                React.createElement('select', {
                  name: 'education',
                  value: profile.education || '',
                  onChange: handleInputChange,
                  className: 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                }, [
                  React.createElement('option', { key: '', value: '' }, 'Select Education Level'),
                  React.createElement('option', { key: 'high-school', value: 'High School' }, 'High School'),
                  React.createElement('option', { key: 'bachelor', value: 'Bachelor' }, 'Bachelor\'s Degree'),
                  React.createElement('option', { key: 'master', value: 'Master' }, 'Master\'s Degree'),
                  React.createElement('option', { key: 'phd', value: 'PhD' }, 'PhD')
                ])
              ),
              React.createElement(
                'div',
                null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Location'),
                React.createElement('input', {
                  type: 'text',
                  name: 'location',
                  value: profile.location || '',
                  onChange: handleInputChange,
                  placeholder: 'City, Country',
                  className: 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                })
              )
            ) : React.createElement(
              'div',
              { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
              [
                { label: 'Name', value: profile.name || 'Not specified', icon: '👤' },
                { label: 'Email', value: profile.email || 'Not specified', icon: '📧' },
                { label: 'Education', value: profile.education || 'Not specified', icon: '🎓' },
                { label: 'Location', value: profile.location || 'Not specified', icon: '📍' }
              ].map(function(item, index) {
                return React.createElement(
                  'div',
                  { key: index, className: 'bg-gray-50 rounded-xl p-4' },
                  React.createElement(
                    'div',
                    { className: 'flex items-center space-x-3' },
                    React.createElement('span', { className: 'text-xl' }, item.icon),
                    React.createElement(
                      'div',
                      null,
                      React.createElement('p', { className: 'text-sm font-medium text-gray-500' }, item.label),
                      React.createElement('p', { className: 'text-lg font-semibold text-gray-900' }, item.value)
                    )
                  )
                );
              })
            )
          )
        ),
        
        // Sidebar
        React.createElement(
          'div',
          { className: 'space-y-8' },
          React.createElement(
            'div',
            { className: 'bg-white rounded-2xl shadow-lg p-6' },
            React.createElement('h3', { className: 'text-lg font-bold text-gray-900 mb-4' }, 'Quick Stats'),
            React.createElement(
              'div',
              { className: 'space-y-4' },
              [
                { label: 'Profile Completion', value: '75%', color: 'bg-blue-500' },
                { label: 'Career Matches', value: '8', color: 'bg-green-500' },
                { label: 'Skills Tracked', value: '12', color: 'bg-purple-500' }
              ].map(function(stat, index) {
                return React.createElement(
                  'div',
                  { key: index },
                  React.createElement(
                    'div',
                    { className: 'flex justify-between items-center mb-2' },
                    React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, stat.label),
                    React.createElement('span', { className: 'text-sm font-bold text-gray-900' }, stat.value)
                  ),
                  React.createElement(
                    'div',
                    { className: 'w-full bg-gray-200 rounded-full h-2' },
                    React.createElement('div', { className: `${stat.color} h-2 rounded-full`, style: { width: typeof stat.value === 'string' && stat.value.includes('%') ? stat.value : '60%' } })
                  )
                );
              })
            )
          ),
          React.createElement(
            'div',
            { className: 'bg-white rounded-2xl shadow-lg p-6' },
            React.createElement('h3', { className: 'text-lg font-bold text-gray-900 mb-4' }, 'Quick Actions'),
            React.createElement(
              'div',
              { className: 'space-y-3' },
              [
                { icon: '💬', label: 'Chat with AI', color: 'text-blue-600 hover:bg-blue-50' },
                { icon: '🔍', label: 'Find Opportunities', color: 'text-green-600 hover:bg-green-50' },
                { icon: '📊', label: 'View Progress', color: 'text-purple-600 hover:bg-purple-50' }
              ].map(function(action, index) {
                return React.createElement(
                  'button',
                  { key: index, className: `w-full flex items-center space-x-3 p-3 rounded-lg ${action.color} transition-colors duration-200` },
                  React.createElement('span', { className: 'text-xl' }, action.icon),
                  React.createElement('span', { className: 'font-medium' }, action.label)
                );
              })
            )
          )
        )
      )
    )
  );
};

export default Profile;
