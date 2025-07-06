import { useState } from 'react'
import React from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import JobPostPage from './components/Employer/JobPostPage'
import { Route, Routes } from 'react-router-dom'
import Employerlogin from './components/SignIn/Employerlogin'
import Jobseeker from './components/SignIn/Jobseeker'
import Navbar from './components/Navbar/Nav'
import Job from './components/Job/Job'
import LandingPage from './components/SignIn/LandingPage'
import EmployerDashboard from './components/Employer/EmployerDashboard';
import Profile from './components/Job/Profile';
import EditProfile from './components/Job/EditProfile';
import AppliedJobs from './components/Job/AppliedJobs';
import AdminLogin from './components/Admin/Adminlogin';
import ApplicantListPage from './components/Employer/Applicantlistpage';
import AdminDashboard from './components/Admin/AdminDashboard';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    {/* <Navbar/> */}
    {/* <Job/> */}
     <Routes>
        <Route path='/editprofile' element={<EditProfile/>}/>
        <Route path='/d' element={<EmployerDashboard/>}/>
         <Route path='/applicant' element={<ApplicantListPage/>}/>
         <Route path="/applicant/:jobId" element={<ApplicantListPage />} />

         <Route path='/ap' element={<AppliedJobs/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/' element={<LandingPage/>}/>
        <Route path="/job-post" element={<JobPostPage/>}/>
        <Route path="/e" element={<Employerlogin/>}/>
        <Route path="/j" element={<Jobseeker/>}/>  
        <Route path="/job" element={<Job/>} /> 
        <Route path="/job-post/:jobId" element={<JobPostPage />} />
        <Route path="/adl" element={<AdminLogin/>} /> 
        <Route path="/adb" element={<AdminDashboard/>} /> 

     </Routes>   
    </>
  )
}

export default App
