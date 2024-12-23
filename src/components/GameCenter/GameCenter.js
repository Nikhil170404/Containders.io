import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { Gamepad, EmojiEvents, School, Stars } from '@mui/icons-material';

const GameCenter = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setLoading(true);
    setTabValue(newValue);
    // Simulate loading of new content
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const games = [
    {
      id: 1,
      title: 'Battle Royale',
      image: '/game-images/battle-royale.jpg',
      players: '2.5K playing',
      category: 'Action',
      description: 'Survive and become the last player standing in this intense battle royale game.',
    },
    {
      id: 2,
      title: 'Strategy Masters',
      image: '/game-images/strategy.jpg',
      players: '1.8K playing',
      category: 'Strategy',
      description: 'Test your strategic thinking in this competitive multiplayer game.',
    },
    {
      id: 3,
      title: 'Speed Racing',
      image: '/game-images/racing.jpg',
      players: '3.2K playing',
      category: 'Racing',
      description: 'Race against other players in high-speed competitive matches.',
    },
  ];

  const renderGameCards = () => {
    return games.map((game) => (
      <Grid item xs={12} sm={6} md={4} key={game.id}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardMedia
            component="img"
            height="140"
            image={game.image}
            alt={game.title}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h5" component="h2">
              {game.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {game.description}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="primary">
                {game.players}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {game.category}
              </Typography>
            </Box>
          </CardContent>
          <Box sx={{ p: 2 }}>
            <Button variant="contained" fullWidth>
              Play Now
            </Button>
          </Box>
        </Card>
      </Grid>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab icon={<Gamepad />} label="GAMES" />
          <Tab icon={<EmojiEvents />} label="TOURNAMENTS" />
          <Tab icon={<School />} label="PRACTICE" />
          <Tab icon={<Stars />} label="RANKINGS" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {renderGameCards()}
        </Grid>
      )}
    </Container>
  );
};

export default GameCenter;
