import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  SportsEsports as GameIcon,
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  Group as TeamIcon,
  MonetizationOn as PrizeIcon,
} from '@mui/icons-material';
import { db, doc, getDoc } from '../../firebase';
import { useSelector } from 'react-redux';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const tournamentRef = doc(db, 'tournaments', id);
        const tournamentDoc = await getDoc(tournamentRef);
        
        if (!tournamentDoc.exists()) {
          setError('Tournament not found');
          return;
        }

        setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() });
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setError('Error loading tournament details');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date.seconds * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/tournaments')}
          sx={{ mt: 2 }}
        >
          Back to Tournaments
        </Button>
      </Container>
    );
  }

  if (!tournament) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" gutterBottom>
                {tournament.name}
              </Typography>
              <Chip
                label={tournament.status}
                color={
                  tournament.status === 'upcoming'
                    ? 'warning'
                    : tournament.status === 'live'
                    ? 'success'
                    : 'error'
                }
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Tournament Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <GameIcon color="primary" />
                  <Typography>
                    Game: {tournament.gameType}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TimeIcon color="primary" />
                  <Typography>
                    Start Date: {formatDate(tournament.startDate)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PrizeIcon color="primary" />
                  <Typography>
                    Prize Pool: ₹{tournament.prizePool}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TeamIcon color="primary" />
                  <Typography>
                    Players: {tournament.participants?.length || 0}/{tournament.maxParticipants}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Tournament Rules
            </Typography>
            <Typography variant="body1" paragraph>
              {tournament.rules || 'No rules specified'}
            </Typography>

            {tournament.description && (
              <>
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {tournament.description}
                </Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Prize Distribution
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'gold' }}>
                      <TrophyIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="1st Place" secondary={`₹${tournament.prizePool * 0.5}`} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'silver' }}>
                      <TrophyIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="2nd Place" secondary={`₹${tournament.prizePool * 0.3}`} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#cd7f32' }}>
                      <TrophyIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="3rd Place" secondary={`₹${tournament.prizePool * 0.2}`} />
                </ListItem>
              </List>
            </Paper>

            {tournament.status === 'upcoming' && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={tournament.participants?.includes(user?.uid)}
                onClick={() => navigate(`/tournaments?register=${tournament.id}`)}
              >
                {tournament.participants?.includes(user?.uid)
                  ? 'Already Registered'
                  : 'Register Now'}
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate('/tournaments')}
      >
        Back to Tournaments
      </Button>
    </Container>
  );
};

export default TournamentDetails;
