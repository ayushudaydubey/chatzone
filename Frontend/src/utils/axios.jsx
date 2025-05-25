import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  timeout: 10000, // 10 seconds for regular requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Create a separate instance for file uploads with longer timeout
const fileUploadInstance = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  timeout: 120000, // 2 minutes for file uploads
  headers: {
    'Content-Type': 'multipart/form-data',
  }
});

// Log all requests for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to:`, config.baseURL + config.url);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Log all responses for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to server. Make sure your backend is running on http://localhost:3000');
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. The server took too long to respond.');
    }
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Add interceptors for file upload instance too
fileUploadInstance.interceptors.request.use(
  (config) => {
    console.log(`Making file upload request to:`, config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('File upload request error:', error);
    return Promise.reject(error);
  }
);

fileUploadInstance.interceptors.response.use(
  (response) => {
    console.log(`File upload response:`, response.status);
    return response;
  },
  (error) => {
    console.error('File upload response error:', error);
    
    if (error.code === 'ECONNABORTED') {
      console.error('File upload timeout. The file upload took too long.');
    }
    
    return Promise.reject(error);
  }
);

// Export both instances
export default axiosInstance;
export { fileUploadInstance };