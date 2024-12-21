import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Box,
  useTheme,
  useMediaQuery,
  Skeleton,
  IconButton,
  Chip,
  Tooltip,
  Divider,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  Group as ParticipantsIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch, increment, arrayUnion, getDoc } from '../../firebase';

const TournamentManagement = () => {
  const theme = useTheme();
  // eslint-disable-next-line no-unused-vars
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // eslint-disable-next-line no-unused-vars
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    prizePool: 0,
    maxParticipants: 0,
    gameType: '',
    entryFee: 0,
    type: 'free',
    registrationDeadline: '',
  });
  const [dialogState, setDialogState] = useState({ open: false, title: '', content: null, actions: null });
  const [winners, setWinners] = useState({ first: '', second: '', third: '' });

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'tournaments'));
      const tournamentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching tournaments',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const handleOpenDialog = (tournament = null) => {
    if (tournament) {
      setEditMode(true);
      setSelectedTournament(tournament);
      setFormData(tournament);
    } else {
      setEditMode(false);
      setSelectedTournament(null);
      setFormData({
        name: '',
        description: '',
        date: '',
        prizePool: 0,
        maxParticipants: 0,
        gameType: '',
        entryFee: 0,
        type: 'free',
        registrationDeadline: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedTournament(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && selectedTournament) {
        await updateDoc(doc(db, 'tournaments', selectedTournament.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'tournaments'), {
          ...formData,
          status: 'upcoming',
          participants: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      handleCloseDialog();
      fetchTournaments();
      setSnackbar({
        open: true,
        message: `Tournament ${editMode ? 'updated' : 'created'} successfully`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving tournament:', error);
      setSnackbar({
        open: true,
        message: `Error ${editMode ? 'updating' : 'creating'} tournament`,
        severity: 'error',
      });
    }
  };

  const handleDelete = async (tournamentId) => {
    try {
      await deleteDoc(doc(db, 'tournaments', tournamentId));
      fetchTournaments();
      setSnackbar({
        open: true,
        message: 'Tournament deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting tournament:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting tournament',
        severity: 'error',
      });
    }
  };

  const distributePrizes = async (tournament, winners) => {
    try {
      const batch = writeBatch(db);
      const tournamentRef = doc(db, 'tournaments', tournament.id);
      
      // Calculate prize distribution
      const prizeMoney = tournament.prizePool;
      const prizeDistribution = {
        first: prizeMoney * 0.5,    // 50% for first place
        second: prizeMoney * 0.3,   // 30% for second place
        third: prizeMoney * 0.2,    // 20% for third place
      };

      // Update tournament status
      batch.update(tournamentRef, {
        status: 'completed',
        winners: winners,
        prizeDistributed: true,
        completedAt: serverTimestamp(),
      });

      // Distribute prizes to winners
      for (const [place, userId] of Object.entries(winners)) {
        if (!userId) continue;

        const prizeAmount = prizeDistribution[place];
        if (!prizeAmount) continue;

        // Update user's wallet
        const walletRef = doc(db, 'wallets', userId);
        const walletSnapshot = await getDoc(walletRef);
        
        if (!walletSnapshot.exists()) {
          // Create wallet if it doesn't exist
          batch.set(walletRef, {
            balance: prizeAmount,
            lastUpdated: serverTimestamp(),
            transactions: [{
              amount: prizeAmount,
              type: 'prize',
              status: 'completed',
              date: serverTimestamp(),
              details: `Prize money for ${place} place in ${tournament.name}`,
              tournamentId: tournament.id,
            }],
          });
        } else {
          // Update existing wallet
          batch.update(walletRef, {
            balance: increment(prizeAmount),
            lastUpdated: serverTimestamp(),
            transactions: arrayUnion({
              amount: prizeAmount,
              type: 'prize',
              status: 'completed',
              date: serverTimestamp(),
              details: `Prize money for ${place} place in ${tournament.name}`,
              tournamentId: tournament.id,
            }),
          });
        }

        // Create transaction record
        const transactionRef = doc(collection(db, 'transactions'));
        batch.set(transactionRef, {
          userId: userId,
          amount: prizeAmount,
          type: 'prize',
          status: 'completed',
          date: serverTimestamp(),
          details: `Prize money for ${place} place in ${tournament.name}`,
          tournamentId: tournament.id,
          category: 'tournament_prize',
        });
      }

      // Commit all changes
      await batch.commit();

      // Refresh tournaments list
      fetchTournaments();

      setSnackbar({
        open: true,
        message: 'Prize money distributed successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error distributing prizes:', error);
      setSnackbar({
        open: true,
        message: 'Error distributing prize money',
        severity: 'error',
      });
    }
  };

  const handleDistributePrizes = async (tournament) => {
    setDialogState({
      open: true,
      title: 'Distribute Prize Money',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Tournament: {tournament.name}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                <Typography variant="subtitle1" gutterBottom>
                  Prize Pool Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">
                    Total Prize Pool: <strong>₹{tournament.prizePool}</strong>
                  </Typography>
                  <Typography variant="body2" color="primary">
                    First Place: ₹{tournament.prizePool * 0.5}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Second Place: ₹{tournament.prizePool * 0.3}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Third Place: ₹{tournament.prizePool * 0.2}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                <Typography variant="subtitle1" gutterBottom>
                  Winner Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="First Place Winner (User ID)"
                    name="first"
                    value={winners.first}
                    onChange={(e) => setWinners({ ...winners, first: e.target.value })}
                    required
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Second Place Winner (User ID)"
                    name="second"
                    value={winners.second}
                    onChange={(e) => setWinners({ ...winners, second: e.target.value })}
                    required
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Third Place Winner (User ID)"
                    name="third"
                    value={winners.third}
                    onChange={(e) => setWinners({ ...winners, third: e.target.value })}
                    required
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      ),
      actions: (
        <>
          <Button onClick={() => setDialogState({ ...dialogState, open: false })}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              distributePrizes(tournament, winners);
              setDialogState({ ...dialogState, open: false });
            }}
            color="primary"
            variant="contained"
            disabled={!winners.first || !winners.second || !winners.third}
          >
            Distribute Prizes
          </Button>
        </>
      ),
    });
  };

  const renderTournamentCard = (tournament) => (
    <Grid item xs={12} sm={6} md={4} key={tournament.id}>
      <Card 
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="div" gutterBottom>
              {tournament.name}
            </Typography>
            <Chip
              label={tournament.status}
              color={
                tournament.status === 'upcoming' ? 'primary' :
                tournament.status === 'completed' ? 'success' :
                'default'
              }
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {tournament.description}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon color="action" fontSize="small" />
              <Typography variant="body2">
                {new Date(tournament.date).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon color="action" fontSize="small" />
              <Typography variant="body2">
                Prize Pool: ₹{tournament.prizePool}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ParticipantsIcon color="action" fontSize="small" />
              <Typography variant="body2">
                {tournament.participants?.length || 0}/{tournament.maxParticipants} Participants
              </Typography>
            </Box>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(tournament)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDelete(tournament.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          {tournament.status === 'completed' && !tournament.prizeDistributed && (
            <Tooltip title="Distribute Prizes">
              <IconButton
                size="small"
                onClick={() => handleDistributePrizes(tournament)}
                color="primary"
              >
                <TrophyIcon />
              </IconButton>
            </Tooltip>
          )}
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Tournament Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Tournament
        </Button>
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          ))
        ) : tournaments.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No tournaments found
              </Typography>
            </Paper>
          </Grid>
        ) : (
          tournaments.map(tournament => renderTournamentCard(tournament))
        )}
      </Grid>

      {/* Tournament Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editMode ? 'Edit Tournament' : 'Create Tournament'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tournament Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Tournament Date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Registration Deadline"
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Prize Pool"
                  value={formData.prizePool}
                  onChange={(e) => setFormData({ ...formData, prizePool: Number(e.target.value) })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Participants"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Game Type"
                  value={formData.gameType}
                  onChange={(e) => setFormData({ ...formData, gameType: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Entry Fee"
                  value={formData.entryFee}
                  onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Tournament Type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <MenuItem value="free">Free</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Prize Distribution Dialog */}
      <Dialog 
        open={dialogState.open} 
        onClose={() => setDialogState({ ...dialogState, open: false })} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>{dialogState.title}</DialogTitle>
        <DialogContent dividers>
          {dialogState.content}
        </DialogContent>
        <DialogActions>
          {dialogState.actions}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TournamentManagement;
