import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWallet, updateWallet } from '../../redux/actions/walletAction';
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
  const [transactionId, setTransactionId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [upiId, setUpiId] = useState('prashants1704@okicici'); // Replace with your UPI ID

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const wallet = useSelector((state) => state.wallet);

  useEffect(() => {
    if (user) {
      dispatch(fetchWallet());
    }
  }, [user, dispatch]);

  const generateQRCode = () => {
    if (action === 'deposit') {
      const upiLink = `upi://pay?pa=${upiId}&pn=MerchantName&mc=0000&tid=1234567890&mt=999&am=${amount}&cu=INR&url=https://your-website.com`;
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

      if (action === 'deposit') {
        setShowQRCode(true);
        setShowModal(true);
        return;
      }

      await processTransaction(newBalance, transactionAmount);
    } catch (error) {
      console.error('Error handling transaction:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const processTransaction = async (newBalance, transactionAmount) => {
    const walletRef = doc(firestore, 'wallets', user.uid);
    const walletDoc = await getDoc(walletRef);

    if (walletDoc.exists()) {
      await updateDoc(walletRef, {
        balance: newBalance,
        transactions: arrayUnion({
          amount: transactionAmount,
          type: action,
          date: new Date(),
          details: action === 'deposit' ? 'User Deposit' : 'User Withdrawal'
        })
      });
    } else {
      await setDoc(walletRef, {
        balance: newBalance,
        transactions: [{
          amount: transactionAmount,
          type: action,
          date: new Date(),
          details: action === 'deposit' ? 'User Deposit' : 'User Withdrawal'
        }]
      });
    }

    dispatch(updateWallet(newBalance));
    setAmount('');
  };

  const handleTransactionIdSubmit = async (e) => {
    e.preventDefault();
    setShowModal(false);

    try {
      // Implement admin verification logic here

      await processTransaction(parseFloat(wallet.balance) + parseFloat(amount), parseFloat(amount));
      setTransactionId('');
      alert('Deposit approved and wallet updated.');

      // If rejected
      // alert('Deposit rejected. Refund will be processed.');
    } catch (error) {
      console.error('Error verifying transaction ID:', error);
      alert('Error processing transaction.');
    }
  };

  const formatAmount = (amount) => {
    return !isNaN(amount) ? parseFloat(amount).toFixed(2) : '0.00';
  };

  return (
    <div className="wallet-container">
      <h1>My Wallet</h1>
      <p>Balance: ₹{formatAmount(wallet.balance)}</p>
      <form onSubmit={handleTransaction}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdraw</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Transaction Verification"
      >
        <h2>Transaction Verification</h2>
        {showQRCode && (
          <div>
            <p>Scan this QR code to complete your deposit:</p>
            <QRCode value={generateQRCode()} />
          </div>
        )}
        <form onSubmit={handleTransactionIdSubmit}>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter transaction ID"
          />
          <button type="submit">Submit Transaction ID</button>
        </form>
        <button onClick={() => setShowModal(false)}>Close</button>
      </Modal>
    </div>
  );
};

export default Wallet;
