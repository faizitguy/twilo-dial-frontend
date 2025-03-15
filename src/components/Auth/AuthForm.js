import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Switch, FormControlLabel } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const loginSchema = Yup.object().shape({
    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
  });

  const registerSchema = Yup.object().shape({
    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^\+[1-9]\d{1,14}$/, 'Phone number must be in international format (e.g., +1234567890)')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const response = await axiosInstance.post(endpoint, values);
      
      if (response.data) {
        toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
        resetForm();
        if (isLogin) {
          login();
          // Navigate to the page user tried to access, or default to dialer
          const from = location.state?.from?.pathname || '/dialer';
          navigate(from);
        } else {
          // After registration, switch to login mode
          setIsLogin(true);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = isLogin 
    ? { username: '', password: '' }
    : { username: '', email: '', password: '', phoneNumber: '' };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          {isLogin ? 'Sign In' : 'Register'}
        </Typography>
        
        <FormControlLabel
          control={<Switch checked={!isLogin} onChange={() => setIsLogin(!isLogin)} />}
          label={isLogin ? "Need an account? Register" : "Already have an account? Login"}
          sx={{ mb: 2 }}
        />

        <Formik
          initialValues={initialValues}
          validationSchema={isLogin ? loginSchema : registerSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form style={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                name="username"
                autoComplete="username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
              />

              {!isLogin && (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Email"
                    name="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={values.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                    helperText={touched.phoneNumber && errors.phoneNumber}
                    placeholder="+1234567890"
                  />
                </>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isLogin ? 'Sign In' : 'Register'}
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default AuthForm; 