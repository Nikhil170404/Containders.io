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
  FilterList,
  ShoppingCart,
  LocalOffer,
  Star,
} from '@mui/icons-material';

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const items = [
    {
      id: 1,
      name: 'Premium Battle Pass',
      price: 1000,
      image: '/marketplace/battle-pass.jpg',
      category: 'Battle Pass',
      rating: 4.8,
      description: 'Get exclusive rewards and unlock premium content',
    },
    {
      id: 2,
      name: 'Legendary Skin Bundle',
      price: 2500,
      image: '/marketplace/skin-bundle.jpg',
      category: 'Skins',
      rating: 4.9,
      description: 'Collection of rare and exclusive character skins',
    },
    {
      id: 3,
      name: 'Special Emote Pack',
      price: 500,
      image: '/marketplace/emote-pack.jpg',
      category: 'Emotes',
      rating: 4.5,
      description: 'Express yourself with these unique emotes',
    },
  ];

  const renderItems = () => {
    return items.map((item) => (
      <Grid item xs={12} sm={6} md={4} key={item.id}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardMedia
            component="img"
            height="200"
            image={item.image}
            alt={item.name}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h5" component="h2">
              {item.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip
                icon={<LocalOffer />}
                label={item.category}
                size="small"
                color="primary"
                sx={{ mr: 1 }}
              />
              <Chip
                icon={<Star />}
                label={item.rating}
                size="small"
                color="secondary"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              {item.description}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" color="primary">
                {item.price} Coins
              </Typography>
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                color="primary"
              >
                Buy Now
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search marketplace..."
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
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button startIcon={<FilterList />} variant="outlined">
                Filter
              </Button>
              <Button startIcon={<ShoppingCart />} variant="outlined">
                Cart
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4}>
        {renderItems()}
      </Grid>
    </Container>
  );
};

export default Marketplace;
