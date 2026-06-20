import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaSpinner, FaBriefcase, FaEnvelope, FaCalendarCheck, FaChartLine, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

export default function EmployerStatsPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ jobs: [], applications: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('employer'));
        if (!stored) return navigate('/e');
        
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employer/dashboard-data?email=${stored.email}`);
        setData({
          jobs: res.data.jobs || [],
          applications: res.data.applications || []
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  let items = [];
  let title = '';
  let icon = null;
  let colorClass = '';

  if (type === 'jobs') {
    title = 'Active Jobs';
    icon = <FaBriefcase className="text-3xl" />;
    colorClass = 'from-blue-500 to-indigo-600';
    items = data.jobs;
  } else if (type === 'applications') {
    title = 'Total Applications';
    icon = <FaEnvelope className="text-3xl" />;
    colorClass = 'from-emerald-500 to-teal-600';
    items = data.applications;
  } else if (type === 'interviews') {
    title = 'Scheduled Interviews';
    icon = <FaCalendarCheck className="text-3xl" />;
    colorClass = 'from-purple-500 to-fuchsia-600';
    items = data.applications.filter(a => a.status === 'interview scheduled');
  } else if (type === 'hires') {
    title = 'Recent Hires';
    icon = <FaChartLine className="text-3xl" />;
    colorClass = 'from-amber-500 to-orange-600';
    items = data.applications.filter(a => a.status === 'hired');
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleWithdrawJob = async (e, jobId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to withdraw and delete this job posting?')) return;
    setActionLoading(jobId);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}`);
      setData(prev => ({ ...prev, jobs: prev.jobs.filter(j => j._id !== jobId) }));
    } catch (err) {
      console.error("Failed to delete job", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdrawApplication = async (e, app) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to withdraw/reject ${app.seekerName}?`)) return;
    setActionLoading(app._id);
    try {
      const jobId = app.jobId?._id || app.jobId;
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/applicant`, { params: { jobId, email: app.seekerEmail } });
      await axios.put(`${import.meta.env.VITE_API_URL}/api/applicant/status`, {
        jobId, email: app.seekerEmail, status: "rejected"
      });
      setData(prev => ({ ...prev, applications: prev.applications.filter(a => a._id !== app._id) }));
    } catch (err) {
      console.error("Failed to withdraw application", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 lg:px-12 bg-transparent font-sans overflow-hidden relative">
      {/* Background Orbs */}
      <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br ${colorClass} opacity-10 dark:opacity-20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3`} />
      <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr ${colorClass} opacity-10 dark:opacity-20 blur-[100px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3`} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={() => navigate('/d')}
            className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:-translate-x-1"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <motion.div layoutId={`stat-card-${type}`} className="flex items-center gap-6 p-4 md:p-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] shadow-xl w-full max-w-2xl">
            <motion.div layoutId={`stat-icon-${type}`} className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-xl shadow-current/30`}>
              {icon}
            </motion.div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-1">{items.length} {items.length === 1 ? 'Record' : 'Records'} Found</p>
            </div>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <FaSpinner className="animate-spin text-5xl text-indigo-500" />
            <p className="text-lg font-bold text-slate-500">Loading comprehensive analytics...</p>
          </div>
        ) : items.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center shadow-2xl">
            <div className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${colorClass} opacity-20 flex items-center justify-center mb-6`}>
              {icon}
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">No Data Available</h3>
            <p className="text-xl text-slate-500 max-w-md">There are currently no records for {title.toLowerCase()}. As activity increases, insights will populate here.</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {type === 'jobs' && items.map(job => (
              <motion.div key={job._id} variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all group hover:-translate-y-2 cursor-pointer" onClick={() => navigate(`/applicant/${job._id}`)}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} opacity-20 flex items-center justify-center text-2xl group-hover:opacity-100 group-hover:text-white transition-all`}>
                    <FaBriefcase className={`text-blue-600 group-hover:text-white transition-colors`} />
                  </div>
                  <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-sm">{job.type}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{job.title}</h3>
                <div className="space-y-2 text-slate-600 dark:text-slate-400 font-medium">
                  <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-slate-400" /> {job.location}</p>
                  <p className="flex items-center gap-2"><FaChartLine className="text-slate-400" /> {job.salary}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-sm text-slate-400">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-3">
                    <button onClick={(e) => handleWithdrawJob(e, job._id)} disabled={actionLoading === job._id} className="text-rose-500 font-bold text-sm hover:underline disabled:opacity-50">
                      {actionLoading === job._id ? '...' : 'Withdraw'}
                    </button>
                    <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline">View Applicants →</button>
                  </div>
                </div>
              </motion.div>
            ))}

            {type !== 'jobs' && items.map(app => (
              <motion.div key={app._id} variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all group hover:-translate-y-2 cursor-pointer" onClick={() => navigate(`/applicant/${app.jobId?._id || app.jobId}`)}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl font-black text-slate-900 dark:text-white border-2 border-transparent group-hover:border-indigo-500 transition-colors">
                      {app.seekerName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{app.seekerName}</h3>
                      <p className="text-sm text-slate-500 font-medium">{app.jobTitle}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <FaEnvelope className="text-indigo-500" /> <span className="truncate">{app.seekerEmail}</span>
                  </div>
                  {type === 'interviews' && (
                    <div className="flex items-center gap-3 text-sm text-purple-700 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-800/50">
                      <FaCalendarCheck /> Interview Scheduled
                    </div>
                  )}
                  {type === 'hires' && (
                    <div className="flex items-center gap-3 text-sm text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/50">
                      <FaChartLine /> Offer Accepted
                    </div>
                  )}
                  {type === 'applications' && (
                    <div className="flex items-center gap-3 text-sm text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                      <FaUsers /> Under Review
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={(e) => handleWithdrawApplication(e, app)} disabled={actionLoading === app._id} className="w-1/3 py-3.5 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition-colors disabled:opacity-50">
                    {actionLoading === app._id ? '...' : 'Withdraw'}
                  </button>
                  <button className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold rounded-xl transition-colors">
                    Review Candidate
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
