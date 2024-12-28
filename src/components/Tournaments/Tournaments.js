import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Box,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { db, doc, collection, query, updateDoc, getDoc, increment, onSnapshot } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Add real-time tournament updates
  useEffect(() => {
    const q = query(collection(db, 'tournaments'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tournamentsData = [];
      snapshot.forEach((doc) => {
        tournamentsData.push({ id: doc.id, ...doc.data() });
      });
      setTournaments(tournamentsData);
    }, (error) => {
      console.error('Error fetching tournaments:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching tournaments',
        severity: 'error',
      });
    });

    return () => unsubscribe();
  }, []);

  const handleRegister = async (tournament) => {
    // Check if user is logged in
    if (!user) {
      setSnackbar({
        open: true,
        message: 'Please login to register for tournaments',
        severity: 'error',
      });
      return;
    }

    setSelectedTournament(tournament);

    // Check if user has already registered
    if (tournament.participants?.includes(user.uid)) {
      setSnackbar({
        open: true,
        message: 'You are already registered for this tournament',
        severity: 'warning',
      });
      return;
    }

    // Get user's game ID from profile
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const gameIds = userData?.gameIds || {};
      const gameType = tournament.gameType?.toLowerCase().replace(/\s+/g, '') || '';
      const savedGameId = gameIds[gameType];

      if (savedGameId) {
        setGameId(savedGameId);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }

    setOpenDialog(true);
  };

  const handleConfirmRegistration = async () => {
    if (!selectedTournament || !user) return;

    setLoading(true);
    try {
      // For paid tournaments, check wallet balance
      if (selectedTournament.type === 'paid') {
        const walletRef = doc(db, 'wallets', user.uid);
        const walletDoc = await getDoc(walletRef);
        
        if (!walletDoc.exists()) {
          throw new Error('Wallet not found. Please add money to your wallet first.');
        }

        const currentBalance = walletDoc.data().balance || 0;
        if (currentBalance < selectedTournament.entryFee) {
          throw new Error(`Insufficient balance. You need ₹${selectedTournament.entryFee} to register.`);
        }

        // Deduct entry fee from wallet
        const newTransaction = {
          amount: selectedTournament.entryFee,
          type: 'tournament_fee',
          status: 'completed',
          date: new Date(),
          details: `Entry fee for ${selectedTournament.name}`,
          tournamentId: selectedTournament.id,
        };

        await updateDoc(walletRef, {
          balance: increment(-selectedTournament.entryFee),
          transactions: [...(walletDoc.data().transactions || []), newTransaction],
        });
      }

      // Update user's game ID if changed
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};
      
      // Map game type to gameIds field
      const gameTypeMap = {
        'bgmi': 'bgmi',
        'freefire': 'freeFire',
        'codmobile': 'codm',
        'valorant': 'valorant'
      };
      
      const gameType = gameTypeMap[selectedTournament.gameType?.toLowerCase().replace(/\s+/g, '')] || '';
      
      if (!gameType) {
        throw new Error('Invalid game type');
      }

      // Update user profile if game ID changed
      if (gameId && gameId !== userData.gameIds?.[gameType]) {
        const updates = {
          ...userData,
          gameIds: {
            ...(userData.gameIds || {}),
            [gameType]: gameId
          },
          updatedAt: new Date()
        };
        await updateDoc(userRef, updates);
      }

      // Register for tournament
      const tournamentRef = doc(db, 'tournaments', selectedTournament.id);
      const participantData = {
        gameId: gameId,
        registeredAt: new Date(),
        name: userData.name || user.email,
        email: user.email,
        userId: user.uid
      };

      await updateDoc(tournamentRef, {
        participants: [...(selectedTournament.participants || []), user.uid],
        [`participantDetails.${user.uid}`]: participantData
      });

      setSnackbar({
        open: true,
        message: 'Successfully registered for tournament',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error registering for tournament:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error registering for tournament',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setOpenDialog(false);
      setGameId('');
      setSelectedTournament(null);
    }
  };

  const handleViewDetails = (tournament) => {
    navigate(`/tournament/${tournament.id}`);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date.seconds * 1000).toLocaleString();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tournaments
      </Typography>
      <Grid container spacing={3}>
        {tournaments.map((tournament) => (
          <Grid item xs={12} sm={6} md={4} key={tournament.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {tournament.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {tournament.gameType}
                </Typography>
                <Typography variant="body2">
                  Prize Pool: ₹{tournament.prizePool}
                </Typography>
                <Typography variant="body2">
                  Entry Fee: {tournament.type === 'free' ? 'Free' : `₹${tournament.entryFee}`}
                </Typography>
                <Typography variant="body2">
                  Date: {formatDate(tournament.startDate)}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`${tournament.participants?.length || 0}/${tournament.maxParticipants} Players`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={tournament.status}
                    color={
                      tournament.status === 'upcoming'
                        ? 'warning'
                        : tournament.status === 'live'
                        ? 'success'
                        : 'error'
                    }
                    size="small"
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleViewDetails(tournament)}
                >
                  View Details
                </Button>
                {tournament.status === 'upcoming' && (
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => handleRegister(tournament)}
                    disabled={loading || tournament.participants?.includes(user?.uid)}
                  >
                    {tournament.participants?.includes(user?.uid)
                      ? 'Registered'
                      : 'Register Now'}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Registration Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Tournament Registration</DialogTitle>
        <DialogContent>
          {selectedTournament?.type === 'paid' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Entry Fee: ₹{selectedTournament?.entryFee}
            </Alert>
          )}
          <TextField
            fullWidth
            label={`${selectedTournament?.gameType} Game ID`}
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            required
            sx={{ mt: 1 }}
            helperText="Enter your in-game player ID"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmRegistration}
            variant="contained"
            disabled={loading || !gameId}
          >
            {loading ? 'Processing...' : 'Confirm Registration'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Tournaments;
