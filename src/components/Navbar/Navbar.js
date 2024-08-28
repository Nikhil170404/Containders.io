import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../../redux/actions/authAction';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navbarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleCommunityDropdown = () => {
    setIsCommunityDropdownOpen((prev) => !prev);
    setIsGroupDropdownOpen(false); // Close Group dropdown if open
  };

  const toggleGroupDropdown = () => {
    setIsGroupDropdownOpen((prev) => !prev);
    setIsCommunityDropdownOpen(false); // Close Community dropdown if open
  };

  const handleClickOutside = (event) => {
    if (navbarRef.current && !navbarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
      setIsCommunityDropdownOpen(false);
      setIsGroupDropdownOpen(false);
    }
  };

  const handleScroll = () => {
    setIsSidebarOpen(false);
    setIsCommunityDropdownOpen(false);
    setIsGroupDropdownOpen(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const commonNavItems = [
    { to: '/home', icon: 'home', label: 'Home' },
    { to: '/aboutus', icon: 'info-circle', label: 'About' },
    { to: '/contactus', icon: 'envelope', label: 'Contact' },
  ];

  const userNavItems = [
    ...commonNavItems,
    { to: '/profile', icon: 'user', label: 'Profile' },
    { to: '/wallet', icon: 'wallet', label: 'Wallet' },
    { to: '/tournaments', icon: 'gamepad', label: 'Tournaments' },
    { to: '/leaderboard', icon: 'trophy', label: 'Leaderboard' },
    {
      to: '#', icon: 'users', label: 'Community', dropdown: true, dropdownItems: [
        { to: '/community', label: 'View Posts' },
        { to: '/events', label: 'Upcoming Events' },
        { to: '/groupmanagement', label: 'Groups' }
      ]
    },
    { to: '/settings', icon: 'cog', label: 'Settings' }
  ];

  const adminNavItems = [
    ...userNavItems,
    { to: '/admin/transactions', icon: 'list', label: 'Transaction Requests' },
    { to: '/approve-reject-transaction', icon: 'check-circle', label: 'Approve/Reject Transactions' },
    { to: '/admin-dashboard', icon: 'tachometer-alt', label: 'Admin Dashboard' },
    { to: '/create-event', icon: 'plus', label: 'Create Event' },
    { to: '/edit-event/:id', icon: 'edit', label: 'Edit Event' },
    { to: '/events/:id', icon: 'info', label: 'Event Detail' }
  ];

  return (
    <nav className="navbar" ref={navbarRef}>
      <button className="navbar-toggle" onClick={toggleSidebar}>
        <div className={`hamburger ${isSidebarOpen ? 'open' : ''}`}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </div>
      </button>
      <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
          <span className="sr-only">Close</span>
        </button>
        <div className="sidebar-menu">
          <ul className="sidebar-links">
            {(user ? (user.isAdmin ? adminNavItems : userNavItems) : commonNavItems).map((item, index) => (
              <li key={`${item.to}-${index}`} className="sidebar-item">
                {item.dropdown ? (
                  <div className="dropdown">
                    <button className="dropdown-toggle" onClick={item.label === 'Community' ? toggleCommunityDropdown : toggleGroupDropdown}>
                      <i className={`fa fa-${item.icon}`}></i>
                      <span className="sidebar-label">{item.label}</span>
                      <i className={`fa fa-caret-down ${item.label === 'Community' ? (isCommunityDropdownOpen ? 'open' : '') : (isGroupDropdownOpen ? 'open' : '')}`}></i>
                    </button>
                    <ul className={`dropdown-menu ${item.label === 'Community' ? (isCommunityDropdownOpen ? 'show' : '') : (isGroupDropdownOpen ? 'show' : '')}`}>
                      {item.dropdownItems.map((dropdownItem, index) => (
                        <li key={`${dropdownItem.to}-${index}`} className="dropdown-item">
                          <Link to={dropdownItem.to} onClick={() => setIsSidebarOpen(false)}>
                            {dropdownItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link to={item.to} className="sidebar-link" onClick={() => setIsSidebarOpen(false)}>
                    <i className={`fa fa-${item.icon}`}></i>
                    <span className="sidebar-label">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
            {user ? (
              <li key="logout">
                <button className="logout-btn" onClick={handleLogout}>
                  <i className="fa fa-sign-out-alt"></i>
                  <span className="sidebar-label">Logout</span>
                </button>
              </li>
            ) : (
              <>
                <li key="signup">
                  <Link to="/signup" className="sidebar-link" onClick={() => setIsSidebarOpen(false)}>
                    <i className="fa fa-user-plus"></i>
                    <span className="sidebar-label">Sign Up</span>
                  </Link>
                </li>
                <li key="login">
                  <Link to="/login" className="sidebar-link" onClick={() => setIsSidebarOpen(false)}>
                    <i className="fa fa-sign-in-alt"></i>
                    <span className="sidebar-label">Login</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
