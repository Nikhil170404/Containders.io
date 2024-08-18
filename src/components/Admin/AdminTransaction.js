import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore'; // Import getDoc here
import { firestore } from '../../firebase';
import './AdminTransaction.css';

const AdminTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsCollection = collection(firestore, 'pendingTransactions');
        const transactionDocs = await getDocs(transactionsCollection);
        let allTransactions = [];

        transactionDocs.forEach((txnDoc) => {
          const txnData = txnDoc.data();
          allTransactions.push({
            id: txnDoc.id,
            ...txnData
          });
        });

        setTransactions(allTransactions);
        setFilteredTransactions(allTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleStatusChange = async (transactionId, newStatus) => {
    try {
      const pendingTransactionDoc = doc(firestore, 'pendingTransactions', transactionId);
      const txnData = (await getDoc(pendingTransactionDoc)).data();
      const walletRef = doc(firestore, 'users', txnData.userId);

      if (newStatus === 'completed' && txnData.type === 'Deposit') {
        await updateDoc(walletRef, {
          balance: firestore.FieldValue.increment(txnData.amount)
        });
      } else if (newStatus === 'completed' && txnData.type === 'Withdrawal') {
        await updateDoc(walletRef, {
          balance: firestore.FieldValue.increment(-txnData.amount)
        });
      }

      await updateDoc(pendingTransactionDoc, { status: newStatus });
      setTransactions(prevTransactions => prevTransactions.filter(txn => txn.id !== transactionId));
      setFilteredTransactions(prevFiltered => prevFiltered.filter(txn => txn.id !== transactionId));
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    if (e.target.value === 'all') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(txn => txn.status === e.target.value));
    }
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedTransaction(null);
  };

  return (
    <div className="admin-panel">
      <h1>Admin Transaction Panel</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div className="filter-container">
            <label htmlFor="status-filter">Filter by Status:</label>
            <select id="status-filter" value={filterStatus} onChange={handleFilterChange}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="transaction-list">
            <h2>All Transactions</h2>
            <ul>
              {filteredTransactions.map((txn) => (
                <li key={txn.id} className="transaction-item" onClick={() => handleTransactionClick(txn)}>
                  <p><strong>ID:</strong> {txn.id}</p>
                  <p><strong>Username:</strong> {txn.username}</p>
                  <p><strong>Amount:</strong> ₹{txn.amount}</p>
                  <p><strong>Status:</strong> {txn.status}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showDetails && selectedTransaction && (
        <div className="transaction-details">
          <h2>Transaction Details</h2>
          <p><strong>ID:</strong> {selectedTransaction.id}</p>
          <p><strong>Type:</strong> {selectedTransaction.type}</p>
          <p><strong>Amount:</strong> ₹{selectedTransaction.amount}</p>
          <p><strong>Status:</strong> {selectedTransaction.status}</p>
          <p><strong>Transaction ID:</strong> {selectedTransaction.transactionId}</p>
          <button onClick={() => handleStatusChange(selectedTransaction.id, 'completed')}>Approve</button>
          <button onClick={() => handleStatusChange(selectedTransaction.id, 'rejected')}>Reject</button>
          <button onClick={closeDetails}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AdminTransaction;
