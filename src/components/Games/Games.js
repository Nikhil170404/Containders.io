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
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  People,
  Star,
  Gamepad,
} from '@mui/icons-material';

const Games = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const games = [
    {
      id: 1,
      title: 'Counter-Strike 2',
      image: '/game-images/cs2.jpg',
      players: '125K',
      category: 'FPS',
      rating: 4.8,
      description: 'The next evolution of Counter-Strike, the world\'s most played FPS game.',
    },
    {
      id: 2,
      title: 'League of Legends',
      image: '/game-images/lol.jpg',
      players: '180K',
      category: 'MOBA',
      rating: 4.7,
      description: 'A fast-paced, competitive online game that blends speed and strategy.',
    },
    {
      id: 3,
      title: 'Valorant',
      image: '/game-images/valorant.jpg',
      players: '95K',
      category: 'FPS',
      rating: 4.6,
      description: 'A 5v5 tactical shooter with unique character abilities.',
    },
    {
      id: 4,
      title: 'Dota 2',
      image: '/game-images/dota2.jpg',
      players: '85K',
      category: 'MOBA',
      rating: 4.5,
      description: 'A complex strategy game with endless possibilities.',
    },
  ];

  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Games
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={4}>
        {filteredGames.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={game.image}
                alt={game.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {game.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {game.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <Chip
                    icon={<Gamepad />}
                    label={game.category}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    icon={<People />}
                    label={`${game.players} Players`}
                    size="small"
                  />
                  <Chip
                    icon={<Star />}
                    label={game.rating}
                    size="small"
                    color="secondary"
                  />
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  color="primary"
                >
                  Play Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Games;
