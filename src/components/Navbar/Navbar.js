import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  EmojiEvents,
  SportsEsports,
  Group,
  Person,
  AccountBalanceWallet,
  ExitToApp,
  Home,
  People,
  Settings,
  Receipt,
} from '@mui/icons-material';
import { logout } from '../../redux/actions/authAction';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };

  // Admin navigation items
  const adminNavItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Tournaments', icon: <EmojiEvents />, path: '/admin/tournaments' },
    { text: 'Games', icon: <SportsEsports />, path: '/admin/games' },
    { text: 'Users', icon: <Group />, path: '/admin/users' },
    { text: 'Transactions', icon: <AccountBalanceWallet />, path: '/admin/transactions' },
    { text: 'Wallet Requests', icon: <Receipt />, path: '/admin/wallet-requests' },
  ];

  // User navigation items
  const userNavItems = [
    { text: 'Home', icon: <Home />, path: '/home' },
    { text: 'Tournaments', icon: <EmojiEvents />, path: '/tournaments' },
    { text: 'Teams', icon: <People />, path: '/teams' },
    { text: 'Players', icon: <Group />, path: '/players' },
    { text: 'Wallet', icon: <AccountBalanceWallet />, path: '/wallet' },
  ];

  const navItems = user?.isAdmin ? adminNavItems : userNavItems;

  // Don't show navbar on login, register, and landing pages
  if (['/login', '/register', '/'].includes(location.pathname)) {
    return null;
  }

  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* Mobile Menu Icon */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'none' } }}
          onClick={handleMobileMenu}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo/Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => handleNavigation(user?.isAdmin ? '/admin' : '/home')}
        >
          ESports Platform
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                color: location.pathname === item.path ? '#ffd700' : 'inherit',
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        {/* User Menu */}
        <Box>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar
              alt={user?.displayName || user?.email}
              src={user?.photoURL}
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/settings')}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Mobile Navigation Menu */}
        <Menu
          id="mobile-menu"
          anchorEl={mobileMenuAnchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(mobileMenuAnchorEl)}
          onClose={handleClose}
        >
          {navItems.map((item) => (
            <MenuItem
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.text}</ListItemText>
            </MenuItem>
          ))}
          <MenuItem onClick={() => handleNavigation('/profile')}>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/teams')}>
            <ListItemIcon>
              <Group />
            </ListItemIcon>
            <ListItemText>Teams</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/players')}>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText>Players</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
