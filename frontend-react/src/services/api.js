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

// Add response interceptors here for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.response?.data?.message || error.message;
    const status = error.response?.status;
    
    console.error(`[API Error ${status || 'Network'}]`, message);
    
    if (status === 404) {
      console.warn("Target endpoint not found. Verify VITE_API_URL and backend routing.");
    } else if (status === 401 || status === 403) {
      console.warn("Authentication error. Redirecting to login session.");
      // Soft handle - actual logout happens in Dashboard.jsx if needed
    }

    error.readableMessage = message;
    return Promise.reject(error);
  }
);

export default api;
