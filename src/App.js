import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setUser } from './redux/actions/authAction';
import Navbar from './components/Navbar/Navbar';
import LandingPage from './components/LandingPage/LandingPage';
import Home from './components/Home/Home';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import Profile from './components/Profile/Profile';
import Admin from './components/Admin/Admin';
import AboutUs from './components/AboutUs/AboutUs';
import ContactUs from './components/ContactUs/ContactUs';
import Tournaments from './components/Tournaments/Tournaments';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Settings from './components/Settings/Settings';
import Community from './components/Community/Community';
import Wallet from './components/Wallet/Wallet';
import PostAchievement from './components/PostAchievement/PostAchievement';
import GroupManagement from './components/GroupManagement/GroupManagement';
import Events from './components/Events/Events';
import EventDetail from './components/Events/EventDetail';
import CreateEvent from './components/Events/CreateEvent';
import EditEvent from './components/Events/EditEvent';
import ChatInterface from './components/Chat/ChatInterface';
import './index.css';

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      dispatch(setUser(parsedUser));
    }
  }, [dispatch]);

  const determineRedirectPath = () => {
    if (user) {
      return user.isAdmin ? '/admin' : '/home';
    }
    return '/';
  };

  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/home"
            element={user ? (user.isAdmin ? <Navigate to="/admin" /> : <Home />) : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to={determineRedirectPath()} />}
          />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to={determineRedirectPath()} />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={user && user.isAdmin ? <Admin /> : <Navigate to="/login" />}
          />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route
            path="/tournaments"
            element={user ? <Tournaments /> : <Navigate to="/login" />}
          />
          <Route
            path="/leaderboard"
            element={user ? <Leaderboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/settings"
            element={user ? <Settings /> : <Navigate to="/login" />}
          />
          <Route
            path="/wallet"
            element={user ? <Wallet /> : <Navigate to="/login" />}
          />
          <Route
            path="/community"
            element={user ? <Community /> : <Navigate to="/login" />}
          />
          <Route
            path="/postachievement"
            element={user ? <PostAchievement /> : <Navigate to="/login" />}
          />
          <Route
            path="/groupmanagement"
            element={user ? <GroupManagement /> : <Navigate to="/login" />}
          />
          <Route
            path="/events"
            element={user ? <Events /> : <Navigate to="/login" />}
          />
          <Route
            path="/events/:id"
            element={user && user.isAdmin ? <EventDetail /> : <Navigate to="/events" />}
          />
          <Route
            path="/create-event"
            element={user && user.isAdmin ? <CreateEvent /> : <Navigate to="/events" />}
          />
          <Route
            path="/edit-event/:id"
            element={user && user.isAdmin ? <EditEvent /> : <Navigate to="/events" />}
          />
          <Route
            path="/chat"
            element={user ? <ChatInterface /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
