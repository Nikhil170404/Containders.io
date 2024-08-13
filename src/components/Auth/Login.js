import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../redux/actions/authAction';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { FcGoogle } from 'react-icons/fc';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, error } = useSelector((state) => state.auth);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // If necessary, fetch additional details like age after sign-in
      // Assuming `fetchAdditionalUserDetails` is a function that prompts for more details
      // const additionalDetails = await fetchAdditionalUserDetails(user);

      dispatch(login(user.email, user.displayName));
      setMessage('Login successful!');
    } catch (error) {
      console.error("Google sign-in error: ", error);
      setMessage('Login failed, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(login(email, password));
  };

  useEffect(() => {
    if (user) {
      setMessage('Login successful!');
      navigate(user.isAdmin ? '/admin' : '/');
    } else if (error) {
      setMessage(error);
    }
    setLoading(false);
  }, [user, error, navigate]);

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {message && <p className="message">{message}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <button className="google-signin-button" onClick={handleGoogleSignIn} disabled={loading}>
        <FcGoogle size={20} /> Login with Google
      </button>
    </div>
  );
};

export default Login;
