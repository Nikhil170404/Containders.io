import {
  FETCH_WALLET_REQUEST,
  FETCH_WALLET_SUCCESS,
  FETCH_WALLET_FAILURE,
  UPDATE_WALLET_REQUEST,
  UPDATE_WALLET_SUCCESS,
  UPDATE_WALLET_FAILURE,
  FETCH_WALLET_TRANSACTIONS_REQUEST,
  FETCH_WALLET_TRANSACTIONS_SUCCESS,
  FETCH_WALLET_TRANSACTIONS_FAILURE,
  APPROVE_TRANSACTION_SUCCESS,
  REJECT_TRANSACTION_SUCCESS,
  UPDATE_NOTIFICATION_SUCCESS,
  UPDATE_NOTIFICATION_ERROR
} from '../actions/walletAction';

const initialState = {
  wallet: null,
  transactions: [],
  loading: false,
  error: null
};

const walletReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_WALLET_REQUEST:
    case UPDATE_WALLET_REQUEST:
    case FETCH_WALLET_TRANSACTIONS_REQUEST:
      return {
        ...state,
        loading: true
      };
    case FETCH_WALLET_SUCCESS:
      return {
        ...state,
        wallet: action.payload,
        loading: false
      };
    case UPDATE_WALLET_SUCCESS:
      return {
        ...state,
        loading: false
      };
    case FETCH_WALLET_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        transactions: action.payload,
        loading: false
      };
    case FETCH_WALLET_FAILURE:
    case UPDATE_WALLET_FAILURE:
    case FETCH_WALLET_TRANSACTIONS_FAILURE:
    case UPDATE_NOTIFICATION_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case APPROVE_TRANSACTION_SUCCESS:
    case REJECT_TRANSACTION_SUCCESS:
      return {
        ...state,
        loading: false
      };
    case UPDATE_NOTIFICATION_SUCCESS:
      return {
        ...state,
        loading: false
      };
    default:
      return state;
  }
};

export default walletReducer;
