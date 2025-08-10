// src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: `${API_BASE_URL}/api/auth`,
    chat: `${API_BASE_URL}/api/chat`,
    progress: `${API_BASE_URL}/api/progress`,
    dashboard: `${API_BASE_URL}/api/dashboard`,
    opportunities: `${API_BASE_URL}/api/opportunities`,
    career: `${API_BASE_URL}/api/career`
  }
};

// Centralized API call function
export const apiCall = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      ...options.headers
    },
    ...options
  };

  try {
    console.log(`🌐 API Call: ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Success: ${url}`, data);
    return data;
  } catch (error) {
    console.error(`❌ API Error: ${url}`, error);
    throw error;
  }
};
