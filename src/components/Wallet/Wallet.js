import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { AccountBalance, AccountBalanceWallet } from '@mui/icons-material';
import { fetchWallet } from '../../redux/actions/walletAction';
import { db, collection, doc, getDoc, setDoc, serverTimestamp } from '../../firebase';

const bankDetails = {
  accountName: "Your Company Name",
  accountNumber: "1234567890",
  ifscCode: "BANK0123456",
  bankName: "Your Bank Name",
  branch: "Your Branch Name",
  upiId: "yourcompany@upi"
};

const Wallet = () => {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [transactions, setTransactions] = useState([]);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const wallet = useSelector((state) => state.wallet);

  const fetchTransactions = useCallback(async () => {
    try {
      const walletRef = doc(db, 'wallets', user.uid);
      const walletDoc = await getDoc(walletRef);
      
      if (!walletDoc.exists()) {
        // Create wallet document if it doesn't exist
        await setDoc(walletRef, {
          userId: user.uid,
          balance: 0,
          transactions: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setTransactions([]);
      } else {
        const data = walletDoc.data();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching transactions',
        severity: 'error'
      });
    }
  }, [user.uid]);

  useEffect(() => {
    if (user) {
      dispatch(fetchWallet());
      fetchTransactions();
    }
  }, [user, dispatch, fetchTransactions]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAmount('');
    setTransactionId('');
  };

  const handleSubmitRequest = async () => {
    if (!user || amount <= 0 || !transactionId) {
      setSnackbar({
        open: true,
        message: 'Please enter valid amount and transaction ID',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const transactionAmount = parseFloat(amount);
      if (isNaN(transactionAmount)) {
        throw new Error('Invalid amount');
      }

      // Create deposit request
      const depositRequestRef = doc(collection(db, 'depositRequests'));
      await setDoc(depositRequestRef, {
        userId: user.uid,
        userEmail: user.email,
        amount: transactionAmount,
        transactionId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setSnackbar({
        open: true,
        message: 'Deposit request submitted successfully! Admin will verify and add the amount.',
        severity: 'success',
      });

      handleCloseDialog();
      fetchTransactions();
    } catch (error) {
      console.error('Error submitting deposit request:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting deposit request. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return !isNaN(amount) ? parseFloat(amount).toFixed(2) : '0.00';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Balance Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWallet sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <div>
                  <Typography variant="h6">Wallet Balance</Typography>
                  <Typography variant="h4">₹{formatAmount(wallet.balance)}</Typography>
                </div>
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleOpenDialog}
                startIcon={<AccountBalance />}
              >
                Add Money
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Bank Details Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bank Account Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Account Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {bankDetails.accountName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Account Number
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {bankDetails.accountNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    IFSC Code
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {bankDetails.ifscCode}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Bank Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {bankDetails.bankName}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    UPI ID
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {bankDetails.upiId}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Transactions Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transaction History
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>₹{formatAmount(transaction.amount)}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status || 'completed'}
                            color={
                              transaction.status === 'pending'
                                ? 'warning'
                                : transaction.status === 'rejected'
                                ? 'error'
                                : 'success'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.details}</TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Money Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Money to Wallet</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              1. Transfer money to our bank account or UPI
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              2. Enter the amount and transaction ID below
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              3. Admin will verify and add the amount to your wallet
            </Typography>
          </Box>
          <TextField
            fullWidth
            label="Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            sx={{ mt: 2 }}
            required
            helperText="Enter the transaction ID from your bank/UPI payment"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitRequest}
            variant="contained"
            disabled={loading || !amount || !transactionId}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Wallet;
