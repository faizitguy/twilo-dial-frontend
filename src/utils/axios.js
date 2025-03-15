import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  withCredentials: true, // This is important for sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let the original error propagate
    return Promise.reject(error);
  }
);

export default axiosInstance; 