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
<<<<<<< HEAD
import { Visibility, VisibilityOff, Google as GoogleIcon, SportsEsports } from '@mui/icons-material';
=======
import { Visibility, VisibilityOff, Google as GoogleIcon } from '@mui/icons-material';
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
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
<<<<<<< HEAD
=======
    // Clear errors when component mounts
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
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
<<<<<<< HEAD
    <Container 
      maxWidth="sm" 
      sx={{ 
        mt: { xs: 2, sm: 4 }, 
        mb: 4,
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          p: { xs: 3, sm: 5 },
          width: '100%',
          borderRadius: 4,
          background: 'linear-gradient(to bottom right, rgba(13, 17, 23, 0.95), rgba(24, 26, 32, 0.95))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <SportsEsports 
            sx={{ 
              fontSize: 48, 
              mb: 2,
              color: 'primary.main',
              filter: 'drop-shadow(0 0 10px rgba(33, 150, 243, 0.5))'
            }} 
          />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 20px rgba(33, 150, 243, 0.3)',
            }}
          >
            Welcome Back
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              mt: 1 
            }}
          >
            Sign in to continue your gaming journey
          </Typography>
        </Box>

        {(error || authError) && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              color: '#ff5252',
              border: '1px solid rgba(211, 47, 47, 0.3)',
              '& .MuiAlert-icon': {
                color: '#ff5252'
              }
            }}
          >
=======
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
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
            {error || authError}
          </Alert>
        )}

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
<<<<<<< HEAD
          sx={{
            mb: 3,
            py: 1.5,
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
=======
          sx={{ mb: 2 }}
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
        >
          Continue with Google
        </Button>

<<<<<<< HEAD
        <Divider 
          sx={{ 
            my: 3,
            '&::before, &::after': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          or
        </Divider>
=======
        <Divider sx={{ my: 2 }}>or</Divider>
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2

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
<<<<<<< HEAD
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
=======
            sx={{ mb: 2 }}
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
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
<<<<<<< HEAD
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
=======
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
<<<<<<< HEAD
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
=======
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
<<<<<<< HEAD
              mt: 4,
              mb: 2,
              py: 1.5,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 15px rgba(33, 150, 243, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                boxShadow: '0 3px 20px rgba(33, 150, 243, 0.4)',
=======
              mt: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>

<<<<<<< HEAD
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Don't have an account?{' '}
              <Button
                onClick={() => navigate('/register')}
                sx={{ 
                  textTransform: 'none',
                  color: '#2196F3',
                  '&:hover': {
                    color: '#21CBF3',
                    backgroundColor: 'transparent',
                  },
                }}
=======
          

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Button
                color="primary"
                onClick={() => navigate('/register')}
                sx={{ textTransform: 'none' }}
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
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
