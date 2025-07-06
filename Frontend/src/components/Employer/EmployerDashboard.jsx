import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEdit, FaTrash, FaBriefcase, FaUsers, FaCalendarCheck, FaEye,
  FaMapMarkerAlt, FaBuilding, FaDollarSign, FaClock, FaChartLine,
  FaPlus, FaStar, FaSearch
} from 'react-icons/fa';

const EmployerDashboard = () => {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    hiresThisMonth: 11, // Fixed as per request
  });
  const [jobs, setJobs] = useState([]);
  const [employer, setEmployer] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('employer'));
    if (!stored || !stored.email) {
      nav('/employer-login');
      return;
    }
    setEmployer(stored);
    loadJobsAndStats(stored.email);
  }, []);

  // Fetch jobs and interview count, then update stats
  const loadJobsAndStats = async (email) => {
    try {
      const jobsRes = await axios.get(`http://localhost:5000/api/jobs/employer-jobs?email=${email}`);
      const jobsData = jobsRes.data;
      setJobs(jobsData);

      const totalApplications = jobsData.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);

      // Fetch interview count from backend
      const interviewRes = await axios.get(`http://localhost:5000/api/stats/interview-count?email=${email}`);
      const interviewsScheduled = interviewRes.data.count || 0;

      setStats({
        activeJobs: jobsData.length,
        totalApplications,
        interviewsScheduled,
        hiresThisMonth: 11, // Fixed value
      });
    } catch (err) {
      console.error("Error loading jobs or interviews", err);
    } finally {
      setLoading(false);
    }
  };

  const delJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${id}`);
      loadJobsAndStats(employer.email);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaBriefcase className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Employer Dashboard
                </h1>
                <p className="text-sm text-gray-500 font-medium">Manage your job postings</p>
              </div>
            </motion.div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Company</p>
                <p className="font-bold text-gray-800">{employer.company || 'TechCorp Inc.'}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { localStorage.removeItem('employer'); nav('/'); }}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur border border-gray-200 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 font-medium"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {/* Stats Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { icon: FaBriefcase, value: stats.activeJobs, label: 'Active Jobs', color: 'emerald', bgGradient: 'from-emerald-500 to-teal-600' },
            { icon: FaUsers, value: stats.totalApplications, label: 'Total Applications', color: 'blue', bgGradient: 'from-blue-500 to-indigo-600' },
            { icon: FaCalendarCheck, value: stats.interviewsScheduled, label: 'Interviews Scheduled', color: 'purple', bgGradient: 'from-purple-500 to-violet-600' },
            { icon: FaChartLine, value: stats.hiresThisMonth, label: 'Hires This Month', color: 'cyan', bgGradient: 'from-cyan-500 to-indigo-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg border border-white/20 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-r ${stat.bgGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="text-white text-xl" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-right"
                >
                  <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Post New Job Button */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)",
              y: -4
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => nav('/job-post')}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl shadow-lg font-bold text-lg flex items-center space-x-3 transition-all duration-300"
          >
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FaPlus className="text-xl" />
            </motion.div>
            <span>Post New Job</span>
          </motion.button>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          variants={itemVariants}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
              <FaBriefcase className="text-emerald-500" />
              <span>Your Job Postings</span>
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative w-full max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/80 backdrop-blur border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Job Postings Container */}
        <motion.div
          variants={itemVariants}
          className="bg-white/60 backdrop-blur rounded-3xl p-8 shadow-xl border border-white/30"
        >
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
              />
            </div>
          ) : filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaBriefcase className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Jobs Posted Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start building your talent pipeline by posting your first job opportunity.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => nav('/job-post')}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl shadow-lg font-bold flex items-center space-x-3 mx-auto"
              >
                <FaPlus />
                <span>Post Your First Job</span>
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{
                      y: -4,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                      transition: { duration: 0.3 }
                    }}
                    className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg border border-white/30 hover:border-emerald-200 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                      {/* Job Content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
                            <div className="flex items-center space-x-4 text-gray-600">
                              <div className="flex items-center space-x-2">
                                <FaBuilding className="text-gray-400" />
                                <span className="font-medium">{job.company}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FaMapMarkerAlt className="text-gray-400" />
                                <span>{job.location}</span>
                              </div>
                            </div>
                          </div>
                          {/* Status Badges */}
                          <div className="flex flex-col space-y-2">
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md"
                            >
                              <FaStar className="inline mr-1" />
                              Featured
                            </motion.span>
                            <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                              Full-time
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-700 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Job Details */}
                        <div className="flex flex-wrap items-center gap-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-lg font-bold flex items-center space-x-2 shadow-sm"
                          >
                            <FaDollarSign />
                            <span>{job.salary || 'Competitive'}</span>
                          </motion.div>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => nav(`/applicant/${job._id}`)}
                            className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:from-blue-200 hover:to-indigo-200 transition-all shadow-sm"
                          >
                            <FaEye />
                            <span>{job.applicationsCount || 0} Applications</span>
                          </motion.button>

                          <div className="flex items-center space-x-2 text-gray-500 text-sm">
                            <FaClock />
                           <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>

                          </div>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex flex-row lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3 lg:ml-6">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => nav(`/job-post/${job._id}`)}
                          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all font-medium"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => delJob(job._id)}
                          className="flex items-center space-x-2 bg-red-50 text-red-500 border border-red-100 px-4 py-2 rounded-lg shadow hover:bg-red-100 hover:text-red-600 transition-all font-medium"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmployerDashboard;

