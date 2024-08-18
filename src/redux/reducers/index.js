// src/redux/reducers/index.js

import { combineReducers } from 'redux';
import authReducer from './authReducer';
import tournamentReducer from './tournamentReducer';
import walletReducer from './walletReducer';
import transactionsReducer from '../slices/transactionSlice'; // Update path here

export default combineReducers({
  auth: authReducer,
  tournament: tournamentReducer,
  wallet: walletReducer,
  transactions: transactionsReducer
});
