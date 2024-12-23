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
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  PlayArrow,
  School,
  AccessTime,
  Star,
} from '@mui/icons-material';

const Academy = () => {
  const courses = [
    {
      id: 1,
      title: 'Battle Royale Mastery',
      description: 'Learn advanced strategies and tactics for Battle Royale games',
      image: '/courses/battle-royale.jpg',
      duration: '2 hours',
      level: 'Advanced',
      rating: 4.8,
      progress: 75,
    },
    {
      id: 2,
      title: 'Strategy Game Fundamentals',
      description: 'Master the basics of strategic gameplay and decision making',
      image: '/courses/strategy.jpg',
      duration: '1.5 hours',
      level: 'Beginner',
      rating: 4.5,
      progress: 30,
    },
    {
      id: 3,
      title: 'Pro Racing Techniques',
      description: 'Advanced racing techniques and track mastery',
      image: '/courses/racing.jpg',
      duration: '3 hours',
      level: 'Intermediate',
      rating: 4.7,
      progress: 0,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gaming Academy
      </Typography>
      
      <Grid container spacing={4}>
        {courses.map((course) => (
          <Grid item xs={12} md={4} key={course.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={course.image}
                alt={course.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {course.title}
                </Typography>
                <Typography color="text.secondary" paragraph>
                  {course.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <Chip
                    icon={<School />}
                    label={course.level}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    icon={<AccessTime />}
                    label={course.duration}
                    size="small"
                  />
                  <Chip
                    icon={<Star />}
                    label={course.rating}
                    size="small"
                    color="secondary"
                  />
                </Box>

                {course.progress > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={course.progress} />
                  </Box>
                )}

                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  fullWidth
                >
                  {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Academy;
