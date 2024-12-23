import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Button,
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import { SportsEsports, EmojiEvents, Group, AccessTime } from '@mui/icons-material';

const TournamentCard = ({
  tournament,
  onJoin,
  isJoined,
  onView,
}) => {
  const {
    title,
    game,
    date,
    prize,
    participants,
    maxParticipants,
    status,
    registeredPlayers = [],
  } = tournament;

  const progress = (participants / maxParticipants) * 100;
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'registering':
        return 'success';
      case 'full':
        return 'error';
      case 'in progress':
        return 'warning';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
          <Chip
            label={status}
            color={getStatusColor(status)}
            size="small"
          />
        </Box>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <SportsEsports fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {game}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AccessTime fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {formatDate(date)}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <EmojiEvents fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Prize Pool: ${prize}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Group fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {participants}/{maxParticipants} Players
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {registeredPlayers.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Registered Players
            </Typography>
            <AvatarGroup max={4}>
              {registeredPlayers.map((player) => (
                <Tooltip key={player.id} title={player.name}>
                  <Avatar src={player.avatar} alt={player.name} />
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
        )}

        <Box display="flex" gap={1}>
          {!isJoined && status.toLowerCase() === 'registering' && (
            <Button
              variant="contained"
              fullWidth
              onClick={() => onJoin(tournament)}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                color: 'white',
              }}
            >
              Join Tournament
            </Button>
          )}
          <Button
            variant={isJoined ? 'contained' : 'outlined'}
            fullWidth
            onClick={() => onView(tournament)}
            sx={
              isJoined
                ? {
                    background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                    color: 'white',
                  }
                : {}
            }
          >
            {isJoined ? 'View Details' : 'Learn More'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

TournamentCard.propTypes = {
  tournament: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    game: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    prize: PropTypes.number.isRequired,
    participants: PropTypes.number.isRequired,
    maxParticipants: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    registeredPlayers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string,
      })
    ),
  }).isRequired,
  onJoin: PropTypes.func.isRequired,
  isJoined: PropTypes.bool.isRequired,
  onView: PropTypes.func.isRequired,
};

export default TournamentCard;
