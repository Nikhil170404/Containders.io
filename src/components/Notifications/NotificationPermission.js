import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import NotificationService from '../../services/NotificationService';

const NotificationPermission = () => {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    // Show dialog if notifications are not denied
    if (permission === 'default') {
      setOpen(true);
    }
  }, [permission]);

  const handleRequestPermission = async () => {
    const granted = await NotificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (permission === 'granted') {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Enable Notifications</DialogTitle>
      <DialogContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <NotificationsIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="body1">
            Stay updated with important notifications about your wallet, tournaments, and more!
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          We'll notify you about:
        </Typography>
        <ul>
          <li>Wallet transactions status</li>
          <li>Tournament updates</li>
          <li>Game invitations</li>
          <li>Important account updates</li>
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Maybe Later
        </Button>
        <Button
          onClick={handleRequestPermission}
          variant="contained"
          color="primary"
          startIcon={<NotificationsIcon />}
        >
          Enable Notifications
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPermission;
