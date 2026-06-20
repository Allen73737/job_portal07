import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#2563eb', // blue-600
      light: '#60a5fa', // blue-400
      dark: '#1d4ed8', // blue-700
    },
    secondary: {
      main: '#0ea5e9',
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#0f172a',
      paper: mode === 'light' ? '#ffffff' : '#1e293b',
    },
    text: {
      primary: mode === 'light' ? '#0f172a' : '#f8fafc',
      secondary: mode === 'light' ? '#475569' : '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h1: { fontWeight: 800, tracking: '-0.02em' },
    h2: { fontWeight: 700, tracking: '-0.02em' },
    h3: { fontWeight: 700, tracking: '-0.02em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: '10px 28px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-3px) scale(1.03)',
            boxShadow: mode === 'light' ? '0 15px 30px -10px rgba(37, 99, 235, 0.5)' : '0 15px 30px -10px rgba(37, 99, 235, 0.7)',
            filter: 'brightness(1.1)',
          },
          '&:active': {
            transform: 'translateY(1px) scale(0.97)',
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: mode === 'light' ? '0 20px 40px -15px rgba(0,0,0,0.05)' : '0 20px 40px -15px rgba(0,0,0,0.4)',
          backgroundImage: 'none', // Remove MUI's default dark mode elevation gradient
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            backgroundColor: mode === 'light' ? '#ffffff' : '#0f172a',
            '&:hover fieldset': {
              borderColor: '#2563eb',
            },
            '&.Mui-focused fieldset': {
              borderWidth: '2px',
              borderColor: '#2563eb',
            },
          },
        },
      },
    },
  },
});
