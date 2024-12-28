import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  Tooltip,
} from '@mui/material';
import {
  NotificationsOutlined,
  MonetizationOn,
  EmojiEvents,
  SportsEsports,
  Person,
  AccessTime,
  Announcement,
  Campaign,
  Update,
  LocalOffer,
} from '@mui/icons-material';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useSelector } from 'react-redux';
import NotificationService from '../../services/NotificationService';

const NotificationMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.uid) return;

    // Query for the 5 most recent notifications
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList = [];
      let unread = 0;

      snapshot.forEach((doc) => {
        const notification = { id: doc.id, ...doc.data() };
        notificationsList.push(notification);
        if (!notification.read) unread++;
      });

      setNotifications(notificationsList);
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'wallet':
        return <MonetizationOn color="primary" />;
      case 'tournament':
        return <EmojiEvents color="secondary" />;
      case 'game':
        return <SportsEsports color="success" />;
      case 'user':
        return <Person color="info" />;
      case 'announcement':
        return <Announcement color="primary" />;
      case 'update':
        return <Update color="info" />;
      case 'alert':
        return <Campaign color="error" />;
      case 'promotion':
        return <LocalOffer color="secondary" />;
      default:
        return <NotificationsOutlined />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        await NotificationService.markAsRead(notification.id);
      }

      // Navigate based on type
      switch (notification.type) {
        case 'wallet':
          navigate('/wallet');
          break;
        case 'tournament':
          navigate('/tournaments');
          break;
        case 'game':
          navigate('/game-center');
          break;
        default:
          navigate('/notifications');
      }

      handleClose();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleViewAll = () => {
    navigate('/notifications');
    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      const promises = notifications
        .filter(n => !n.read)
        .map(n => NotificationService.markAsRead(n.id));
      await Promise.all(promises);
      handleClose();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleClick}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsOutlined />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: '80vh',
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <>
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 1.5,
                  px: 2,
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {notification.message}
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 12 }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  secondaryTypographyProps={{
                    sx: {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }
                  }}
                />
              </MenuItem>
            ))}
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                onClick={handleViewAll}
                color="primary"
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu;
