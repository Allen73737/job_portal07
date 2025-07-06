import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';

const Navbar = () => (
  <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
    <Toolbar>
      <IconButton edge="start" color="inherit" sx={{ mr: 1 }}>
        <WorkIcon />
      </IconButton>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
        JobPortal
      </Typography>
      <Button color="inherit" sx={{ textTransform: 'none', fontWeight: 500 }}>Home</Button>
      <Button color="inherit" sx={{ textTransform: 'none', fontWeight: 500 }}>Post Job</Button>
      <Button color="inherit" sx={{ textTransform: 'none', fontWeight: 500 }}>LogOut</Button>
    </Toolbar>
  </AppBar>
);

export default Navbar;