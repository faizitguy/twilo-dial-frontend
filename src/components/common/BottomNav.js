import React from 'react';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
} from '@mui/material';
import {
  Dialpad as DialpadIcon,
  Contacts as ContactsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/dialer') return 0;
    if (path === '/contacts') return 1;
    if (path === '/history') return 2;
    return 0;
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: '12px 12px 0 0',
        overflow: 'hidden',
      }}
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={(event, newValue) => {
          switch (newValue) {
            case 0:
              navigate('/dialer');
              break;
            case 1:
              navigate('/contacts');
              break;
            case 2:
              navigate('/history');
              break;
            default:
              break;
          }
        }}
        sx={{
          height: 65,
          bgcolor: 'white',
        }}
      >
        <BottomNavigationAction
          label="Dialer"
          icon={<DialpadIcon />}
          sx={{
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          }}
        />
        <BottomNavigationAction
          label="Contacts"
          icon={<ContactsIcon />}
          sx={{
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          }}
        />
        <BottomNavigationAction
          label="History"
          icon={<HistoryIcon />}
          sx={{
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav; 