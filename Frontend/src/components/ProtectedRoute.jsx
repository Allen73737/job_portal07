import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();

  // Retrieve auth data from localStorage
  const seekerEmail = localStorage.getItem('email');
  const employerData = localStorage.getItem('employer');
  const adminToken = localStorage.getItem('adminToken');

  if (role === 'admin') {
    if (!adminToken) {
      toast.error('Classified Access Only. Please verify credentials.', { 
        id: 'auth-toast-admin',
        style: { background: '#000', color: '#fff', border: '1px solid #333' }
      });
      return <Navigate to="/adl" state={{ from: location }} replace />;
    }
  } 
  else if (role === 'employer') {
    if (!employerData) {
      toast.error('Employer Access Required. Please sign in.', { 
        id: 'auth-toast-employer',
        style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }
      });
      return <Navigate to="/e" state={{ from: location }} replace />;
    }
  }
  else if (role === 'seeker') {
    if (!seekerEmail) {
      toast.error('Authentication required. Please sign in to continue.', { 
        id: 'auth-toast-seeker',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' },
        icon: '🔒'
      });
      return <Navigate to="/j" state={{ from: location }} replace />;
    }
  }

  return children;
}
