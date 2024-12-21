import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Google as GoogleIcon } from '@mui/icons-material';
import { login, signInWithGoogle } from '../../redux/actions/authAction';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: authError } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Clear errors when component mounts
    setError('');
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await dispatch(login(formData.email, formData.password));
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle());
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 4 },
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Welcome Back
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Sign in to continue to your account
        </Typography>

        {(error || authError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || authError}
          </Alert>
        )}

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          Continue with Google
        </Button>

        <Divider sx={{ my: 2 }}>or</Divider>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            error={!!error}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            error={!!error}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
              mt: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>

          

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Button
                color="primary"
                onClick={() => navigate('/register')}
                sx={{ textTransform: 'none' }}
              >
                Sign up
              </Button>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
