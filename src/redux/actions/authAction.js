import { auth, firestore } from '../../firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { setDoc, doc, updateDoc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';

// Admin UID
const ADMIN_UID = 'r7yLC41g4tMQqUCd5y4Rjls6Pch2';

// Action for user login
export const login = (email, password) => async (dispatch) => {
  dispatch({ type: 'LOGIN_REQUEST' }); 
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const isAdmin = user.uid === ADMIN_UID;

    const userPurchasesRef = doc(firestore, 'userPurchases', user.uid);
    const userPurchasesDoc = await getDoc(userPurchasesRef);

    let purchasedGames = [];
    if (userPurchasesDoc.exists()) {
      purchasedGames = userPurchasesDoc.data().purchases || [];
    } else {
      await setDoc(userPurchasesRef, { purchases: [] });
    }

    const userData = { ...user, isAdmin };
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userData, purchasedGames } });
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('lastActivity', new Date().toString());
  } catch (error) {
    dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
    console.error('Login failed:', error.message);
  }
};

// Action for user signup
export const signup = (userData) => async (dispatch) => {
  dispatch({ type: 'SIGNUP_REQUEST' });
  try {
    const { email, password, name, age, bio = '', username = '' } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const isAdmin = user.uid === ADMIN_UID;

    await setDoc(doc(firestore, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name,
      age,
      bio,
      username,
      isAdmin
    });

    await setDoc(doc(firestore, 'userPurchases', user.uid), { purchases: [] });

    const userDataWithInfo = { ...user, name, age, bio, username, isAdmin };

    dispatch({ type: 'SIGNUP_SUCCESS', payload: userDataWithInfo });

    localStorage.setItem('user', JSON.stringify(userDataWithInfo));
    localStorage.setItem('lastActivity', new Date().toString());
  } catch (error) {
    dispatch({ type: 'SIGNUP_FAILURE', payload: error.message });
    console.error('Signup failed:', error.message);
  }
};

// Action for user logout
export const logout = () => async (dispatch) => {
  dispatch({ type: 'LOGOUT_REQUEST' });
  try {
    await signOut(auth);
    dispatch({ type: 'LOGOUT_SUCCESS' });
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
  } catch (error) {
    dispatch({ type: 'LOGOUT_FAILURE', payload: error.message });
    console.error('Logout failed:', error.message);
  }
};

// Action for updating user profile
export const updateUser = (uid, userData) => async (dispatch) => {
  dispatch({ type: 'UPDATE_USER_REQUEST' });
  try {
    const { name, age, bio = '', profileImage, gameUids = [], username = '' } = userData;

    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, { displayName: name, photoURL: profileImage });
    }

    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, { name, age, bio, profileImage, gameUids, username });

    dispatch({ type: 'UPDATE_USER_SUCCESS', payload: { uid, name, age, bio, profileImage, gameUids, username } });
  } catch (error) {
    dispatch({ type: 'UPDATE_USER_FAILURE', payload: error.message });
    console.error('Profile update failed:', error.message);
  }
};

// Action to set user from local storage
export const setUser = (user) => ({
  type: 'SET_USER',
  payload: user,
});

// Action to purchase a game
export const purchaseGame = (gameName) => async (dispatch, getState) => {
  dispatch({ type: 'PURCHASE_GAME_REQUEST' });
  try {
    const state = getState();
    const user = state.auth.user;

    if (!user) throw new Error('User not logged in');

    const userPurchasesRef = doc(firestore, 'userPurchases', user.uid);
    const userPurchasesDoc = await getDoc(userPurchasesRef);
    const currentPurchases = userPurchasesDoc.exists() ? userPurchasesDoc.data().purchases || [] : [];

    if (currentPurchases.includes(gameName)) {
      throw new Error('Game already purchased');
    }

    await updateGameParticipants(gameName);

    await updateDoc(userPurchasesRef, {
      purchases: [...currentPurchases, gameName]
    });

    dispatch({ type: 'PURCHASE_GAME_SUCCESS', payload: { gameName } });
  } catch (error) {
    dispatch({ type: 'PURCHASE_GAME_FAILURE', payload: error.message });
    console.error('Game purchase failed:', error.message);
  }
};

// Function to update game participants
const updateGameParticipants = async (gameName) => {
  const gameRef = doc(firestore, 'games', gameName);
  const gameDoc = await getDoc(gameRef);
  
  if (gameDoc.exists()) {
    const gameData = gameDoc.data();
    const updatedParticipants = gameData.participants - 1;
    
    if (updatedParticipants >= 0) {
      await updateDoc(gameRef, { participants: updatedParticipants });
    } else {
      throw new Error('No participants left for this game');
    }
  } else {
    throw new Error('Game not found');
  }
};

// Action to purchase a tournament
export const purchaseTournament = (tournamentId) => async (dispatch, getState) => {
  dispatch({ type: 'PURCHASE_TOURNAMENT_REQUEST' });
  try {
    const state = getState();
    const user = state.auth.user;

    if (!user) throw new Error('User not logged in');

    // Perform tournament purchase logic here

    dispatch({ type: 'PURCHASE_TOURNAMENT_SUCCESS', payload: tournamentId });
  } catch (error) {
    dispatch({ type: 'PURCHASE_TOURNAMENT_FAILURE', payload: error.message });
    console.error('Tournament purchase failed:', error.message);
  }
};

// Action to check username availability
export const checkUsernameAvailability = (username) => async () => {
  try {
    const q = query(collection(firestore, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Username already exists
      return false;
    } else {
      // Username is available
      return true;
    }
  } catch (error) {
    console.error('Error checking username availability:', error.message);
    return false;
  }
};
