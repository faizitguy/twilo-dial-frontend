import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to auth page if not authenticated
    return <Navigate to="/auth" replace />;
  }

  // Render children if authenticated
  return children;
};

export default PrivateRoute; 