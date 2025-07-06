import React, { useState } from 'react';
import {
  TextField, Button, Typography, Container, Box,
  Snackbar, Alert, InputAdornment, Checkbox, FormControlLabel, Link
} from '@mui/material';
import { Email, Lock, Apartment, Visibility, VisibilityOff } from '@mui/icons-material';
import GroupIcon from '@mui/icons-material/Group';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Employer() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', company: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: '', password: '', company: '' });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const url = isSignUp
        ? 'http://localhost:5000/api/employer/register'
        : 'http://localhost:5000/api/employer/login';
      const { data } = await axios.post(url, formData);
      localStorage.setItem('employer', JSON.stringify(data.employer));
      setSnackbar({ open: true, message: data.message, severity: 'success' });
      setTimeout(() => navigate('/d'), 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error occurred',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ bgcolor: '#f4fcfa', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      {/* Navbar */}
      <Box sx={{ px: { xs: 2, md: 8 }, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{
            bgcolor: '#5f59f7',
            color: '#fff',
            borderRadius: '10px',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 22,
            mr: 1
          }}>
            JP
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
            JobPortal
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            sx={{ color: '#222', textTransform: 'none', fontWeight: 600, fontSize: 16 }}
            onClick={() => navigate('/j')}
          >
            Find Jobs
          </Button>
          {/* <Button sx={{ color: '#222', textTransform: 'none', fontWeight: 600, fontSize: 16 }}>
            Post Jobs
          </Button> */}
          <Button
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#d1d5db', color: '#222', fontSize: 16, px: 2 }}
            onClick={() => navigate('/adl')}
          >
            Admin
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 5, alignItems: 'flex-start', justifyContent: 'center' }}>
          {/* Left Panel */}
          <Box sx={{ width: { xs: '100%', md: '50%' }, minWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Box sx={{ position: 'relative', width: '100%', borderRadius: 5, overflow: 'hidden', bgcolor: '#d1f3e6', mb: 3 }}>
              {/* Image */}
              <Box
                component="img"
                src="https://credcv.com/wp-content/uploads/2021/08/Why-you-should-create-a-job-portal-for-your-organizations-website_033e017b0_3963.jpg"
                alt="Team working"
                sx={{
                  width: '100%',
                  height: 260,
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              {/* 1. Styled Badge: 50,000+ Candidates */}
             <motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{
    duration: 1.2,
    repeat: Infinity,
    repeatType: "mirror",
    ease: "easeInOut"
  }}
  style={{ position: 'absolute', top: 18, left: 18, zIndex: 2 }}
>
  <Box sx={{
    bgcolor: '#fff',
    borderRadius: 2,
    px: 2,
    py: 1,
    display: 'flex',
    alignItems: 'center',
    boxShadow: 2,
    border: '1.5px solid #e0f2f1',
    minWidth: 175, // reduced width
    height: 54     // reduced height
  }}>
    <Box sx={{
      bgcolor: '#e6f7f0',
      border: '1.5px solid #13c07f',
      borderRadius: '10px',
      width: 38,
      height: 38,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mr: 1.5
    }}>
      <GroupIcon sx={{ color: '#13c07f', fontSize: 22 }} />
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#222', lineHeight: 1.1 }}>
        50,000+ Candidates
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#6b7280', fontWeight: 500, lineHeight: 1.1 }}>
        Ready to hire
      </Typography>
    </Box>
  </Box>
</motion.div>

              {/* 2. Hire 3x Faster Badge (bottom left, green, with icon) */}
              {/* <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: 0.6
                }}
                style={{ position: 'absolute', bottom: 24, left: 24, zIndex: 2 }}
              >
                <Box sx={{
                  bgcolor: '#13c07f',
                  color: '#fff',
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: 3,
                  minWidth: 210
                }}>
                  <ArrowForwardIcon sx={{ fontSize: 24, color: '#fff', mr: 1.5, transform: 'rotate(-45deg)' }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>Hire 3x Faster</Typography>
                    <Typography sx={{ fontSize: 14, color: '#d4f7e7', fontWeight: 400 }}>Than traditional methods</Typography>
                  </Box>
                </Box>
              </motion.div> */}
            </Box>
            {/* 3. Info Boxes Below Image */}
            <Box sx={{ display: 'flex', gap: 3, mt: 2, mb: 3, width: '100%' }}>
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#fff',
                  borderRadius: 2,
                  boxShadow: 1,
                  px: 3,
                  py: 2,
                  border: '1.5px solid #e0f2f1',
                  minWidth: 110,
                  textAlign: 'left'
                }}
              >
                <Typography sx={{ fontWeight: 700, color: '#222', fontSize: 17 }}>Quality Candidates</Typography>
                <Typography sx={{ fontSize: 14, color: '#6b7280', mt: 0.5 }}>
                  Pre-screened professionals
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#fff',
                  borderRadius: 2,
                  boxShadow: 1,
                  px: 3,
                  py: 2,
                  border: '1.5px solid #e0f2f1',
                  minWidth: 110,
                  textAlign: 'left'
                }}
              >
                <Typography sx={{ fontWeight: 700, color: '#222', fontSize: 17 }}>Fast Hiring</Typography>
                <Typography sx={{ fontSize: 14, color: '#6b7280', mt: 0.5 }}>
                  Reduce time-to-hire by 60%
                </Typography>
              </Box>
            </Box>
            {/* Rest of your left panel */}
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5 }}>
              Build Your Dream Team
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#6b7280', maxWidth: 480 }}>
              Connect with top talent and streamline your hiring process. Find the perfect candidates for your company.
            </Typography>
          </Box>

          {/* Right Panel (Form) */}
          <Box sx={{ width: { xs: '100%', md: 400 }, bgcolor: '#fff', borderRadius: 4, boxShadow: 3, px: { xs: 3, md: 5 }, py: { xs: 4, md: 6 }, mx: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Box sx={{ bgcolor: '#eaf6f1', color: '#00946e', borderRadius: 2, width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Apartment sx={{ fontSize: 34 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mt: 1 }}>
                Employer Portal
              </Typography>
              <Typography variant="subtitle1" sx={{ textAlign: 'center', color: '#6b7280', mb: 2 }}>
                Access your company dashboard
              </Typography>
            </Box>
            {isSignUp && (
              <TextField
                fullWidth
                label="Company Name"
                name="company"
                value={formData.company}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                sx={{ mb: 2, bgcolor: '#f9fbfd' }}
              />
            )}
            <TextField
              fullWidth
              label="Company Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              placeholder="Enter company email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#bdbdbd' }} />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2, bgcolor: '#f9fbfd' }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              placeholder="Enter your password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#bdbdbd' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={() => setShowPassword(!showPassword)}
                      size="small"
                      sx={{ color: '#bdbdbd', minWidth: 'auto' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 1, bgcolor: '#f9fbfd' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <FormControlLabel
                control={<Checkbox size="small" sx={{ color: '#00946e' }} />}
                label={<Typography sx={{ fontSize: 15 }}>Remember me</Typography>}
                sx={{ m: 0 }}
              />
              {/* <Link href="#" underline="hover" sx={{ fontSize: 15, color: '#00946e', fontWeight: 500 }}>
                Forgot password?
              </Link> */}
            </Box>
            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: '8px',
                fontWeight: 600,
                backgroundColor: '#00946e',
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#007f5c',
                },
              }}
              onClick={handleSubmit}
            >
              {isSignUp ? 'Register Company' : 'Access Dashboard'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                {isSignUp ? (
                  <>
                    Already have an account?{' '}
                    <Link href="#" onClick={toggleMode} underline="hover" sx={{ color: '#00946e', fontWeight: 600 }}>
                      Login here
                    </Link>
                  </>
                ) : (
                  <>
                    New company?{' '}
                    <Link href="#" onClick={toggleMode} underline="hover" sx={{ color: '#00946e', fontWeight: 600 }}>
                      Register here
                    </Link>
                  </>
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', fontFamily: 'Poppins, sans-serif' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
