import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Auth from './components/Auth/Auth';
import Dialer from './components/Dialer/Dialer';
import CallHistory from './components/History/CallHistory';
import Contacts from './components/Contacts/Contacts';
import BottomNav from './components/common/BottomNav';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dialer"
              element={
                <PrivateRoute>
                  <Dialer />
                  <BottomNav />
                </PrivateRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <PrivateRoute>
                  <Contacts />
                  <BottomNav />
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <CallHistory />
                  <BottomNav />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dialer" replace />} />
          </Routes>
        </Router>
        <ToastContainer position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
