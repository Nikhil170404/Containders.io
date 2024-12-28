import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import NotificationService from '../../services/NotificationService';

const AdminNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [priority, setPriority] = useState('normal');
  const [sentNotifications, setSentNotifications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadSentNotifications = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('type', '==', 'admin'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      setSentNotifications(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      showSnackbar('Error loading notifications', 'error');
    }
  }, []);

  useEffect(() => {
    loadSentNotifications();
  }, [loadSentNotifications]);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      showSnackbar('Please fill in all fields', 'error');
      return;
    }

    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const sendPromises = [];

      usersSnapshot.forEach((userDoc) => {
        const userId = userDoc.id;
        sendPromises.push(
          NotificationService.createNotification(
            userId,
            title,
            message,
            'admin',
            priority
          )
        );
      });

      await Promise.all(sendPromises);
      showSnackbar('Notification sent to all users successfully', 'success');
      clearForm();
      loadSentNotifications();
    } catch (error) {
      console.error('Error sending notifications:', error);
      showSnackbar('Error sending notifications', 'error');
    }
  };

  const handleEditNotification = (notification) => {
    setSelectedNotification(notification);
    setTitle(notification.title);
    setMessage(notification.message);
    setType(notification.type || 'announcement');
    setPriority(notification.priority || 'normal');
    setOpenDialog(true);
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      showSnackbar('Notification deleted successfully', 'success');
      loadSentNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      showSnackbar('Error deleting notification', 'error');
    }
  };

  const handleUpdateNotification = async () => {
    try {
      await NotificationService.updateNotification(selectedNotification.id, {
        title,
        message,
        type,
        priority,
      });
      setOpenDialog(false);
      clearForm();
      showSnackbar('Notification updated successfully', 'success');
      loadSentNotifications();
    } catch (error) {
      console.error('Error updating notification:', error);
      showSnackbar('Error updating notification', 'error');
    }
  };

  const clearForm = () => {
    setTitle('');
    setMessage('');
    setType('announcement');
    setPriority('normal');
    setSelectedNotification(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Send Notification to All Users
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Notification Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <MenuItem value="announcement">Announcement</MenuItem>
                <MenuItem value="update">Update</MenuItem>
                <MenuItem value="alert">Alert</MenuItem>
                <MenuItem value="promotion">Promotion</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={4}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={handleSendNotification}
              sx={{ mt: 2 }}
            >
              Send to All Users
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sent Notifications
        </Typography>
        <Grid container spacing={2}>
          {sentNotifications.map((notification) => (
            <Grid item xs={12} key={notification.id}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.createdAt?.toDate().toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditNotification(notification)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteNotification(notification.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Notification</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={4}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <MenuItem value="announcement">Announcement</MenuItem>
              <MenuItem value="update">Update</MenuItem>
              <MenuItem value="alert">Alert</MenuItem>
              <MenuItem value="promotion">Promotion</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateNotification} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminNotifications;
