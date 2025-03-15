import React, { useState } from 'react';
import {
  Box,
  Container,
  IconButton,
  Paper,
  Typography,
  Grid,
  Button,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Call as CallIcon,
  Backspace as BackspaceIcon,
  CallEnd as CallEndIcon,
  Logout as LogoutIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import CallScreen from './CallScreen';

const Dialer = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('+');
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentCallSid, setCurrentCallSid] = useState(null);
  const [showCallScreen, setShowCallScreen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = async () => {
    if (isCallActive) {
      await handleEndCall();
    }
    await logout();
    navigate('/auth');
  };

  const handleNumberClick = (num) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber(phoneNumber + num);
    } else {
      toast.warning('Maximum number length reached');
    }
  };

  const handleBackspace = () => {
    if (phoneNumber.length > 1) {
      setPhoneNumber(phoneNumber.slice(0, -1));
    }
  };

  const handleCall = async () => {
    if (phoneNumber.length < 8) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      const response = await axiosInstance.post('/initiateCall', {
        phoneNumber: phoneNumber.trim()
      });
      
      if (response.data && response.data.callSid) {
        setCurrentCallSid(response.data.callSid);
        setIsCallActive(true);
        setShowCallScreen(true);
        toast.success('Call initiated successfully');
      } else {
        toast.error('Invalid response from server. Please try again.');
      }
    } catch (error) {
      console.error('Call error:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to initiate call';
      toast.error(errorMessage);
      
      setIsCallActive(false);
      setCurrentCallSid(null);
      setShowCallScreen(false);
    }
  };

  const handleEndCall = async () => {
    if (currentCallSid) {
      try {
        const response = await axiosInstance.post('/endCall', {
          callSid: currentCallSid
        });

        if (response.data && response.data?.message) {
          toast.info('Call ended successfully');
        }
      } catch (error) {
        console.error('End call error:', error);
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || error.message 
          || 'Failed to end call';
        toast.error(errorMessage);
      } finally {
        setIsCallActive(false);
        setCurrentCallSid(null);
        setShowCallScreen(false);
      }
    }
  };

  const dialPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#f5f5f5'
    }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1,
            color: 'text.primary',
            fontWeight: 500
          }}>
            Phone
          </Typography>
          <IconButton 
            onClick={() => navigate('/history')}
            sx={{ color: theme.palette.primary.main }}
          >
            <HistoryIcon />
          </IconButton>
          <IconButton 
            onClick={handleLogout}
            sx={{ color: theme.palette.error.main }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="sm" 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          pb: 2
        }}
      >
        <Box sx={{ 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '85%',
          margin: 'auto'
        }}>
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontFamily: 'monospace',
              letterSpacing: 2,
              color: 'text.primary',
              fontSize: isMobile ? '2rem' : '2.5rem',
              mb: 2
            }}
          >
            {phoneNumber}
          </Typography>
          <IconButton 
            onClick={handleBackspace}
            sx={{ color: 'text.secondary', mb: 2 }}
          >
            <BackspaceIcon />
          </IconButton>
        </Box>

        <Paper 
          elevation={0}
          sx={{ 
            bgcolor: 'transparent',
            p: 2,
            borderRadius: 4,
            marginBottom: '70px'
          }}
        >
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {dialPad.map((row, rowIndex) => (
              <Grid container item key={rowIndex} justifyContent="center" spacing={3}>
                {row.map((num) => (
                  <Grid item key={num}>
                    <Button
                      sx={{
                        width: isMobile ? 65 : 72,
                        height: isMobile ? 65 : 72,
                        borderRadius: '50%',
                        fontSize: '1.75rem',
                        bgcolor: 'white',
                        color: 'text.primary',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                        },
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                      onClick={() => handleNumberClick(num)}
                      disabled={isCallActive}
                    >
                      {num}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            ))}
          </Grid>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mt: 2
          }}>
            {!isCallActive ? (
              <IconButton
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: theme.palette.success.main,
                  '&:hover': {
                    bgcolor: theme.palette.success.dark,
                  },
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                }}
                onClick={handleCall}
              >
                <CallIcon sx={{ color: 'white', fontSize: 32 }} />
              </IconButton>
            ) : (
              <IconButton
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: theme.palette.error.main,
                  '&:hover': {
                    bgcolor: theme.palette.error.dark,
                  },
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                }}
                onClick={handleEndCall}
              >
                <CallEndIcon sx={{ color: 'white', fontSize: 32 }} />
              </IconButton>
            )}
          </Box>
        </Paper>
      </Container>

      <CallScreen
        open={showCallScreen}
        phoneNumber={phoneNumber}
        onClose={handleEndCall}
        callSid={currentCallSid}
      />
    </Box>
  );
};

export default Dialer; 