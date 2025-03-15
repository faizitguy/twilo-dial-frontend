import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Chip,
  AppBar,
  Toolbar,
  Divider,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Call as CallIcon,
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import CallScreen from '../Dialer/CallScreen';

const CallHistory = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentCallSid, setCurrentCallSid] = useState(null);
  const [activePhoneNumber, setActivePhoneNumber] = useState('');

  const theme = useTheme();

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      const response = await axiosInstance.get('/calls/history');
      if (response.data && Array.isArray(response.data.calls)) {
        setCalls(response.data.calls);
      } else {
        toast.error('Invalid call history data received');
        setCalls([]);
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to fetch call history';
      toast.error(errorMessage);
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateCall = async (phoneNumber) => {
    try {
      const response = await axiosInstance.post('/initiateCall', {
        phoneNumber: phoneNumber.trim() // Ensure no whitespace
      });
      
      if (response.data && response.data.callSid) {
        setCurrentCallSid(response.data.callSid);
        setIsCallActive(true);
        setActivePhoneNumber(phoneNumber);
        toast.success('Call initiated successfully');
      } else {
        // If we get a response but no callSid
        toast.error('Invalid response from server. Please try again.');
      }
    } catch (error) {
      console.error('Call error:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to initiate call';
      toast.error(errorMessage);
      
      // Reset call state in case of error
      setIsCallActive(false);
      setCurrentCallSid(null);
      setActivePhoneNumber('');
    }
  };

  const handleEndCall = async () => {
    if (currentCallSid) {
      try {
        const response = await axiosInstance.post('/endCall', {
          callSid: currentCallSid
        });

        if (response.data && response.data.success) {
          toast.info('Call ended successfully');
        } else {
          toast.warning('Call may not have ended properly');
        }
      } catch (error) {
        console.error('End call error:', error);
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || error.message 
          || 'Failed to end call';
        toast.error(errorMessage);
      } finally {
        // Always reset the state and refresh history regardless of success/failure
        setIsCallActive(false);
        setCurrentCallSid(null);
        setActivePhoneNumber('');
        fetchCallHistory(); // Refresh the call history
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'canceled':
        return 'error';
      case 'in-progress':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '0s';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f5f5f5'
    }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent' }}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/dialer')}
            sx={{ color: theme.palette.primary.main, mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1,
            color: 'text.primary',
            fontWeight: 500
          }}>
            Recent
          </Typography>
          <IconButton 
            onClick={handleLogout}
            sx={{ color: theme.palette.error.main }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ flex: 1, py: 2 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'white',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <List sx={{ p: 0 }}>
            {calls.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                      No recent calls
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              calls.map((call, index) => (
                <React.Fragment key={call.id}>
                  <ListItem
                    sx={{
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleInitiateCall(call.phoneNumber)}
                        sx={{ 
                          color: theme.palette.success.main,
                          '&:hover': {
                            bgcolor: 'rgba(76, 175, 80, 0.08)',
                          },
                        }}
                      >
                        <CallIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {call.phoneNumber}
                          </Typography>
                          <Chip
                            label={call.status}
                            size="small"
                            color={getStatusColor(call.status)}
                            sx={{ 
                              textTransform: 'capitalize',
                              height: '20px',
                              '& .MuiChip-label': {
                                px: 1,
                                fontSize: '0.75rem',
                              }
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {format(new Date(call.startTime), 'MMM d, yyyy h:mm a')}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                              {formatDuration(call.duration)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < calls.length - 1 && (
                    <Divider sx={{ ml: 2 }} />
                  )}
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      </Container>

      <CallScreen
        open={isCallActive}
        phoneNumber={activePhoneNumber}
        onClose={handleEndCall}
        callSid={currentCallSid}
      />
    </Box>
  );
};

export default CallHistory; 