import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWallet, updateWallet, fetchWalletTransactions, approveTransaction, rejectTransaction } from '../../redux/actions/walletAction';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '../../firebase';
import QRCode from 'qrcode.react';
import Modal from 'react-modal';
import './Wallet.css';

const Wallet = () => {
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('deposit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [phoneOrUpiId, setPhoneOrUpiId] = useState('prashants1704@okicici');
  const [showModal, setShowModal] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(''); // Track the status of the transaction

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const wallet = useSelector((state) => state.wallet);

  useEffect(() => {
    if (user) {
      dispatch(fetchWallet(user.uid));
      dispatch(fetchWalletTransactions(user.uid));
    }
  }, [user, dispatch]);

  const generateQRCode = () => {
    if (action === 'deposit') {
      const upiLink = `upi://pay?pa=${phoneOrUpiId}&pn=MerchantName&mc=0000&tid=1234567890&mt=999&am=${amount}&cu=INR&url=https://your-website.com`;
      return upiLink;
    }
    return '';
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!user || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transactionAmount = parseFloat(amount);
      if (isNaN(transactionAmount)) {
        throw new Error('Invalid amount');
      }

      const currentBalance = parseFloat(wallet.balance) || 0;
      const newBalance =
        action === 'deposit'
          ? currentBalance + transactionAmount
          : currentBalance - transactionAmount;

      if (action === 'withdrawal' && newBalance < 0) {
        throw new Error('Insufficient funds');
      }

      const transactionId = await addPendingTransactionToDatabase(transactionAmount);

      if (action === 'deposit') {
        setShowQRCode(true);
      }

      await notifyAdminForApproval(transactionAmount, action, transactionId);

      setTransactionStatus('pending');
      setShowModal(true);
    } catch (error) {
      console.error('Error handling transaction:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addPendingTransactionToDatabase = async (transactionAmount) => {
    const walletRef = doc(firestore, 'wallets', user.uid);
    const walletDoc = await getDoc(walletRef);

    const transaction = {
      amount: transactionAmount,
      type: action,
      date: new Date(),
      details: action === 'deposit' ? 'Pending Deposit Approval' : 'Pending Withdrawal Approval',
      status: 'pending',
      phoneOrUpiId: action === 'withdrawal' ? phoneOrUpiId : ''
    };

    const transactionId = new Date().getTime().toString(); // Generate a unique transaction ID

    if (walletDoc.exists()) {
      await updateDoc(walletRef, {
        transactions: arrayUnion({ id: transactionId, ...transaction })
      });
    } else {
      await setDoc(walletRef, {
        balance: wallet.balance || 0,
        transactions: [{ id: transactionId, ...transaction }]
      });
    }

    return transactionId;
  };

  const notifyAdminForApproval = async (transactionAmount, transactionType, transactionId) => {
    try {
      const adminRef = doc(firestore, 'notifications', 'admin');
      const adminDoc = await getDoc(adminRef);

      const notification = {
        userId: user.uid,
        amount: transactionAmount,
        type: transactionType,
        date: new Date(),
        status: 'pending',
        message: `User ${user.uid} has requested a ${transactionType} of ₹${transactionAmount}.`,
        transactionId: transactionId
      };

      if (adminDoc.exists()) {
        await updateDoc(adminRef, {
          requests: arrayUnion(notification)
        });
      } else {
        await setDoc(adminRef, {
          requests: [notification]
        });
      }
    } catch (error) {
      console.error('Error notifying admin:', error);
    }
  };

  const approveTransactionHandler = async (transactionId) => {
    setLoading(true);
    try {
      const walletRef = doc(firestore, 'wallets', user.uid);
      const walletDoc = await getDoc(walletRef);

      const transactionData = walletDoc.data().transactions.find(t => t.id === transactionId);
      if (transactionData) {
        const currentBalance = parseFloat(walletDoc.data().balance) || 0;
        const newBalance = transactionData.type === 'deposit'
          ? currentBalance + transactionData.amount
          : currentBalance - transactionData.amount;

        await updateDoc(walletRef, {
          balance: newBalance,
          transactions: arrayUnion({
            ...transactionData,
            status: 'approved'
          })
        });

        dispatch(updateWallet(user.uid, newBalance)); // Update wallet in Redux
      }

      setTransactionStatus('approved');
    } catch (error) {
      console.error('Error approving transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const rejectTransactionHandler = async (transactionId) => {
    setLoading(true);
    try {
      const walletRef = doc(firestore, 'wallets', user.uid);
      const walletDoc = await getDoc(walletRef);

      const transactionData = walletDoc.data().transactions.find(t => t.id === transactionId);
      if (transactionData) {
        await updateDoc(walletRef, {
          transactions: arrayUnion({
            ...transactionData,
            status: 'rejected'
          })
        });
      }

      setTransactionStatus('rejected');
    } catch (error) {
      console.error('Error rejecting transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (transactionStatus === 'approved') {
      dispatch(fetchWallet(user.uid)); // Refresh wallet balance
    }
  };

  const qrCodeData = generateQRCode();

  return (
    <div className="wallet-container">
      <h2>Wallet</h2>
      <p>Current Balance: ₹{wallet.balance}</p>

      <form onSubmit={handleTransaction}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
        {action === 'withdrawal' && (
          <input
            type="text"
            value={phoneOrUpiId}
            onChange={(e) => setPhoneOrUpiId(e.target.value)}
            placeholder="Enter UPI ID or Phone Number"
          />
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {showQRCode && (
        <div className="qr-code-container">
          <h3>Scan QR Code to Complete Deposit</h3>
          <QRCode value={qrCodeData} />
        </div>
      )}

      <Modal isOpen={showModal} onRequestClose={closeModal} contentLabel="Transaction Modal">
        <h2>Transaction {transactionStatus === 'approved' ? 'Approved' : transactionStatus === 'rejected' ? 'Rejected' : 'Pending'}</h2>
        <p>Your transaction is {transactionStatus === 'pending' ? 'pending admin approval.' : transactionStatus === 'approved' ? 'approved.' : 'rejected.'}</p>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default Wallet;
