import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage to prevent flash of unauthenticated content
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuthState = localStorage.getItem('isAuthenticated');
    return storedAuthState === 'true';
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Function to check authentication status with the server
  const checkAuthStatus = async () => {
    try {
      // If there's no cookie, don't make the request
      // if (!document.cookie.includes('sid=')) {
      //   setIsAuthenticated(false);
      //   localStorage.removeItem('isAuthenticated');
      //   setLoading(false);
      //   return;
      // }

      const response = await axiosInstance.get('/check-auth', { 
        timeout: 5000 // Set timeout directly on axios request
      });
      
      // If we got here, the request succeeded
      if (response && response.data && response.status === 200) {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        
        // If the server returns user data, save it
        if (response.data.user) {
          setUser(response.data.user);
        }
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      
      // Keep the user authenticated if it's just a network error
      // This prevents logging out on temporary network issues
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || !error.response) {
        console.log('Network error, keeping current auth state');
        // Don't change isAuthenticated state here
      } else {
        // Clear authentication for other errors
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        
        // Only show error toast if it's not a 401 (unauthorized)
        if (error.response?.status !== 401) {
          toast.error('Authentication check failed. Please try logging in again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Check auth status when component mounts
  useEffect(() => {
    checkAuthStatus();
    
    // Set up interval to periodically check auth (optional)
    const interval = setInterval(() => {
      // Only check if we think we're authenticated to avoid unnecessary requests
      if (isAuthenticated) {
        checkAuthStatus();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    if (userData) {
      setUser(userData);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('isAuthenticated');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      loading, 
      login, 
      logout, 
      user,
      checkAuthStatus // Expose this so it can be called after login
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;