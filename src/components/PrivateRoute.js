import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, checkAuthStatus } = useAuth();
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(true);
  const [localLoading, setLocalLoading] = useState(true);

  // Refresh auth status when mounting a protected route
  useEffect(() => {
    const refreshAuth = async () => {
      // Only do the check if we have a cookie
      if (document.cookie.includes('sid=')) {
        await checkAuthStatus();
      }
      setLocalLoading(false);
    };
    
    refreshAuth();
  }, [checkAuthStatus]);

  // Show loader for a maximum of 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Show loader if global loading or local loading is true, but respect the showLoader timeout
  if ((loading || localLoading) && showLoader) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="textSecondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // If we're not loading and not authenticated, redirect to auth
  if (!loading && !localLoading && !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If we're authenticated or the loader timed out but we still think we're authenticated, show the protected route
  return children;
};

export default PrivateRoute;