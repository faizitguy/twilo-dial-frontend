import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  AppBar,
  Toolbar,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Call as CallIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axios';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    notes: '',
  });

  const theme = useTheme();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axiosInstance.get('/contacts', {
        params: {
          search: searchTerm,
        },
      });
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (contact = null) => {
    if (contact) {
      setEditContact(contact);
      setFormData(contact);
    } else {
      setEditContact(null);
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditContact(null);
    setFormData({
      name: '',
      phoneNumber: '',
      email: '',
      notes: '',
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editContact) {
        await axiosInstance.put(`/contacts/${editContact.id}`, formData);
        toast.success('Contact updated successfully');
      } else {
        await axiosInstance.post('/contacts', formData);
        toast.success('Contact created successfully');
      }
      handleDialogClose();
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error(error.response?.data?.message || 'Failed to save contact');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await axiosInstance.delete(`/contacts/${id}`);
        toast.success('Contact deleted successfully');
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error('Failed to delete contact');
      }
    }
  };

  const handleCall = async (phoneNumber) => {
    try {
      const response = await axiosInstance.post('/initiateCall', {
        phoneNumber: phoneNumber.trim()
      });
      
      if (response.data && response.data.callSid) {
        toast.success('Call initiated successfully');
      } else {
        toast.error('Failed to initiate call');
      }
    } catch (error) {
      console.error('Call error:', error);
      toast.error('Failed to initiate call');
    }
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
      bgcolor: '#f5f5f5',
      pb: 7, // Add padding for bottom navigation
    }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1,
            color: 'text.primary',
            fontWeight: 500
          }}>
            Contacts
          </Typography>
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 300 }}>
            <TextField
              size="small"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchContacts()}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  borderRadius: 2,
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={fetchContacts}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
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
            {contacts.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                      No contacts found
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              contacts.map((contact, index) => (
                <ListItem
                  key={contact.id}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                  secondaryAction={
                    <Box>
                      <IconButton
                        onClick={() => handleCall(contact.phoneNumber)}
                        sx={{ color: theme.palette.success.main }}
                      >
                        <CallIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDialogOpen(contact)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(contact.id)}
                        sx={{ color: theme.palette.error.main }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {contact.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {contact.phoneNumber}
                        </Typography>
                        {contact.email && (
                          <Typography variant="body2" color="text.secondary">
                            {contact.email}
                          </Typography>
                        )}
                        {contact.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {contact.notes}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      </Container>

      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 80, // Positioned above bottom navigation
        }}
        onClick={() => handleDialogOpen()}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editContact ? 'Edit Contact' : 'New Contact'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              fullWidth
              required
              placeholder="+1234567890"
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editContact ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contacts; 