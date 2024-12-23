import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import { register, signInWithGoogle } from '../../redux/actions/authAction';
import GoogleIcon from '@mui/icons-material/Google';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(register(formData.email, formData.password, formData.username));
      navigate('/home');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle());
      navigate('/home');
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
          <Divider sx={{ my: 2 }}>or</Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Continue with Google
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              Already have an account? Sign in
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
