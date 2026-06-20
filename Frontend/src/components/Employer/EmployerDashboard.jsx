import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import {
  FaEdit, FaTrash, FaBriefcase, FaUsers, FaCalendarCheck, FaEye,
  FaMapMarkerAlt, FaBuilding, FaDollarSign, FaClock, FaChartLine,
  FaPlus, FaSearch, FaSpinner, FaTimes, FaEnvelope, FaRobot, FaLightbulb
} from 'react-icons/fa';


const EmployerDashboard = () => {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    hiresThisMonth: 0, 
  });
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [employer, setEmployer] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  

  // AI Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const nav = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('employer'));
    if (!stored || !stored.email) {
      nav('/e');
      return;
    }
    setEmployer(stored);
    loadDashboardData(stored.email);
  }, [nav]);

  const loadDashboardData = async (email) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employer/dashboard-data?email=${email}`);
      const fetchedJobs = res.data.jobs || [];
      const fetchedApps = res.data.applications || [];
      
      setJobs(fetchedJobs);
      setApplications(fetchedApps);
      
      const interviewsCount = fetchedApps.filter(a => a.status === 'interview scheduled').length;
      const hiresCount = fetchedApps.filter(a => a.status === 'hired').length;

      setStats({ 
        activeJobs: fetchedJobs.length, 
        totalApplications: fetchedApps.length, 
        interviewsScheduled: interviewsCount, 
        hiresThisMonth: hiresCount 
      });
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const delJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`);
      loadDashboardData(employer.email);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 40, opacity: 0, scale: 0.95 }, visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 60, damping: 15 } } };

  const generateAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const statsData = `Active Jobs: ${stats.activeJobs}, Total Applications: ${stats.totalApplications}, Interviews Scheduled: ${stats.interviewsScheduled}, Hires: ${stats.hiresThisMonth}`;
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/hiring-analytics`, { statsData });
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to generate analytics", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };



  return (
    <div className="min-h-screen pt-32 pb-20 px-6 lg:px-16 2xl:px-32 bg-transparent font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-500/5 blur-[100px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible" 
        className="max-w-7xl mx-auto relative z-10"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
              Welcome back, <span className="text-emerald-600 dark:text-emerald-400 font-bold">{employer.company || 'TechCorp Inc.'}</span>
            </p>
          </div>
          <button
            onClick={() => nav('/job-post')}
            className="group relative px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:scale-[1.02] flex items-center justify-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            <FaPlus className="relative z-10 group-hover:rotate-90 transition-transform duration-500" />
            <span className="relative z-10">Post New Job</span>
          </button>
        </motion.div>

        {/* Stock Terminal Live Feed Ticker */}
        <div className="w-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl mb-12 flex relative z-10 border border-slate-700">
          <div className="bg-indigo-600 px-6 py-3 font-black uppercase tracking-widest text-xs flex items-center z-10 shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" /> Live Feed
          </div>
          <div className="flex-1 overflow-hidden flex items-center whitespace-nowrap">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 25, repeat: Infinity }}
              className="flex gap-8 px-8 items-center"
            >
              {[...applications, ...applications, ...applications].slice(0, 10).map((app, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium border-r border-slate-700 pr-8">
                  <span className="text-indigo-400">{app.seekerName || 'Candidate'}</span>
                  <span className="text-slate-400">applied for</span>
                  <span className="text-emerald-400 font-bold">{app.jobTitle || 'Role'}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase ml-2">{app.status || 'Pending'}</span>
                </div>
              ))}
              {applications.length === 0 && (
                <span className="text-slate-500 font-medium">Awaiting first applications. Broadcast your jobs to attract elite talent.</span>
              )}
            </motion.div>
          </div>
        </div>

        {/* Spatial Floating Stats Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { id: 'jobs', icon: FaBriefcase, value: stats.activeJobs, label: 'Active Jobs', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20', text: 'text-emerald-500' },
            { id: 'applications', icon: FaUsers, value: stats.totalApplications, label: 'Total Applications', color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/20', text: 'text-blue-500' },
            { id: 'interviews', icon: FaCalendarCheck, value: stats.interviewsScheduled, label: 'Interviews Scheduled', color: 'from-purple-400 to-pink-500', shadow: 'shadow-purple-500/20', text: 'text-purple-500' },
            { id: 'hires', icon: FaChartLine, value: stats.hiresThisMonth, label: 'Hires (All Time)', color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/20', text: 'text-amber-500' }
          ].map((stat, idx) => (
            <motion.div
              layoutId={`stat-card-${stat.id}`}
              key={idx}
              drag
              dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.1, zIndex: 50, rotate: 2 }}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => nav(`/employer/stats/${stat.id}`)}
              className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] p-6 shadow-xl ${stat.shadow} relative overflow-hidden group cursor-grab active:cursor-grabbing`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <div className="flex justify-between items-center relative z-10">
                <motion.div layoutId={`stat-icon-${stat.id}`} className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition-transform duration-300 pointer-events-none`}>
                  <stat.icon size={24} />
                </motion.div>
                <div className="text-right pointer-events-none">
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    <CountUp end={stat.value} duration={2} />
                  </h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* The "River" Application Timeline */}
        {applications.length > 0 && (
          <motion.div variants={itemVariants} className="mb-12 relative">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-2">
              <FaUsers className="text-blue-500" /> Live Application River
            </h2>
            <div className="w-full h-40 bg-slate-900 rounded-[2rem] p-6 flex items-center overflow-x-auto hide-scrollbar relative shadow-2xl border border-slate-800">
              {/* Glowing Water Base */}
              <div className="absolute inset-x-0 h-1 bg-blue-500/20 top-1/2 -translate-y-1/2 blur-sm" />
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent top-1/2 -translate-y-1/2" />
              
              <div className="flex items-center gap-8 px-4 relative z-10 min-w-max">
                {applications.slice(0, 15).map((app, i) => {
                  const getStatusColor = (s) => {
                    const st = s?.toLowerCase() || '';
                    if(st.includes('hired')) return 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]';
                    if(st.includes('interview')) return 'bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.8)]';
                    if(st.includes('shortlist')) return 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)]';
                    if(st.includes('reject')) return 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]';
                    return 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]';
                  };

                  return (
                    <div key={i} className="flex flex-col items-center group relative cursor-pointer hover:-translate-y-2 transition-transform">
                      <div className={`w-6 h-6 rounded-full border-2 border-slate-900 relative z-10 transition-all ${getStatusColor(app.status)}`} />
                      <div className="absolute top-8 text-center opacity-0 group-hover:opacity-100 transition-opacity w-32 pointer-events-none">
                        <div className="bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-lg">
                          {app.seekerName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{app.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Job Postings Panel */}
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <FaBriefcase className="text-emerald-500" /> Your Job Postings
            </h2>
            <div className="relative group w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search your jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 pl-12 pr-4 py-3.5 bg-slate-100 dark:bg-slate-900/50 border border-transparent focus:border-emerald-500/50 dark:focus:border-emerald-500/50 rounded-2xl outline-none text-slate-900 dark:text-white font-medium transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 justify-between animate-pulse">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between">
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                    </div>
                    <div className="space-y-2 pt-4">
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    </div>
                  </div>
                  <div className="lg:w-48 flex flex-col gap-3">
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <FaBriefcase className="text-4xl text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Jobs Found</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto mb-8">
                {searchTerm ? "We couldn't find any jobs matching your search." : "You haven't posted any jobs yet. Start building your team by posting an opportunity."}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => nav('/job-post')}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1"
                >
                  Post Your First Job
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {filteredJobs.map((job) => (
                  <motion.div
                    key={job._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 lg:p-8 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col lg:flex-row gap-8 justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 font-medium text-sm">
                            <span className="flex items-center gap-1.5"><FaBuilding /> {job.company}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className="flex items-center gap-1.5"><FaMapMarkerAlt /> {job.location}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><FaDollarSign /> {job.salary || 'Competitive'}</span>
                          </div>
                        </div>
                        <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest rounded-full border border-indigo-200 dark:border-indigo-500/20">
                          Active
                        </span>
                      </div>

                      <p className="text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4">
                        <button 
                          onClick={() => nav(`/applicant/${job._id}`)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold rounded-xl transition-colors"
                        >
                          <FaEye /> View Applications
                        </button>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                          <FaClock /> Posted {new Date(job.postedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-3 min-w-[140px]">
                      <button 
                        onClick={() => nav(`/job-post/${job._id}`)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white font-bold rounded-xl transition-all"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button 
                        onClick={() => delJob(job._id)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-600 hover:text-white font-bold rounded-xl transition-all"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
        
        {/* AI Hiring Analytics Section with Holographic 3D Visualization */}
        <motion.div variants={itemVariants} className="mt-12 bg-indigo-600 dark:bg-indigo-900/50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          
          <div className="relative z-10 lg:w-1/3 flex flex-col items-start">
            {/* Holographic 3D Crystal */}
            <div className="w-32 h-32 relative perspective-[1000px] mb-8 group">
              <motion.div
                animate={{ rotateY: 360, rotateX: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute inset-0 border-2 border-indigo-300/50 rounded-xl bg-indigo-400/20 backdrop-blur-sm" style={{ transform: 'translateZ(30px)' }} />
                <div className="absolute inset-0 border-2 border-white/50 rounded-full bg-white/10" style={{ transform: 'rotateY(45deg) translateZ(-30px)' }} />
                <div className="absolute inset-0 border-2 border-indigo-200/50 rounded-full bg-indigo-200/10" style={{ transform: 'rotateX(45deg) translateZ(0)' }} />
              </motion.div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-indigo-400/30 blur-md rounded-[100%]" />
            </div>

            <h2 className="text-3xl font-black text-white mb-4 flex items-center gap-3">
              AI Data Matrix
            </h2>
            <p className="text-indigo-200 font-medium mb-6">
              Get data-driven predictions and actionable advice based on your current recruitment metrics to optimize your hiring pipeline.
            </p>
            <button 
              onClick={generateAnalytics} 
              disabled={loadingAnalytics}
              className="px-6 py-3 bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl transition-colors shadow-lg disabled:opacity-70 flex items-center gap-2"
            >
              {loadingAnalytics ? <FaSpinner className="animate-spin" /> : <FaLightbulb />}
              {analytics ? "Refresh Insights" : "Generate Insights"}
            </button>
          </div>
          
          <div className="relative z-10 lg:w-2/3 w-full">
            {analytics ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white space-y-6">
                <div>
                  <h4 className="text-sm uppercase tracking-widest text-indigo-300 font-bold mb-2">Predictions</h4>
                  <p className="font-medium text-lg leading-relaxed">{analytics.predictions}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm uppercase tracking-widest text-indigo-300 font-bold mb-2">Key Insights</h4>
                    <ul className="list-disc list-inside space-y-1 text-indigo-100">
                      {analytics.insights?.map((i, idx) => <li key={idx}>{i}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm uppercase tracking-widest text-indigo-300 font-bold mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-indigo-100">
                      {analytics.recommendations?.map((r, idx) => <li key={idx}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                <FaChartLine className="text-4xl text-indigo-300/50 mb-4" />
                <p className="text-indigo-200 font-medium">Click the button to generate personalized hiring insights using our elite AI engine.</p>
              </div>
            )}
          </div>
        </motion.div>

      </motion.div>


      

    </div>
  );
};

export default EmployerDashboard;
