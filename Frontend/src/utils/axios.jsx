
import axios from 'axios';

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // This is crucial for cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to log requests
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('Unauthorized request - token may be expired');
      // You can redirect to login page here if needed
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;