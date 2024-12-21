import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { db, doc, collection, query, getDocs, updateDoc, serverTimestamp, getDoc, setDoc } from '../../firebase';

const AdminWalletRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const q = query(collection(db, 'depositRequests'));
      const querySnapshot = await getDocs(q);
      const requestsData = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching deposit requests',
        severity: 'error',
      });
    }
  };

  const handleApprove = async (request) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleReject = async (request) => {
    try {
      setLoading(true);
      
      // Update request status
      const requestRef = doc(db, 'depositRequests', request.id);
      await updateDoc(requestRef, {
        status: 'rejected',
        updatedAt: serverTimestamp(),
      });

      // Get or create user's wallet
      const walletRef = doc(db, 'wallets', request.userId);
      const walletDoc = await getDoc(walletRef);
      
      const newTransaction = {
        amount: request.amount,
        type: 'deposit',
        status: 'rejected',
        date: new Date(),
        details: 'Deposit request rejected',
        transactionId: request.transactionId,
      };

      if (!walletDoc.exists()) {
        // Create new wallet document if it doesn't exist
        await setDoc(walletRef, {
          userId: request.userId,
          balance: 0,
          transactions: [newTransaction],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Update existing wallet
        await updateDoc(walletRef, {
          transactions: [...(walletDoc.data().transactions || []), newTransaction],
          updatedAt: serverTimestamp(),
        });
      }

      setSnackbar({
        open: true,
        message: 'Deposit request rejected successfully',
        severity: 'success',
      });
      
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      setSnackbar({
        open: true,
        message: 'Error rejecting deposit request',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmApproval = async () => {
    try {
      setLoading(true);
      const request = selectedRequest;

      // Update request status
      const requestRef = doc(db, 'depositRequests', request.id);
      await updateDoc(requestRef, {
        status: 'approved',
        updatedAt: serverTimestamp(),
      });

      // Get or create user's wallet
      const walletRef = doc(db, 'wallets', request.userId);
      const walletDoc = await getDoc(walletRef);
      
      const newTransaction = {
        amount: request.amount,
        type: 'deposit',
        status: 'completed',
        date: new Date(),
        details: 'Deposit request approved',
        transactionId: request.transactionId,
      };

      if (!walletDoc.exists()) {
        // Create new wallet document if it doesn't exist
        await setDoc(walletRef, {
          userId: request.userId,
          balance: request.amount,
          transactions: [newTransaction],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Update existing wallet
        const currentBalance = walletDoc.data().balance || 0;
        await updateDoc(walletRef, {
          balance: currentBalance + request.amount,
          transactions: [...(walletDoc.data().transactions || []), newTransaction],
          updatedAt: serverTimestamp(),
        });
      }

      setSnackbar({
        open: true,
        message: 'Deposit request approved and wallet updated successfully',
        severity: 'success',
      });

      setOpenDialog(false);
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      setSnackbar({
        open: true,
        message: 'Error approving deposit request',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const formatAmount = (amount) => {
    return !isNaN(amount) ? parseFloat(amount).toFixed(2) : '0.00';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Wallet Deposit Requests
      </Typography>
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>{request.userEmail}</TableCell>
                    <TableCell>₹{formatAmount(request.amount)}</TableCell>
                    <TableCell>{request.transactionId}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={
                          request.status === 'pending'
                            ? 'warning'
                            : request.status === 'approved'
                            ? 'success'
                            : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            startIcon={<CheckCircle />}
                            color="success"
                            onClick={() => handleApprove(request)}
                            disabled={loading}
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            startIcon={<Cancel />}
                            color="error"
                            onClick={() => handleReject(request)}
                            disabled={loading}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No deposit requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Approval Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Deposit Approval</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to approve this deposit request?
          </Typography>
          {selectedRequest && (
            <>
              <Typography variant="body2" color="textSecondary">
                Amount: ₹{formatAmount(selectedRequest.amount)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Transaction ID: {selectedRequest.transactionId}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                User: {selectedRequest.userEmail}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmApproval}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Approval'}
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

export default AdminWalletRequests;
