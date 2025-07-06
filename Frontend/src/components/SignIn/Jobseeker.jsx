import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Checkbox,
  FormControlLabel, Link, InputAdornment, IconButton, Paper, Avatar,
  Snackbar, Alert, Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Person } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // <-- Add this

const steps = ['Personal Details', 'Profile Details', 'Account Setup'];

export default function JobSeekerLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [registerStep, setRegisterStep] = useState(0); // 0-based for Stepper
  const [formData, setFormData] = useState({
    name: '', age: '', location: '', linkedin: '', bio: '', resume: null, email: '', password: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);

  const navigate = useNavigate(); // <-- Add this

  // Input handlers
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Login logic (unchanged)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/seeker/login', {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('email', formData.email);
      setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
      setTimeout(() => window.location.href = '/job', 1200);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Login failed',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  // Registration steps navigation
  const handleNext = (e) => {
    e.preventDefault();
    if (registerStep === 1) {
      setOpenDialog(true); // open dialog for email/password
    } else {
      setRegisterStep((prev) => prev + 1);
    }
  };
  const handleBack = (e) => {
    e.preventDefault();
    setRegisterStep((prev) => prev - 1);
  };

  // Registration submit (unchanged except redirect to /job)
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('age', formData.age);
      form.append('location', formData.location);
      form.append('linkedin', formData.linkedin);
      form.append('bio', formData.bio);
      form.append('email', formData.email);
      form.append('password', formData.password);
      if (formData.resume) form.append('resume', formData.resume);

      await axios.post('http://localhost:5000/api/seeker/register', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('email', formData.email);
      setSnackbar({ open: true, message: 'Registration successful!', severity: 'success' });
      setOpenDialog(false);
      setTimeout(() => {
        window.location.href = '/job';
      }, 1200);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Registration failed',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  // Reset registration
  const startRegister = () => {
    setMode('register');
    setRegisterStep(0);
    setFormData({
      name: '', age: '', location: '', linkedin: '', bio: '', resume: null, email: '', password: ''
    });
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #eafaf1 0%, #e3f2fd 100%)',
      p: 0,
    }}>
      {/* Top Navigation */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 4, py: 2, bgcolor: 'white', boxShadow: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{
            bgcolor: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)',
            width: 40, height: 40, fontWeight: 700
          }}>JP</Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#273570' }}>
            JobPortal
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* <Link href="#" underline="none" sx={{ color: '#222', fontWeight: 500 }}>Find Jobs</Link> */}
          <Link
            component="button"
            underline="none"
            sx={{ color: '#222', fontWeight: 500 }}
            onClick={() => navigate('/e')}
          >
            Post Jobs
          </Link>
          <Button
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 500, px: 2, py: 0.5 }}
            onClick={() => navigate('/adl')}
          >
            Admin
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        mt: 6,
        px: 2,
      }}>
        {/* Left Panel */}
        <Box sx={{ flex: 1, maxWidth: 540, mr: 4 }}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: 3,
              mb: 3,
              width: '100%',
              height: { xs: 300, md: 480 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f5f8ff',
            }}
          >
            <img
              src="https://youthincmag.com/wp-content/uploads/2023/07/20822846_NA_October_10-scaled.jpg"
              alt="Digital Process"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 16, left: 16,
                bgcolor: 'white',
                borderRadius: 2,
                px: 2, py: 1,
                display: 'flex', alignItems: 'center',
                boxShadow: 1,
                gap: 1,
                animation: 'bounce 1.2s infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-16px)' }
                }
              }}
            >
              <Avatar sx={{ bgcolor: '#e3f0ff', color: '#1a73e8', width: 28, height: 28, fontSize: 20 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#222', fontSize: 15 }}>
                  50,000+ Jobs
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#5c6f8c' }}>
                  Your dream job is one click away!
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1b2b44' }}>
            Ready to Take the Next Step?
          </Typography>
          <Typography sx={{ color: '#5c6f8c', mb: 3, fontSize: 17 }}>
            Join thousands of professionals who found their perfect career match through our platform.
          </Typography>
        </Box>

        {/* Right Panel (Login/Register Card) */}
        <Paper elevation={3} sx={{
          flex: 1, maxWidth: 410, px: 4, py: 5,
          borderRadius: 4,
          minWidth: 350,
          position: 'relative',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar sx={{
              bgcolor: '#13c07f',
              width: 56, height: 56,
              boxShadow: 2,
            }}>
              <Person fontSize="large" />
            </Avatar>
          </Box>
          {mode === 'login' ? (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mb: 1, color: '#1b2b44' }}>
                Job Seeker Portal
              </Typography>
              <Typography sx={{ color: '#5c6f8c', textAlign: 'center', mb: 3 }}>
                Access your job seeker dashboard
              </Typography>
              <form onSubmit={handleLogin}>
                <TextField
                  fullWidth margin="normal"
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                <TextField
                  fullWidth margin="normal"
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', my: 1 }}>
                  <FormControlLabel control={<Checkbox />} label="Remember me" />
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 2, mb: 1.5, py: 1.3, fontWeight: 'bold', fontSize: 17,
                    background: '#13c07f',
                    borderRadius: 2,
                    boxShadow: 2,
                    '&:hover': { background: '#0e9f6e' }
                  }}
                >
                  {loading ? 'Signing In...' : 'Access Dashboard'}
                </Button>
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                  New user? <Link component="button" onClick={startRegister} sx={{ fontWeight: 600, color: '#13c07f' }}>Register here</Link>
                </Typography>
              </form>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mb: 1, color: '#1b2b44' }}>
                Job Seeker Registration
              </Typography>
              <Typography sx={{ color: '#5c6f8c', textAlign: 'center', mb: 3 }}>
                Create your job seeker account
              </Typography>
              <Stepper activeStep={registerStep} alternativeLabel sx={{ mb: 3 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <form onSubmit={handleNext}>
                {registerStep === 0 && (
                  <>
                    <TextField
                      fullWidth margin="normal" name="name" label="Full Name"
                      value={formData.name} onChange={handleChange} required
                    />
                    <TextField
                      fullWidth margin="normal" name="age" label="Age" type="number"
                      value={formData.age} onChange={handleChange} required
                    />
                    <TextField
                      fullWidth margin="normal" name="location" label="Location"
                      value={formData.location} onChange={handleChange} required
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{
                        mt: 2, py: 1.3, fontWeight: 'bold', fontSize: 17,
                        background: '#13c07f',
                        borderRadius: 2,
                        boxShadow: 2,
                        '&:hover': { background: '#0e9f6e' }
                      }}
                    >
                      Next
                    </Button>
                  </>
                )}
                {registerStep === 1 && (
                  <>
                    <TextField
                      fullWidth margin="normal" name="linkedin" label="LinkedIn Profile URL"
                      value={formData.linkedin} onChange={handleChange}
                    />
                    <TextField
                      fullWidth margin="normal" name="bio" label="Short Bio" multiline rows={2}
                      value={formData.bio} onChange={handleChange}
                    />
                    <Box sx={{ mt: 2 }}>
                      <input
                        type="file"
                        name="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleChange}
                        style={{
                          border: '1px solid #c4c4c4',
                          borderRadius: 4,
                          padding: '10px 14px',
                          width: '100%',
                          fontFamily: 'inherit',
                          fontSize: '1rem',
                          color: '#333',
                          cursor: 'pointer'
                        }}
                      />
                      <Typography variant="caption" sx={{ mt: 1, color: '#666' }}>
                        {formData.resume ? formData.resume.name : 'Upload resume (PDF, DOC)'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        sx={{ mr: 2 }}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          py: 1.3, fontWeight: 'bold', fontSize: 17,
                          background: '#13c07f',
                          borderRadius: 2,
                          boxShadow: 2,
                          '&:hover': { background: '#0e9f6e' }
                        }}
                      >
                        Next
                      </Button>
                    </Box>
                  </>
                )}
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                  Already have an account? <Link component="button" onClick={() => { setMode('login'); setRegisterStep(0); }} sx={{ fontWeight: 600, color: '#13c07f' }}>Sign In</Link>
                </Typography>
              </form>
            </>
          )}
        </Paper>
      </Box>

      {/* Dialog for Email & Password (only for registration) */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <form onSubmit={handleRegister}>
          <DialogTitle>Set Email and Password</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth margin="normal" name="email" label="Email"
              type="email" value={formData.email} onChange={handleChange} required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth margin="normal" name="password" label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password} onChange={handleChange} required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
