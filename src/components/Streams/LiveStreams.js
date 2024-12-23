import React from 'react';
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
  Avatar,
} from '@mui/material';
import { Visibility, Person } from '@mui/icons-material';

const LiveStreams = () => {
  const streams = [
    {
      id: 1,
      title: 'Tournament Finals',
      streamer: 'ProGamer123',
      viewers: 1234,
      game: 'Battle Royale',
      thumbnail: '/stream-thumbnails/stream1.jpg',
      avatar: '/avatars/streamer1.jpg',
    },
    {
      id: 2,
      title: 'Ranked Matches',
      streamer: 'GameMaster',
      viewers: 856,
      game: 'Strategy Masters',
      thumbnail: '/stream-thumbnails/stream2.jpg',
      avatar: '/avatars/streamer2.jpg',
    },
    {
      id: 3,
      title: 'Practice Session',
      streamer: 'SpeedKing',
      viewers: 567,
      game: 'Speed Racing',
      thumbnail: '/stream-thumbnails/stream3.jpg',
      avatar: '/avatars/streamer3.jpg',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Live Streams
      </Typography>
      <Grid container spacing={4}>
        {streams.map((stream) => (
          <Grid item xs={12} sm={6} md={4} key={stream.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={stream.thumbnail}
                alt={stream.title}
                sx={{ position: 'relative' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                }}
              >
                <Typography variant="body2" color="white">
                  LIVE
                </Typography>
              </Box>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar src={stream.avatar} sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">
                    {stream.streamer}
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {stream.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    icon={<Person />}
                    label={stream.game}
                    size="small"
                    color="primary"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2">
                      {stream.viewers}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Watch Stream
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default LiveStreams;
