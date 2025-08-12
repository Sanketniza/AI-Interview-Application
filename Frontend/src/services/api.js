import axios from 'axios';

// Create an axios instance
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('API register error:', error);
      throw error; // Re-throw to be caught by the component
    }
  },
  
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('API login error:', error);
      throw error; // Re-throw to be caught by the component
    }
  },
  
  // Verify email with OTP
  verifyEmail: async (data) => {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  },
  
  // Request password reset
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  // Reset password with OTP
  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  }
};

// Interview services
export const interviewService = {
  // Start a new interview
  startInterview: async (interviewData) => {
    try {
      const response = await api.post('/interview', interviewData);
      return response.data;
    } catch (error) {
      console.error('API start interview error:', error);
      throw error;
    }
  },
  
  // Generate questions for an interview
  generateQuestions: async (interviewId) => {
    try {
      const response = await api.post(`/interview/${interviewId}/questions`);
      return response.data;
    } catch (error) {
      console.error('API generate questions error:', error.response?.data?.message || error.message);
      console.error('Full error details:', error);
      
      // Create a more descriptive error object
      const enhancedError = new Error(
        error.response?.data?.message || 
        error.response?.data?.error ||
        'Failed to generate interview questions'
      );
      enhancedError.originalError = error;
      enhancedError.statusCode = error.response?.status;
      enhancedError.details = error.response?.data;
      
      throw enhancedError;
    }
  },
  
  // Save a question and answer
  saveQuestionAnswer: async (interviewId, questionData) => {
    try {
      const response = await api.put(`/interview/${interviewId}/question`, questionData);
      return response.data;
    } catch (error) {
      console.error('API save question error:', error);
      throw error;
    }
  },
  
  // Complete an interview
  completeInterview: async (interviewId) => {
    try {
      const response = await api.put(`/interview/${interviewId}/complete`);
      return response.data;
    } catch (error) {
      console.error('API complete interview error:', error.response?.data?.message || error.message);
      console.error('Full error details:', error);
      
      // Create a more descriptive error object
      const enhancedError = new Error(
        error.response?.data?.message || 
        error.response?.data?.error ||
        'Failed to complete the interview'
      );
      enhancedError.originalError = error;
      enhancedError.statusCode = error.response?.status;
      enhancedError.details = error.response?.data;
      
      throw enhancedError;
    }
  },
  
  // Get all interviews
  getInterviews: async () => {
    try {
      const response = await api.get('/interview');
      return response.data;
    } catch (error) {
      console.error('API get interviews error:', error);
      throw error;
    }
  },
  
  // Get a specific interview
  getInterview: async (interviewId) => {
    try {
      const response = await api.get(`/interview/${interviewId}`);
      return response.data;
    } catch (error) {
      console.error('API get interview error:', error);
      throw error;
    }
  }
};

// Report services
export const reportService = {
  // Generate a report for an interview
  generateReport: async (interviewId) => {
    try {
      const response = await api.post(`/report/${interviewId}`);
      return response.data;
    } catch (error) {
      console.error('API generate report error:', error.response?.data?.message || error.message);
      console.error('Full error details:', error);
      
      // Create a more descriptive error object
      const enhancedError = new Error(
        error.response?.data?.message || 
        error.response?.data?.error ||
        'Failed to generate the interview report'
      );
      enhancedError.originalError = error;
      enhancedError.statusCode = error.response?.status;
      enhancedError.details = error.response?.data;
      
      throw enhancedError;
    }
  },
  
  // Get all reports
  getReports: async () => {
    try {
      const response = await api.get('/report');
      return response.data;
    } catch (error) {
      console.error('API get reports error:', error);
      throw error;
    }
  },
  
  // Get a specific report
  getReport: async (reportId) => {
    try {
      const response = await api.get(`/report/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('API get report error:', error);
      throw error;
    }
  }
};

export default api;
