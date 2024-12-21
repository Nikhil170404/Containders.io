import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';

// Components
import Navbar from './components/Navbar/Navbar';
import LandingPage from './components/LandingPage/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';
import AdminDashboard from './components/Admin/AdminDashboard';
import TournamentManagement from './components/Admin/TournamentManagement';
import GameManagement from './components/Admin/GameManagement';
import UserManagement from './components/Admin/UserManagement';
import AdminTransaction from './components/Admin/AdminTransaction';
import UserHome from './components/User/UserHome';
import Tournaments from './components/Tournaments/Tournaments';
import Teams from './components/Teams/Teams';
import Players from './components/Players/Players';
import NotFound from './components/NotFound/NotFound';
import AdminWalletRequests from './components/Admin/AdminWalletRequests';
import Wallet from './components/Wallet/Wallet';
import { setUserFromLocalStorage } from './redux/actions/authAction';

// Protected Route for authenticated users
const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" />;
  return children;
};

// Admin Route - only accessible by admins
const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" />;
  if (!user.isAdmin) return <Navigate to="/home" />;
  return children;
};

// User Route - only accessible by regular users
const UserRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" />;
  if (user.isAdmin) return <Navigate to="/admin" />;
  return children;
};

// Public Route - redirects authenticated users based on their role
const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (user) {
    if (user.isAdmin) {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/home" />;
  }
  return children;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setUserFromLocalStorage());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/tournaments" element={<AdminRoute><TournamentManagement /></AdminRoute>} />
          <Route path="/admin/games" element={<AdminRoute><GameManagement /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin/transactions" element={<AdminRoute><AdminTransaction /></AdminRoute>} />
          <Route path="/admin/wallet-requests" element={<AdminRoute><AdminWalletRequests /></AdminRoute>} />

          {/* User Routes */}
          <Route path="/home" element={<UserRoute><UserHome /></UserRoute>} />
          <Route path="/tournaments" element={<PrivateRoute><Tournaments /></PrivateRoute>} />
          <Route path="/teams" element={<PrivateRoute><Teams /></PrivateRoute>} />
          <Route path="/players" element={<PrivateRoute><Players /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
