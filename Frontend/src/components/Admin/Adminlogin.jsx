import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', formData);
      setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
      setTimeout(() => {
        navigate('/adb');
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Invalid credentials',
        severity: 'error',
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f7fafd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 410,
          px: 4,
          py: 5,
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.11)',
          mx: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          {/* Large Icon */}
          <Box
            sx={{
              bgcolor: '#232f3e',
              borderRadius: 2,
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
              boxShadow: 2,
            }}
          >
            <ShieldOutlinedIcon sx={{ color: '#fff', fontSize: 36 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, color: '#232f3e' }}>
            Admin Portal
          </Typography>
          <Typography sx={{ color: '#6b7280', fontWeight: 500, mb: 1, fontSize: 16 }}>
            Secure administrative access
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Admin Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              sx: {
                bgcolor: '#f8fafc',
                borderRadius: 2,
              }
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              sx: {
                bgcolor: '#f8fafc',
                borderRadius: 2,
              }
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <FormControlLabel
              control={<Checkbox size="small" sx={{ color: '#232f3e' }} />}
              label={<Typography sx={{ fontSize: 15 }}>Remember me</Typography>}
              sx={{ m: 0 }}
            />
            {/* <Link component="button" underline="hover" sx={{ fontSize: 15, color: '#232f3e', fontWeight: 500 }}>
              Forgot password?
            </Link> */}
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              background: '#232f3e',
              fontWeight: 'bold',
              py: 1.3,
              fontSize: 18,
              borderRadius: 2,
              boxShadow: 2,
              textTransform: 'none',
              letterSpacing: 0.2,
              '&:hover': { background: '#101820' },
            }}
          >
            Access Dashboard
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
