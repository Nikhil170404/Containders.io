import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { joinTournament } from '../../redux/actions/tournamentActions';
import { fetchWallet, updateWallet } from '../../redux/actions/walletAction';
import { firestore } from '../../firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import './TournamentCard.css';

const TournamentCard = ({
  id,
  title,
  description,
  entryFee,
  prizePool,
  mapName,
  participants,
  imageUrl,
  roomId,
  roomPassword,
  tournamentType,
  isJoined = false,
  username,
  userId
}) => {
  const [state, setState] = useState({
    showDetails: false,
    showCredentials: false,
    full: participants === 0,
    showPaymentPrompt: false,
    showJoinForm: false,
    gameUid: '',
    gameUsername: '',
    mapDownloaded: false,
    confirmationMessage: ''
  });

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);

  const fetchTournamentData = useCallback(() => {
    const tournamentRef = doc(firestore, 'tournaments', id);

    const unsubscribe = onSnapshot(tournamentRef, (docSnapshot) => {
      const tournamentData = docSnapshot.data();
      if (tournamentData) {
        setState((prevState) => ({
          ...prevState,
          participants: tournamentData.participants,
          full: tournamentData.participants === 0 || (tournamentData.participants !== -1 && tournamentData.participants <= 0),
          showCredentials: isJoined && tournamentData.roomId && tournamentData.roomPassword
        }));
      } else {
        console.error("No such tournament!");
      }
    });

    return unsubscribe;
  }, [id, isJoined]);

  useEffect(() => {
    const unsubscribe = fetchTournamentData();
    return () => unsubscribe();
  }, [fetchTournamentData]);

  useEffect(() => {
    if (user) {
      dispatch(fetchWallet());
    }
  }, [dispatch, user]);

  const handlePayment = useCallback(async () => {
    if (user && balance !== undefined) {
      if (balance < entryFee) {
        console.warn("Insufficient funds. Please add funds to your wallet.");
        setState((prevState) => ({ ...prevState, showPaymentPrompt: true }));
        return false;
      }
      return true;
    } else {
      console.error("Error fetching wallet or user data.");
      setState((prevState) => ({ ...prevState, showPaymentPrompt: true }));
      return false;
    }
  }, [user, balance, entryFee]);

  const updateWalletBalance = useCallback(async (amount) => {
    if (user) {
      const userWalletRef = doc(firestore, 'users', user.uid);
      await updateDoc(userWalletRef, {
        balance: increment(-amount)
      });

      dispatch(updateWallet(balance - amount));
    }
  }, [user, balance, dispatch]);

  const handleJoin = useCallback(async () => {
    if (!user) {
      console.error("User is not logged in");
      return;
    }

    if (state.full) {
      console.warn("Tournament is full");
      return;
    }

    const paymentSuccess = await handlePayment();
    if (!paymentSuccess) return;

    setState((prevState) => ({
      ...prevState,
      showJoinForm: true
    }));
  }, [user, state.full, handlePayment]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateWalletBalance(entryFee);

      const tournamentRef = doc(firestore, 'tournaments', id);
      const updateData = {
        participantsData: arrayUnion({
          userId: user.uid,
          username: state.gameUsername,
          tournamentUid: state.gameUid,
          mapDownloaded: state.mapDownloaded
        })
      };

      if (tournamentType !== 'unlimited') {
        updateData.participants = increment(-1); // Decrease the participant count by 1 for limited tournaments
      }

      await updateDoc(tournamentRef, updateData);

      const userTournamentsRef = doc(firestore, 'users', user.uid);
      await updateDoc(userTournamentsRef, {
        joinedTournaments: arrayUnion(id),
        joinHistory: arrayUnion({
          tournamentId: id,
          tournamentName: title,
          entryFee,
          joinDate: new Date()
        })
      });

      // Dispatch action to update the local Redux state
      dispatch(joinTournament(title));

      // Show the credentials after successful join
      setState((prevState) => ({
        ...prevState,
        showDetails: true,
        showCredentials: true,
        confirmationMessage: `Successfully joined the tournament. ₹${entryFee} has been deducted from your wallet.`,
        showJoinForm: false
      }));

      fetchTournamentData();
    } catch (error) {
      console.error("Error joining tournament: ", error);
    }
  };

  const joinButtonText = useMemo(() => {
    if (state.full) {
      return 'Full';
    }
    return isJoined ? (state.showCredentials ? 'Hide Credentials' : 'Show Credentials') : `Join ₹${entryFee}`;
  }, [state.full, isJoined, state.showCredentials, entryFee]);

  const joinButtonClass = useMemo(() => {
    if (state.full) {
      return 'join-button full';
    }
    return isJoined ? 'join-button joined' : 'join-button';
  }, [state.full, isJoined]);

  const handleButtonClick = () => {
    if (isJoined) {
      setState((prevState) => ({ ...prevState, showCredentials: !prevState.showCredentials }));
    } else {
      handleJoin();
    }
  };

  return (
    <div className="tournament-card">
      <div className="tournament-card-header">
        <img src={imageUrl || 'default-image-url.png'} alt={title} className="tournament-card-image" />
        <h3 className="tournament-card-title">{title}</h3>
      </div>
      <div className="tournament-card-content">
        <p className="tournament-card-description">{description}</p>
        <div className="tournament-info">
          <p>Prize Pool: ₹{prizePool}</p>
          <p>Entry Fee: ₹{entryFee}</p>
          <p>Map Name: {mapName}</p>
          <p>Tournament Type: {tournamentType}</p>
          <p>Participants: {participants === -1 ? 'Unlimited' : participants}</p>
        </div>
        <div className="tournament-actions">
          <button
            className={joinButtonClass}
            onClick={handleButtonClick}
            disabled={state.full || (isJoined && state.showCredentials)}
          >
            {joinButtonText}
          </button>
        </div>
        {state.showJoinForm && (
          <form className="join-form" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="gameUid">Game UID:</label>
              <input
                type="text"
                id="gameUid"
                value={state.gameUid}
                onChange={(e) => setState((prevState) => ({ ...prevState, gameUid: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="gameUsername">Game Username:</label>
              <input
                type="text"
                id="gameUsername"
                value={state.gameUsername}
                onChange={(e) => setState((prevState) => ({ ...prevState, gameUsername: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={state.mapDownloaded}
                  onChange={(e) => setState((prevState) => ({ ...prevState, mapDownloaded: e.target.checked }))}
                />
                I have downloaded the map.
              </label>
            </div>
            {!state.mapDownloaded && (
              <p>Please download the map to participate in the tournament.</p>
            )}
            <button type="submit" className="submit-button">Submit</button>
          </form>
        )}
        {state.showDetails && (
          <div className="tournament-details">
            <h4>Details:</h4>
            <p><strong>Room ID:</strong> {roomId}</p>
            <p><strong>Room Password:</strong> {roomPassword}</p>
          </div>
        )}
        {state.showPaymentPrompt && (
          <div className="payment-prompt">
            <p>Your balance is insufficient to join this tournament. Please add funds to your wallet.</p>
          </div>
        )}
        {state.confirmationMessage && (
          <div className="confirmation-message">
            <p>{state.confirmationMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

TournamentCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  entryFee: PropTypes.number.isRequired,
  prizePool: PropTypes.number.isRequired,
  mapName: PropTypes.string.isRequired,
  participants: PropTypes.number.isRequired,
  imageUrl: PropTypes.string,
  roomId: PropTypes.string,
  roomPassword: PropTypes.string,
  tournamentType: PropTypes.string.isRequired,
  isJoined: PropTypes.bool,
  username: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired
};

export default TournamentCard;
