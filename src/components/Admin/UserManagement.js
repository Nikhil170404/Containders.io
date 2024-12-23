import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
<<<<<<< HEAD
  TablePagination,
=======
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
<<<<<<< HEAD
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import AdminLayout from './AdminLayout';
import { db, collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from '../../firebase';
=======
} from '@mui/icons-material';
import AdminLayout from './AdminLayout';
import { db, collection, getDocs, doc, updateDoc, deleteDoc } from '../../firebase';
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
<<<<<<< HEAD
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
=======
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
  const [userForm, setUserForm] = useState({
    displayName: '',
    email: '',
    role: 'user',
<<<<<<< HEAD
    status: 'active',
=======
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
<<<<<<< HEAD
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
=======
      const snapshot = await getDocs(usersRef);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setUserForm({
        displayName: user.displayName || '',
        email: user.email || '',
        role: user.role || 'user',
<<<<<<< HEAD
        status: user.status || 'active',
=======
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
      });
    } else {
      setSelectedUser(null);
      setUserForm({
        displayName: '',
        email: '',
        role: 'user',
<<<<<<< HEAD
        status: 'active',
=======
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setUserForm({
      displayName: '',
      email: '',
      role: 'user',
<<<<<<< HEAD
      status: 'active',
=======
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
    });
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const userRef = doc(db, 'users', selectedUser.id);
<<<<<<< HEAD
      await updateDoc(userRef, {
        ...userForm,
        updatedAt: new Date(),
      });
=======
      await updateDoc(userRef, userForm);
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
      await fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

<<<<<<< HEAD
  const handleToggleUserStatus = async (user) => {
    try {
      const userRef = doc(db, 'users', user.id);
      const newStatus = user.status === 'active' ? 'blocked' : 'active';
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: new Date(),
      });
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
    }
  };

=======
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

<<<<<<< HEAD
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

=======
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
<<<<<<< HEAD
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            User Management
          </Typography>
=======
          <Typography variant="h4">User Management</Typography>
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New User
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

<<<<<<< HEAD
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={user.photoURL} sx={{ bgcolor: 'primary.main' }}>
                              {user.displayName?.[0] || user.email?.[0]}
                            </Avatar>
                            <Typography>{user.displayName || 'N/A'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role || 'user'}
                            color={user.role === 'admin' ? 'secondary' : 'default'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status || 'active'}
                            color={user.status === 'active' ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(user)}
                            title="Edit user"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color={user.status === 'active' ? 'error' : 'success'}
                            onClick={() => handleToggleUserStatus(user)}
                            title={user.status === 'active' ? 'Block user' : 'Unblock user'}
                          >
                            {user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete user"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
=======
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user.photoURL}>
                          {user.displayName?.[0] || user.email?.[0]}
                        </Avatar>
                        <Typography>{user.displayName || 'N/A'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role || 'user'}
                        color={user.role === 'admin' ? 'secondary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.active ? 'Active' : 'Inactive'}
                        color={user.active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
<<<<<<< HEAD
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Display Name"
                name="displayName"
                value={userForm.displayName}
                onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                select
                label="Role"
                name="role"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                required
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
              </TextField>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={userForm.status}
                onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </TextField>
            </Box>
=======
            <TextField
              fullWidth
              label="Display Name"
              value={userForm.displayName}
              onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              margin="normal"
              disabled={selectedUser}
            />
            <TextField
              fullWidth
              select
              label="Role"
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              margin="normal"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
<<<<<<< HEAD
              onClick={handleUpdateUser}
              variant="contained"
              color="primary"
            >
              {selectedUser ? 'Update' : 'Add'}
=======
              variant="contained"
              onClick={handleUpdateUser}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default UserManagement;
