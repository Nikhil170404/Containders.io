import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import {
  EmojiEvents as TournamentIcon,
  SportsEsports as GameIcon,
  Person as UserIcon,
  AccountBalanceWallet as WalletIcon,
<<<<<<< HEAD
  Assessment as AnalyticsIcon,
  Settings as SettingsIcon,
  Receipt as TransactionIcon,
} from '@mui/icons-material';
import { db, collection, getDocs } from '../../firebase';
import AdminLayout from './AdminLayout';
=======
  AccountBalanceWallet,
} from '@mui/icons-material';
import { db, collection, getDocs } from '../../firebase';
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    tournaments: 0,
    games: 0,
    transactions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, tournamentsSnap, gamesSnap, transactionsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'tournaments')),
          getDocs(collection(db, 'games')),
          getDocs(collection(db, 'transactions')),
        ]);

        setStats({
          users: usersSnap.size,
          tournaments: tournamentsSnap.size,
          games: gamesSnap.size,
          transactions: transactionsSnap.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

<<<<<<< HEAD
  const dashboardItems = [
    {
      title: 'Users',
      count: stats.users,
      description: 'Manage user accounts and permissions',
      icon: <UserIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/admin/users',
      buttonText: 'Manage Users',
    },
    {
      title: 'Tournaments',
      count: stats.tournaments,
      description: 'Manage tournaments and events',
      icon: <TournamentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/admin/tournaments',
      buttonText: 'Manage Tournaments',
    },
    {
      title: 'Games',
      count: stats.games,
      description: 'Manage games and categories',
      icon: <GameIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/admin/games',
      buttonText: 'Manage Games',
    },
    {
      title: 'Transactions',
      count: stats.transactions,
      description: 'View and manage transactions',
      icon: <TransactionIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/admin/transactions',
      buttonText: 'View Transactions',
    },
    {
      title: 'Wallet Requests',
      count: '-',
      description: 'Manage wallet requests',
      icon: <WalletIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/admin/wallet-requests',
      buttonText: 'View Requests',
    },
    {
      title: 'Analytics',
      count: '-',
      description: 'View platform analytics',
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/admin/analytics',
      buttonText: 'View Analytics',
    },
    {
      title: 'Settings',
      count: '-',
      description: 'Configure platform settings',
      icon: <SettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/admin/settings',
      buttonText: 'Manage Settings',
    },
  ];

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
        <Grid container spacing={3}>
          {dashboardItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[4],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {item.icon}
                    <Typography variant="h5" sx={{ ml: 1 }}>
                      {item.count}
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                    }}
                  >
                    {item.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;
=======
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Users Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <UserIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                <Typography variant="h5">{stats.users}</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>
                Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage user accounts and permissions
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleNavigate('/admin/users')}>
                Manage Users
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Tournaments Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TournamentIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                <Typography variant="h5">{stats.tournaments}</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>
                Tournaments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage tournaments
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleNavigate('/admin/tournaments')}>
                Manage Tournaments
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Games Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GameIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                <Typography variant="h5">{stats.games}</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>
                Games
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add and manage games
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleNavigate('/admin/games')}>
                Manage Games
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Transactions Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WalletIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                <Typography variant="h5">{stats.transactions}</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>
                Transactions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage transactions
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleNavigate('/admin/transactions')}>
                View Transactions
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Wallet Requests Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out',
              },
            }}
            onClick={() => navigate('/admin/wallet-requests')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWallet sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <div>
                  <Typography variant="h6">Wallet Requests</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage user wallet deposit requests
                  </Typography>
                </div>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
