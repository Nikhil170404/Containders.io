import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  EmojiEvents,
  Stars,
} from '@mui/icons-material';

const StatBox = ({ title, value, icon, progress }) => (
  <Paper sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {icon}
      <Typography variant="h6" sx={{ ml: 1 }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" gutterBottom>
      {value}
    </Typography>
    <LinearProgress variant="determinate" value={progress} />
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      {progress}% increase from last month
    </Typography>
  </Paper>
);

const Analytics = () => {
  const stats = [
    {
      title: 'Matches Played',
      value: '156',
      icon: <Timeline color="primary" />,
      progress: 75,
    },
    {
      title: 'Win Rate',
      value: '68%',
      icon: <TrendingUp color="success" />,
      progress: 68,
    },
    {
      title: 'Tournaments Won',
      value: '12',
      icon: <EmojiEvents color="warning" />,
      progress: 85,
    },
    {
      title: 'Current Rank',
      value: 'Gold',
      icon: <Stars color="info" />,
      progress: 60,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Performance Analytics
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatBox {...stat} />
          </Grid>
        ))}
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance History
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                Performance charts and detailed statistics will be displayed here
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Achievements
            </Typography>
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                Recent achievements and medals will be displayed here
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Skill Progress
            </Typography>
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                Skill progression and learning curve will be displayed here
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
