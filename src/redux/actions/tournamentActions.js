import { 
  FETCH_TOURNAMENTS_REQUEST, FETCH_TOURNAMENTS_SUCCESS, FETCH_TOURNAMENTS_FAILURE,
  ADD_TOURNAMENT_SUCCESS, ADD_TOURNAMENT_FAILURE,
  DELETE_TOURNAMENT_SUCCESS, DELETE_TOURNAMENT_FAILURE,
  UPDATE_TOURNAMENT_SUCCESS, UPDATE_TOURNAMENT_FAILURE
} from './types';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, runTransaction, increment, arrayUnion } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

export const fetchTournaments = () => async (dispatch) => {
  dispatch({ type: FETCH_TOURNAMENTS_REQUEST });
  try {
    const tournamentsCollection = collection(firestore, 'tournaments');
    const tournamentSnapshot = await getDocs(tournamentsCollection);
    const tournamentsList = tournamentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    dispatch({ type: FETCH_TOURNAMENTS_SUCCESS, payload: tournamentsList });
  } catch (error) {
    dispatch({ type: FETCH_TOURNAMENTS_FAILURE, payload: error.message });
  }
};

export const addTournament = (tournament) => async (dispatch) => {
  try {
    const tournamentsCollection = collection(firestore, 'tournaments');
    const docRef = await addDoc(tournamentsCollection, tournament);
    dispatch({ type: ADD_TOURNAMENT_SUCCESS, payload: { id: docRef.id, ...tournament } });
  } catch (error) {
    dispatch({ type: ADD_TOURNAMENT_FAILURE, payload: error.message });
  }
};

export const updateTournament = (tournamentId, updateFields) => async (dispatch) => {
  try {
    const tournamentRef = doc(firestore, 'tournaments', tournamentId);
    await updateDoc(tournamentRef, updateFields);
    dispatch({ type: UPDATE_TOURNAMENT_SUCCESS, payload: { tournamentId, ...updateFields } });
  } catch (error) {
    dispatch({ type: UPDATE_TOURNAMENT_FAILURE, payload: error.message });
  }
};

export const deleteTournament = (id) => async (dispatch) => {
  try {
    const tournamentRef = doc(firestore, 'tournaments', id);
    await deleteDoc(tournamentRef);
    dispatch({ type: DELETE_TOURNAMENT_SUCCESS, payload: id });
  } catch (error) {
    dispatch({ type: DELETE_TOURNAMENT_FAILURE, payload: error.message });
  }
};

export const joinTournament = (tournamentId, entryFee, tournamentName) => async (dispatch) => {
  const user = auth.currentUser; // Ensure user is defined

  try {
    await runTransaction(firestore, async (transaction) => {
      const tournamentRef = doc(firestore, 'tournaments', tournamentId);
      const userRef = doc(firestore, 'users', user.uid);

      const tournamentDoc = await transaction.get(tournamentRef);
      const userDoc = await transaction.get(userRef);

      if (!tournamentDoc.exists() || !userDoc.exists()) {
        throw new Error("Document does not exist!");
      }

      const tournamentData = tournamentDoc.data();
      const userData = userDoc.data();

      if (userData.joinedTournaments && userData.joinedTournaments.includes(tournamentId)) {
        throw new Error("User has already joined this tournament");
      }

      if (tournamentData.participants <= 0) {
        throw new Error("Tournament is full");
      }

      if (entryFee > 0) {
        if (userData.balance < entryFee) {
          throw new Error("Insufficient balance");
        }

        transaction.update(userRef, {
          balance: increment(-entryFee),
          joinedTournaments: arrayUnion(tournamentId),
          joinHistory: arrayUnion({
            tournamentId,
            tournamentName,
            entryFee,
            joinDate: new Date()
          })
        });
      } else {
        transaction.update(userRef, {
          joinedTournaments: arrayUnion(tournamentId),
          joinHistory: arrayUnion({
            tournamentId,
            tournamentName,
            entryFee,
            joinDate: new Date()
          })
        });
      }

      transaction.update(tournamentRef, {
        participants: increment(-1)
      });

      dispatch({ type: 'JOIN_TOURNAMENT_SUCCESS', payload: tournamentId });
    });
  } catch (error) {
    dispatch({ type: 'JOIN_TOURNAMENT_FAILURE', payload: error.message });
  }
};
