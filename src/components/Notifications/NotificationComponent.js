import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Button,
  Box,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  AccountBalanceWallet as WalletIcon,
  EmojiEvents as TournamentIcon,
  SportsEsports as GameIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationComponent = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'wallet':
        return <WalletIcon />;
      case 'tournament':
        return <TournamentIcon />;
      case 'game':
        return <GameIcon />;
      case 'user':
        return <UserIcon />;
      default:
        return <CircleIcon />;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'wallet':
        navigate('/admin/wallet-requests');
        break;
      case 'tournament':
        navigate('/admin/tournaments');
        break;
      case 'game':
        navigate('/admin/games');
        break;
      case 'user':
        navigate('/admin/users');
        break;
      default:
        if (notification.link) {
          navigate(notification.link);
        }
    }
    handleClose();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: '400px',
            width: '350px',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  cursor: 'pointer',
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
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {notification.message}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatTimestamp(notification.createdAt)}
                      </Typography>
                    </React.Fragment>
                  }
                />
                {!notification.read && (
                  <CircleIcon
                    sx={{
                      color: 'primary.main',
                      fontSize: 12,
                      ml: 1,
                    }}
                  />
                )}
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary={
                  <Typography align="center" color="text.secondary">
                    No notifications
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Menu>
    </>
  );
};

export default NotificationComponent;
