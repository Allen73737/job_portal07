import React from 'react';
import { Toaster } from 'react-hot-toast';
import './App.css'
import JobPostPage from './components/Employer/JobPostPage'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Employerlogin from './components/SignIn/Employerlogin'
import Jobseeker from './components/SignIn/Jobseeker'
import Job from './components/Job/Job'
import LandingPage from './components/SignIn/LandingPage'
import EmployerDashboard from './components/Employer/EmployerDashboard';
import Profile from './components/Job/Profile';
import EditProfile from './components/Job/EditProfile';
import AppliedJobs from './components/Job/AppliedJobs';
import AdminLogin from './components/Admin/Adminlogin';
import ApplicantListPage from './components/Employer/Applicantlistpage';
import AdminDashboard from './components/Admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AllJobs from './components/Job/AllJobs';
import AIResumeStudio from './components/Resume/AIResumeStudio';
import EmployerStatsPage from './components/Employer/EmployerStatsPage';
import GlobalLayout from './GlobalLayout';

// Ultra-Premium Liquid Blur Page Transition
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(15px)", scale: 0.98 }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, y: -30, filter: "blur(15px)", scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 120, 
        damping: 25, 
        mass: 1,
        opacity: { duration: 0.4 },
        filter: { duration: 0.5 }
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

function App() {
  const location = useLocation();
  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            padding: '16px 24px',
            fontSize: '16px',
            fontWeight: '600',
            zIndex: 999999
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
        }} 
      />
      <GlobalLayout>
      <div className="w-full h-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path='/editprofile' element={<ProtectedRoute role="seeker"><PageTransition><EditProfile/></PageTransition></ProtectedRoute>}/>
            <Route path='/d' element={<ProtectedRoute role="employer"><PageTransition><EmployerDashboard/></PageTransition></ProtectedRoute>}/>
            <Route path='/employer/stats/:type' element={<ProtectedRoute role="employer"><PageTransition><EmployerStatsPage/></PageTransition></ProtectedRoute>} />
            <Route path='/applicant' element={<ProtectedRoute role="employer"><PageTransition><ApplicantListPage/></PageTransition></ProtectedRoute>}/>
            <Route path="/applicant/:jobId" element={<ProtectedRoute role="employer"><PageTransition><ApplicantListPage /></PageTransition></ProtectedRoute>} />
            <Route path='/ap' element={<ProtectedRoute role="seeker"><PageTransition><AppliedJobs/></PageTransition></ProtectedRoute>}/>
            <Route path='/all-jobs' element={<PageTransition><AllJobs/></PageTransition>}/>
            <Route path='/profile' element={<ProtectedRoute role="seeker"><PageTransition><Profile/></PageTransition></ProtectedRoute>}/>
            <Route path='/resume-studio' element={<ProtectedRoute role="seeker"><PageTransition><AIResumeStudio/></PageTransition></ProtectedRoute>}/>
            <Route path='/' element={<PageTransition><LandingPage/></PageTransition>}/>
            <Route path="/job-post" element={<ProtectedRoute role="employer"><PageTransition><JobPostPage/></PageTransition></ProtectedRoute>}/>
            <Route path="/e" element={<PageTransition><Employerlogin/></PageTransition>}/>
            <Route path="/j" element={<PageTransition><Jobseeker/></PageTransition>}/>  
            <Route path="/job" element={<ProtectedRoute role="seeker"><PageTransition><Job/></PageTransition></ProtectedRoute>} /> 
            <Route path="/job-post/:jobId" element={<ProtectedRoute role="employer"><PageTransition><JobPostPage /></PageTransition></ProtectedRoute>} />
            <Route path="/adl" element={<PageTransition><AdminLogin/></PageTransition>} /> 
            <Route path="/adb" element={<ProtectedRoute role="admin"><PageTransition><AdminDashboard/></PageTransition></ProtectedRoute>} /> 
          </Routes>   
        </AnimatePresence>
      </div>
      </GlobalLayout>
    </>
  )
}

export default App
