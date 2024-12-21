import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PlayCircleOutline, EmojiEvents, People, SportsEsports } from '@mui/icons-material';

const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(4, 0),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url(/gaming-pattern.png) repeat',
    opacity: 0.1,
  },
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
    background: 'rgba(255, 255, 255, 0.15)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(2),
  marginTop: theme.spacing(4),
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  fontSize: '1.1rem',
  '&.primary': {
    background: 'linear-gradient(45deg, #ff4081 30%, #ff6b9b 90%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(45deg, #f50057 30%, #ff4081 90%)',
    },
  },
  '&.secondary': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '2px solid white',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
    },
  },
}));

const features = [
  {
    icon: <SportsEsports sx={{ fontSize: 40, mb: 2, color: '#ff4081' }} />,
    title: 'Competitive Gaming',
    description: 'Join tournaments across multiple game titles and compete with players worldwide',
  },
  {
    icon: <EmojiEvents sx={{ fontSize: 40, mb: 2, color: '#ff4081' }} />,
    title: 'Win Prizes',
    description: 'Compete for cash prizes, gaming gear, and exclusive rewards',
  },
  {
    icon: <People sx={{ fontSize: 40, mb: 2, color: '#ff4081' }} />,
    title: 'Community',
    description: 'Connect with fellow gamers, form teams, and build your network',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <HeroSection>
      <Container maxWidth="lg">
        <Box
          sx={{
            pt: matches ? 8 : 12,
            pb: matches ? 6 : 8,
            textAlign: 'center',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                fontWeight: 700,
                marginBottom: 2,
                background: 'linear-gradient(45deg, #ff4081 30%, #ff6b9b 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Level Up Your Gaming
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
                fontWeight: 400,
                opacity: 0.9,
                maxWidth: '800px',
                marginBottom: 4,
              }}
            >
              Join the ultimate esports platform where competitive gaming meets community.
              Compete, win prizes, and become a legend.
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
              <ActionButton
                variant="contained"
                className="primary"
                onClick={() => navigate('/register')}
                startIcon={<PlayCircleOutline />}
              >
                Get Started
              </ActionButton>
              <ActionButton
                variant="outlined"
                className="secondary"
                onClick={() => navigate('/login')}
              >
                Sign In
              </ActionButton>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: '1fr 1fr 1fr',
                },
                gap: 4,
                width: '100%',
                mt: 8,
              }}
            >
              {features.map((feature, index) => (
                <FeatureCard key={index}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {feature.description}
                  </Typography>
                </FeatureCard>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </HeroSection>
  );
};

export default LandingPage;
