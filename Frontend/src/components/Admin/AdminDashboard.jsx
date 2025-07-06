import React, { useState, useRef, useEffect } from 'react';
import {
  Collapse, Box, Typography, Button, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, TextField, AppBar, Toolbar, Drawer, useTheme, CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import {
  Menu as MenuIcon, Brightness4, Brightness7,
  Edit as EditIcon, Delete as DeleteIcon, Undo, Redo,
  People, Work, BarChart as ChartIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom'; // <-- Add this

const graphData = [
  { month: 'Jan', users: 40 },
  { month: 'Feb', users: 80 },
  { month: 'Mar', users: 65 },
  { month: 'Apr', users: 90 },
];

const StatCard = ({ title, icon: Icon, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.3 }}
    onClick={onClick}
    className="rounded-2xl backdrop-blur-lg p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg cursor-pointer"
  >
    <Box display="flex" alignItems="center" gap={2}>
      <Icon fontSize="large" />
      <Typography variant="h6" fontWeight={700}>{title}</Typography>
    </Box>
  </motion.div>
);

const fadeVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function AdminDashboard() {
  const theme = useTheme();
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('users');

  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', data: null });

  const usersRef = useRef(null);
  const jobsRef = useRef(null);
  const analyticsRef = useRef(null);

  const navigate = useNavigate(); // <-- Add this

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSidebarClick = (section) => {
    setActiveSection(prev => (prev === section ? null : section));
    const refMap = {
      users: usersRef,
      jobs: jobsRef,
      analytics: analyticsRef
    };
    refMap[section]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCardEffectStyle = (section) => {
    const isActive = activeSection === section;
    return {
      transform: isActive ? 'scale(1.03)' : 'scale(1)',
      transition: 'all 0.5s ease',
      filter: activeSection && activeSection !== section ? 'blur(4px)' : 'none',
      zIndex: isActive ? 10 : 1
    };
  };

  const commonCardStyle = {
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '20px',
    borderRadius: '20px',
    marginBottom: '30px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(res.data);
    };
    const fetchJobs = async () => {
      const res = await axios.get('http://localhost:5000/api/jobs');
      setJobs(res.data);
    };
    fetchUsers();
    fetchJobs();
  }, []);

  const confirmDelete = (type, data) => setConfirmDialog({ open: true, type, data });

  const handleConfirmedDelete = async () => {
    const { type, data } = confirmDialog;
    setConfirmDialog({ open: false });

    if (type === 'user') {
      await axios.delete(`http://localhost:5000/api/admin/users/${data.email}`);
      setUsers(prev => {
        const updated = prev.filter(user => user.email !== data.email);
        setUndoStack(u => [...u, { type: 'user', data }]);
        return updated;
      });
      toast.success("User deleted");
    }

    if (type === 'job') {
      await axios.delete(`http://localhost:5000/api/admin/jobs/${data._id}`);
      setJobs(prev => {
        const updated = prev.filter(job => job._id !== data._id);
        setUndoStack(u => [...u, { type: 'job-delete', data }]);
        return updated;
      });
      toast.success("Job deleted");
    }
  };

  const handleEditClick = (job) => {
    setEditJob({ ...job });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    const original = jobs.find(j => j._id === editJob._id);
    const res = await axios.put(`http://localhost:5000/api/jobs/${editJob._id}`, {
      title: editJob.title,
      company: editJob.company
    });
    setJobs(prev => prev.map(j => j._id === editJob._id ? res.data : j));
    setUndoStack(u => [...u, { type: 'job-edit', before: original, after: res.data }]);
    toast.success("Job updated");
    setEditOpen(false);
    setEditJob(null);
  };

  const handleUndo = () => {
    if (!undoStack.length) return;
    const last = undoStack.pop();
    setUndoStack([...undoStack]);
    setRedoStack(r => [...r, last]);

    if (last.type === 'user') setUsers(u => [...u, last.data]);
    if (last.type === 'job-delete') setJobs(j => [...j, last.data]);
    if (last.type === 'job-edit') {
      setJobs(j => j.map(job => job._id === last.after._id ? last.before : job));
    }
    toast.info("Undo performed");
  };

  const handleRedo = () => {
    if (!redoStack.length) return;
    const last = redoStack.pop();
    setRedoStack([...redoStack]);
    setUndoStack(u => [...u, last]);

    if (last.type === 'user') setUsers(u => u.filter(user => user.email !== last.data.email));
    if (last.type === 'job-delete') setJobs(j => j.filter(job => job._id !== last.data._id));
    if (last.type === 'job-edit') {
      setJobs(j => j.map(job => job._id === last.before._id ? last.after : job));
    }
    toast.info("Redo performed");
  };
  

  const renderUsersTable = () => (
    <Table>
      <TableHead>
        <TableRow>
          {['Name', 'Email', 'Type', 'Status', 'Actions'].map(h => (
            <TableCell key={h} sx={{ color: darkMode ? 'white' : 'black' }}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user, i) => (
          <TableRow key={i}>
            <TableCell sx={{ color: darkMode ? 'white' : 'black' }}>{user.name}</TableCell>
            <TableCell sx={{ color: darkMode ? 'white' : 'black' }}>{user.email}</TableCell>
            <TableCell sx={{ color: darkMode ? 'white' : 'black' }}>{user.type}</TableCell>
            <TableCell sx={{ color: darkMode ? 'white' : 'black' }}>Active</TableCell>
            <TableCell>
              <Button startIcon={<DeleteIcon />} color="error" onClick={() => confirmDelete('user', user)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderJobsTable = () => (
    <Table>
      <TableHead>
        <TableRow>
          {['Job Title', 'Company', 'Status', 'Actions'].map(h => (
            <TableCell key={h} sx={{ color: darkMode ? 'white' : 'black' }}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {jobs.map((job, i) => (
          <TableRow key={i}>
            <TableCell sx={{ color: darkMode ? 'white' : 'black' }}>{job.title}</TableCell>
            <TableCell sx={{ color: darkMode ? 'white' : 'black' }}>{job.company}</TableCell>
            <TableCell sx={{ color: darkMode ? 'white' : 'black' }}>Active</TableCell>
            <TableCell>
              <Button startIcon={<EditIcon />} sx={{ mr: 1 }} onClick={() => handleEditClick(job)}>Edit</Button>
              <Button startIcon={<DeleteIcon />} color="error" onClick={() => confirmDelete('job', job)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <ToastContainer />
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to delete?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false })}>Cancel</Button>
          <Button color="error" onClick={handleConfirmedDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: 'flex', bgcolor: darkMode ? '#121212' : '#f5f5f5', color: darkMode ? 'white' : 'black', height: '100vh' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ bgcolor: darkMode ? '#1f1f1f' : '#fff', zIndex: 1201 }}>
          <Toolbar className="flex justify-between">
            <Box display="flex" gap={2}>
              <IconButton onClick={toggleSidebar}><MenuIcon sx={{ color: darkMode ? 'white' : 'black' }} /></IconButton>
              <IconButton onClick={handleUndo}><Undo sx={{ color: darkMode ? 'white' : 'black' }} /></IconButton>
              <IconButton onClick={handleRedo}><Redo sx={{ color: darkMode ? 'white' : 'black' }} /></IconButton>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: darkMode ? 'white' : 'black' }}>Admin Dashboard</Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={toggleDarkMode}>
                {darkMode ? <Brightness7 sx={{ color: 'white' }} /> : <Brightness4 />}
              </IconButton>
              {/* Logout Button */}
              <Button
                variant="contained"
                color="error"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 15,
                  px: 2.5,
                  py: 0.8,
                  borderRadius: 2,
                  boxShadow: 1,
                  ml: 2,
                }}
                onClick={() => navigate('/')}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer variant="permanent" sx={{
          width: sidebarOpen ? 200 : 72,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: sidebarOpen ? 200 : 72,
            bgcolor: darkMode ? '#1f1f1f' : '#f0f0f0',
          },
        }}>
          <Toolbar />
          <Box mt={2}>
            {[{ label: 'Users', value: 'users', icon: People }, { label: 'Job Posts', value: 'jobs', icon: Work }, { label: 'Analytics', value: 'analytics', icon: ChartIcon }]
              .map(({ label, value, icon }) => (
                <Box key={value} onClick={() => handleSidebarClick(value)} className="cursor-pointer p-4 hover:bg-blue-500/30">
                  <Box display="flex" alignItems="center" gap={sidebarOpen ? 2 : 0}>
                    {React.createElement(icon, { style: { color: darkMode ? 'white' : 'black' } })}
                    {sidebarOpen && <Typography sx={{ color: darkMode ? 'white' : 'black' }}>{label}</Typography>}
                  </Box>
                </Box>
              ))}
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8, overflowY: 'auto' }}>
          <motion.div initial="hidden" animate="visible" variants={fadeVariants}>
            <Box ref={usersRef} sx={{ ...commonCardStyle, ...getCardEffectStyle('users') }}>
              <StatCard title="Users" icon={People} onClick={() => handleSidebarClick('users')} />
              <Collapse in={activeSection === 'users'} timeout={500} unmountOnExit><Box mt={3}>{renderUsersTable()}</Box></Collapse>
            </Box>

            <Box ref={jobsRef} sx={{ ...commonCardStyle, ...getCardEffectStyle('jobs') }}>
              <StatCard title="Job Posts" icon={Work} onClick={() => handleSidebarClick('jobs')} />
              <Collapse in={activeSection === 'jobs'} timeout={500} unmountOnExit><Box mt={3}>{renderJobsTable()}</Box></Collapse>
            </Box>

            <Box ref={analyticsRef} sx={{ ...commonCardStyle, ...getCardEffectStyle('analytics') }}>
              <StatCard title="Monthly User Registrations" icon={ChartIcon} onClick={() => handleSidebarClick('analytics')} />
              <Collapse in={activeSection === 'analytics'} timeout={500} unmountOnExit>
                <Box mt={3}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={graphData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" stroke={darkMode ? '#fff' : '#000'} />
                      <YAxis stroke={darkMode ? '#fff' : '#000'} />
                      <Tooltip />
                      <Bar dataKey="users" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Collapse>
            </Box>
          </motion.div>
        </Box>
      </Box>

      {editOpen && editJob && (
        <Box sx={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }}>
          <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, width: '400px' }}>
            <Typography variant="h6">Edit Job</Typography>
            <TextField label="Job Title" fullWidth sx={{ mt: 2 }} value={editJob.title} onChange={(e) => setEditJob({ ...editJob, title: e.target.value })} />
            <TextField label="Company" fullWidth sx={{ mt: 2 }} value={editJob.company} onChange={(e) => setEditJob({ ...editJob, company: e.target.value })} />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
