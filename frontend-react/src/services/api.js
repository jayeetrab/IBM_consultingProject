import axios from 'axios';

// Get the API URL from environment variables
// Fallback to /api for local development via Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ibm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptors for standardized error reporting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.response?.data?.message || error.message;
    console.error(' [API Error] ', message);
    
    // We can also attach the cleaned message to the error object 
    // so components can display it easily.
    error.readableMessage = message;
    
    return Promise.reject(error);
  }
);

export default api;
