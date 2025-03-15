import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Avatar,
  Fade,
} from '@mui/material';
import {
  CallEnd as CallEndIcon,
  MicOff as MicOffIcon,
  Mic as MicIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const CallScreen = ({ open, phoneNumber, onClose, callSid }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Update call duration every second
  React.useEffect(() => {
    let timer;
    if (open) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
      setCallDuration(0);
    };
  }, [open]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMuteToggle = async () => {
    try {
      // Here you would implement the mute functionality with your backend
      setIsMuted(!isMuted);
      toast.info(isMuted ? 'Microphone unmuted' : 'Microphone muted');
    } catch (error) {
      toast.error('Failed to toggle mute');
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(5px)',
        },
      }}
    >
      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          py={4}
          gap={2}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
            }}
          >
            {phoneNumber[1] || '#'}
          </Avatar>

          <Typography variant="h5" gutterBottom>
            {phoneNumber}
          </Typography>

          <Typography variant="body1" color="textSecondary" gutterBottom>
            {formatDuration(callDuration)}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 4,
              mt: 4,
            }}
          >
            <IconButton
              onClick={handleMuteToggle}
              sx={{
                backgroundColor: isMuted ? 'error.light' : 'action.selected',
                '&:hover': {
                  backgroundColor: isMuted ? 'error.main' : 'action.selected',
                },
                width: 56,
                height: 56,
              }}
            >
              {isMuted ? (
                <MicOffIcon sx={{ color: 'white' }} />
              ) : (
                <MicIcon sx={{ color: 'white' }} />
              )}
            </IconButton>

            <IconButton
              onClick={onClose}
              sx={{
                backgroundColor: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.dark',
                },
                width: 56,
                height: 56,
              }}
            >
              <CallEndIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CallScreen; 