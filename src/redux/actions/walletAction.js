import { firestore } from '../../firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

// Action Types
export const FETCH_WALLET_REQUEST = 'FETCH_WALLET_REQUEST';
export const FETCH_WALLET_SUCCESS = 'FETCH_WALLET_SUCCESS';
export const FETCH_WALLET_FAILURE = 'FETCH_WALLET_FAILURE';
export const UPDATE_WALLET_REQUEST = 'UPDATE_WALLET_REQUEST';
export const UPDATE_WALLET_SUCCESS = 'UPDATE_WALLET_SUCCESS';
export const UPDATE_WALLET_FAILURE = 'UPDATE_WALLET_FAILURE';
export const FETCH_WALLET_TRANSACTIONS_REQUEST = 'FETCH_WALLET_TRANSACTIONS_REQUEST';
export const FETCH_WALLET_TRANSACTIONS_SUCCESS = 'FETCH_WALLET_TRANSACTIONS_SUCCESS';
export const FETCH_WALLET_TRANSACTIONS_FAILURE = 'FETCH_WALLET_TRANSACTIONS_FAILURE';
export const APPROVE_TRANSACTION_SUCCESS = 'APPROVE_TRANSACTION_SUCCESS';
export const REJECT_TRANSACTION_SUCCESS = 'REJECT_TRANSACTION_SUCCESS';
export const UPDATE_NOTIFICATION_SUCCESS = 'UPDATE_NOTIFICATION_SUCCESS';
export const UPDATE_NOTIFICATION_ERROR = 'UPDATE_NOTIFICATION_ERROR';

// Constants for Firestore Collection Paths
const COLLECTION_PATHS = {
  WALLETS: 'wallets',
  WALLET_TRANSACTIONS: 'wallet_transactions',
  NOTIFICATIONS: 'notifications'
};

// Action Creators
export const fetchWallet = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_WALLET_REQUEST });

  try {
    const user = getState().auth.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const walletRef = doc(firestore, COLLECTION_PATHS.WALLETS, user.uid);
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists()) {
      throw new Error('Wallet not found');
    }

    dispatch({ type: FETCH_WALLET_SUCCESS, payload: walletSnap.data() });
  } catch (error) {
    dispatch({ type: FETCH_WALLET_FAILURE, payload: error.message });
  }
};

export const updateWallet = (updates) => async (dispatch, getState) => {
  dispatch({ type: UPDATE_WALLET_REQUEST });

  try {
    const user = getState().auth.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const walletRef = doc(firestore, COLLECTION_PATHS.WALLETS, user.uid);
    await updateDoc(walletRef, updates);

    dispatch({ type: UPDATE_WALLET_SUCCESS });
    dispatch(fetchWallet()); // Refresh wallet data
  } catch (error) {
    dispatch({ type: UPDATE_WALLET_FAILURE, payload: error.message });
  }
};

export const fetchWalletTransactions = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_WALLET_TRANSACTIONS_REQUEST });

  try {
    const user = getState().auth.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const transactionsRef = collection(firestore, COLLECTION_PATHS.WALLET_TRANSACTIONS);
    const transactionsSnap = await getDocs(transactionsRef);

    const transactions = transactionsSnap.docs.map(doc => doc.data());

    dispatch({ type: FETCH_WALLET_TRANSACTIONS_SUCCESS, payload: transactions });
  } catch (error) {
    dispatch({ type: FETCH_WALLET_TRANSACTIONS_FAILURE, payload: error.message });
  }
};

export const approveTransaction = (transactionId) => async (dispatch) => {
  try {
    // Update transaction status to approved
    const transactionRef = doc(firestore, COLLECTION_PATHS.WALLET_TRANSACTIONS, transactionId);
    await updateDoc(transactionRef, { status: 'approved' });

    dispatch({ type: APPROVE_TRANSACTION_SUCCESS });
  } catch (error) {
    console.error('Error approving transaction:', error);
  }
};

export const rejectTransaction = (transactionId) => async (dispatch) => {
  try {
    // Update transaction status to rejected
    const transactionRef = doc(firestore, COLLECTION_PATHS.WALLET_TRANSACTIONS, transactionId);
    await updateDoc(transactionRef, { status: 'rejected' });

    dispatch({ type: REJECT_TRANSACTION_SUCCESS });
  } catch (error) {
    console.error('Error rejecting transaction:', error);
  }
};

export const updateNotification = (notificationId, update) => async (dispatch) => {
  try {
    const notificationRef = doc(firestore, COLLECTION_PATHS.NOTIFICATIONS, notificationId);
    await updateDoc(notificationRef, update);

    dispatch({ type: UPDATE_NOTIFICATION_SUCCESS });
  } catch (error) {
    dispatch({ type: UPDATE_NOTIFICATION_ERROR, payload: error.message });
  }
};
