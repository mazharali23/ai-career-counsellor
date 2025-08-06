import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const chatAPI = {
  createSession: () => api.post('/chat/session'),
  sendMessage: (sessionId, message) => api.post('/chat/message', { sessionId, message }),
  getHistory: () => api.get('/chat/history'),
};

export const careerAPI = {
  getCareers: (params) => api.get('/career', { params }),
  getCareerById: (id) => api.get(`/career/${id}`),
  getRecommendations: () => api.get('/career/recommendations/me'),
  getCategories: () => api.get('/career/meta/categories'),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  updateProgress: (data) => api.post('/dashboard/progress', data),
};

export const opportunityAPI = {
  getOpportunities: (params) => api.get('/opportunities', { params }),
  getOpportunityById: (id) => api.get(`/opportunities/${id}`),
  applyToOpportunity: (id, data) => api.post(`/opportunities/${id}/apply`, data),
  getMyApplications: () => api.get('/opportunities/applications/me'),
};

export default api;