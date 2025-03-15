import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axios';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await axiosInstance.post('/login', {
          username: formData.username,
          password: formData.password,
        });
      } else {
        await axiosInstance.post('/register', formData);
      }

      login(); // Update auth state
      toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
      navigate('/dialer');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#f5f5f5',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{
              textAlign: 'center',
              fontWeight: 500,
              color: theme.palette.primary.main,
            }}
          >
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              fullWidth
            />

            {!isLogin && (
              <>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  fullWidth
                />
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  placeholder="+1234567890"
                />
              </>
            )}

            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                mt: 1,
                borderRadius: 2,
              }}
            >
              {loading
                ? isLogin
                  ? 'Logging in...'
                  : 'Creating account...'
                : isLogin
                ? 'Login'
                : 'Create Account'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => setIsLogin(!isLogin)}
              sx={{
                textDecoration: 'none',
                color: theme.palette.primary.main,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Login'}
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Auth; 