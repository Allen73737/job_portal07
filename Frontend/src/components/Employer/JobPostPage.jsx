import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Container,
  Paper,
  Snackbar,
  Alert,
  LinearProgress,
  AppBar,
  Toolbar,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

// Glassmorphic Navbar
const GlassNavbar = ({ onLogout }) => (
  <AppBar
    position="static"
    elevation={0}
    sx={{
      background: 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(15px)',
      borderBottom: '1.5px solid rgba(255,255,255,0.25)',
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15)',
      zIndex: 10,
    }}
  >
    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 72 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          color: '#222',
          letterSpacing: 1.5,
          fontFamily: 'Montserrat, Inter, sans-serif',
        }}
      >
        Employer Dashboard
      </Typography>
      <Button
        variant="outlined"
        startIcon={<LogoutIcon />}
        onClick={onLogout}
        sx={{
          color: '#007cf0',
          borderColor: '#00dfd8',
          background: 'rgba(255,255,255,0.6)',
          borderRadius: 8,
          fontWeight: 600,
          px: 2.5,
          py: 1,
          boxShadow: '0 2px 8px rgba(0,223,216,0.08)',
          transition: 'all 0.3s cubic-bezier(.47,1.64,.41,.8)',
          '&:hover': {
            background: 'linear-gradient(90deg, #007cf0, #00dfd8)',
            color: '#fff',
            borderColor: '#007cf0',
            boxShadow: '0 4px 18px rgba(0,223,216,0.18)',
          },
        }}
      >
        Logout
      </Button>
    </Toolbar>
  </AppBar>
);

// Floating background circle
const FloatingIcon = ({ size, top, left, animationDuration }) => (
  <motion.div
    style={{
      position: 'absolute',
      top,
      left,
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(5px)',
      zIndex: 0,
    }}
    animate={{ y: [0, -10, 0] }}
    transition={{ repeat: Infinity, duration: animationDuration, ease: 'easeInOut' }}
  />
);

// Wave background animation
const WaveBackground = () => (
  <Box
    component="svg"
    viewBox="0 0 1440 320"
    sx={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      zIndex: 0,
      transform: 'translateY(20%)',
    }}
  >
    <motion.path
      fill="#ffffff33"
      d="M0,192L40,186.7C80,181,160,171,240,165.3C320,160,400,160,480,176C560,192,640,224,720,234.7C800,245,880,235,960,218.7C1040,203,1120,181,1200,165.3C1280,149,1360,139,1400,133.3L1440,128L1440,320L0,320Z"
      animate={{
        d: [
          "M0,192L40,186.7C80,181,160,171,240,165.3C320,160,400,160,480,176C560,192,640,224,720,234.7C800,245,880,235,960,218.7C1040,203,1120,181,1200,165.3C1280,149,1360,139,1400,133.3L1440,128L1440,320L0,320Z",
          "M0,256L48,229.3C96,203,192,149,288,144C384,139,480,181,576,181.3C672,181,768,139,864,112C960,85,1056,75,1152,106.7C1248,139,1344,213,1392,250.7L1440,288L1440,320L0,320Z"
        ]
      }}
      transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
    />
  </Box>
);

const JobPostPage = () => {
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full Time',
    salary: '',
    description: '',
    datePosted: '',
  });

  const [step, setStep] = useState(1);
  const [snack, setSnack] = useState({ open: false, message: '', severity: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEdit = Boolean(jobId);

  function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return ` ${dd}-${mm}-${yyyy}`;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (isEdit) {
        try {
          const res = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
          let datePosted = res.data.datePosted;
          if (datePosted) {
            datePosted = new Date(datePosted).toISOString();
          }
          setForm({ ...res.data, datePosted: datePosted || '' });
        } catch (err) {
          console.error("Error loading job:", err);
        }
      } else {
        const employer = JSON.parse(localStorage.getItem("employer"));
        let company = '';
        if (employer?.email) {
          try {
            const res = await axios.get(`http://localhost:5000/api/employers/${employer.email}`);
            company = res.data.company || '';
          } catch (err) {
            console.error("Error fetching employer:", err);
          }
        }
        setForm(prev => ({
          ...prev,
          company,
          datePosted: new Date().toISOString(),
        }));
      }
    };
    fetchData();
  }, [jobId, isEdit]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!form.title) newErrors.title = 'Required';
      if (!form.company) newErrors.company = 'Required';
      if (!form.location) newErrors.location = 'Required';
    } else {
      if (!form.salary) newErrors.salary = 'Required';
      if (!form.description) newErrors.description = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleLogout = () => {
    localStorage.removeItem('employer');
    navigate('/'); // ✅ Redirect to homepage after logout
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const employer = JSON.parse(localStorage.getItem('employer'));
    if (!employer) return navigate('/employer-login');

    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/jobs/${jobId}`, form);
        setSnack({ open: true, message: 'Job updated successfully', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/jobs', { ...form, postedBy: employer.email });
        setSnack({ open: true, message: 'Job posted successfully', severity: 'success' });
      }

      setTimeout(() => navigate('/d'), 1200);
    } catch (error) {
      console.error("Submission error:", error);
      setSnack({ open: true, message: 'Failed to submit job', severity: 'error' });
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
        minHeight: '100vh',
      }}
    >
      <GlassNavbar onLogout={handleLogout} />
      <FloatingIcon size={100} top="10%" left="5%" animationDuration={6} />
      <FloatingIcon size={60} top="70%" left="80%" animationDuration={8} />
      <FloatingIcon size={80} top="40%" left="60%" animationDuration={10} />
      <WaveBackground />

      <Container maxWidth="sm" sx={{ pt: 4 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 900,
            color: '#007cf0',
            fontFamily: 'Montserrat, Inter, sans-serif',
            letterSpacing: 1.2,
            mb: 1,
            textShadow: '0 2px 16px rgba(0,223,216,0.12)',
          }}
        >
          
        </Typography>
        <Paper
          elevation={10}
          sx={{
            p: 5,
            borderRadius: '30px',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.23)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            position: 'relative',
            zIndex: 1,
            mt: 2,
          }}
        >
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', letterSpacing: 1 }}>
            {isEdit ? '✏ Edit Job' : '🚀 Post a New Job'}
          </Typography>

          <LinearProgress variant="determinate" value={(step / 2) * 100} sx={{ mb: 3, borderRadius: 10 }} />

          <Box component="form" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
                  <TextField
                    fullWidth label="Job Title" name="title" value={form.title} onChange={handleChange}
                    error={!!errors.title} helperText={errors.title}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }} required
                  />
               <TextField
  fullWidth
  label="Company"
  name="company"
  value={form.company}
  onChange={handleChange}
  error={!!errors.company}
  helperText={errors.company}
  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
  required
/>

                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    error={!!errors.location}
                    helperText={errors.location}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Date Posted"
                    name="datePosted"
                    value={formatDateToDDMMYYYY(form.datePosted)}
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  <TextField
                    fullWidth select label="Job Type" name="type" value={form.type} onChange={handleChange}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  >
                    {['Full Time', 'Part Time', 'Internship', 'Remote'].map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>

                  <Button
                    variant="contained"
                    onClick={handleNext}
                    fullWidth
                    sx={{
                      borderRadius: 10,
                      py: 1.5,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      background: 'linear-gradient(90deg,#00dfd8,#007cf0 99%)',
                      color: '#fff',
                      boxShadow: '0 4px 24px rgba(0,223,216,0.15)',
                      transition: 'all 0.3s cubic-bezier(.47,1.64,.41,.8)',
                      '&:hover': {
                        background: 'linear-gradient(90deg,#007cf0,#00dfd8 99%)',
                        color: '#fff',
                        boxShadow: '0 8px 32px rgba(0,223,216,0.25)',
                        transform: 'translateY(-2px) scale(1.03)',
                      },
                    }}
                  >
                    Next
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
                  <TextField
                    fullWidth label="Salary (per annum)" name="salary" value={form.salary} onChange={handleChange}
                    error={!!errors.salary} helperText={errors.salary} required sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  <TextField
                    fullWidth multiline rows={5} label="Job Description" name="description" value={form.description}
                    onChange={handleChange} error={!!errors.description} helperText={errors.description}
                    required sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      sx={{
                        px: 3,
                        borderRadius: 10,
                        fontWeight: 'bold',
                        color: '#007cf0',
                        borderColor: '#00dfd8',
                        background: 'rgba(255,255,255,0.7)',
                        transition: 'all 0.3s cubic-bezier(.47,1.64,.41,.8)',
                        '&:hover': {
                          background: 'linear-gradient(90deg,#007cf0,#00dfd8 99%)',
                          color: '#fff',
                          borderColor: '#007cf0',
                          boxShadow: '0 8px 32px rgba(0,223,216,0.15)',
                          transform: 'translateY(-2px) scale(1.03)',
                        },
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(90deg, #007cf0, #00dfd8)',
                        boxShadow: '0 6px 25px rgba(0,223,216,0.16)',
                        color: 'white',
                        textTransform: 'uppercase',
                        borderRadius: 10,
                        transition: 'all 0.3s cubic-bezier(.47,1.64,.41,.8)',
                        '&:hover': {
                          background: 'linear-gradient(90deg,#00dfd8,#007cf0 99%)',
                          color: '#fff',
                          boxShadow: '0 8px 32px rgba(0,223,216,0.23)',
                          transform: 'translateY(-2px) scale(1.03)',
                        },
                      }}
                    >
                      {isEdit ? 'Update Job' : 'Post Job'}
                    </Button>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Paper>

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default JobPostPage;