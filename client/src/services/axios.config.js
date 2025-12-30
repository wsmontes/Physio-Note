import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', data);
          break;
        case 404:
          // Resource not found
          console.error('Resource not found:', data);
          break;
        case 500:
          // Internal server error
          console.error('Server error:', data);
          break;
        default:
          console.error('API error:', data);
      }
      
      // Format error message for consumers
      const errorMessage = data?.error?.message || data?.message || 'An error occurred';
      error.userMessage = errorMessage;
    } else if (error.request) {
      // Request made but no response received (network error)
      console.error('Network error:', error.message);
      error.userMessage = 'Network error. Please check your connection.';
    } else {
      // Something else happened
      console.error('Error:', error.message);
      error.userMessage = error.message || 'An unexpected error occurred';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
