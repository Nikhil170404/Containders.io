import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWalletTransactions, approveTransaction, rejectTransaction } from '../../redux/actions/walletAction';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import './AdminTransactions.css';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && user.isAdmin) {
      dispatch(fetchWalletTransactions())
        .then((transactions) => setTransactions(transactions));
    }
  }, [user, dispatch]);

  const handleApprove = async (transactionId) => {
    try {
      await dispatch(approveTransaction(transactionId));
      setTransactions((prev) => prev.filter(t => t.id !== transactionId));
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
  };

  const handleReject = async (transactionId) => {
    try {
      await dispatch(rejectTransaction(transactionId));
      setTransactions((prev) => prev.filter(t => t.id !== transactionId));
    } catch (error) {
      console.error('Error rejecting transaction:', error);
    }
  };

  return (
    <div className="admin-transactions">
      <h2>Manage Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>User ID</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.id}</td>
              <td>{transaction.userId}</td>
              <td>₹{transaction.amount}</td>
              <td>{transaction.type}</td>
              <td>{transaction.status}</td>
              <td>
                {transaction.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(transaction.id)}>Approve</button>
                    <button onClick={() => handleReject(transaction.id)}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTransactions;
