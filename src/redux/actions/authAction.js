import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  auth,
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc
} from '../../firebase';

// Action Types
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAIL = 'REGISTER_FAIL';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const LOGOUT = 'LOGOUT';
export const SET_USER = 'SET_USER';
export const UPDATE_PROFILE = 'UPDATE_PROFILE';

// Register user
export const register = (email, password, username) => async (dispatch) => {
  try {
    dispatch({ type: REGISTER_REQUEST });

    // Create user in Firebase Auth
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with username
    await updateProfile(user, {
      displayName: username,
    });

    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      username: username,
      displayName: username,
      role: 'user', // Default role
      createdAt: new Date().toISOString(),
      photoURL: null,
      active: true,
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: userData,
    });

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));

    return userData;
  } catch (error) {
    let errorMessage = 'Registration failed. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters.';
        break;
      default:
        errorMessage = error.message;
    }

    dispatch({
      type: REGISTER_FAIL,
      payload: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

// Login user
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    // Sign in with Firebase Auth
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data() || {};

    const userWithRole = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: userData.role || 'user',
      ...userData,
    };

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userWithRole));

    dispatch({
      type: LOGIN_SUCCESS,
      payload: userWithRole,
    });

  } catch (error) {
    let errorMessage = 'Login failed. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Invalid password.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      default:
        errorMessage = error.message;
    }

    dispatch({
      type: LOGIN_FAIL,
      payload: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

// Logout user
export const logout = () => async (dispatch) => {
  try {
    await signOut(auth);
    localStorage.removeItem('user');
    dispatch({ type: LOGOUT });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Set user from localStorage
export const setUserFromLocalStorage = () => async (dispatch) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    try {
      // Get fresh user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data() || {};
      
      const updatedUser = {
        ...user,
        ...userData,
      };
      
      // Update localStorage with fresh data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      dispatch({
        type: SET_USER,
        payload: updatedUser,
      });
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Still dispatch the stored user data if refresh fails
      dispatch({
        type: SET_USER,
        payload: user,
      });
    }
  }
};

// Google Sign In
export const signInWithGoogle = () => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const { user } = await signInWithPopup(auth, provider);

    // Create/update user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData) {
      const userData = {
        uid: user.uid,
        email: user.email,
        username: user.email.split('@')[0],
        displayName: user.displayName,
        role: 'user',
        createdAt: new Date().toISOString(),
        photoURL: user.photoURL,
        active: true,
      };

      await setDoc(userRef, userData);
    }

    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: userData?.role || 'user',
        ...userData,
      },
    });

    return user;
  } catch (error) {
    dispatch({
      type: LOGIN_FAIL,
      payload: error.message,
    });
    throw error;
  }
};

// Set user
export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

// Update user profile
export const updateUserProfile = (userData) => ({
  type: UPDATE_PROFILE,
  payload: userData,
});