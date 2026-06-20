import React, { useState, useEffect } from 'react';
import {
  Edit as EditIcon, Delete as DeleteIcon, Undo, Redo,
  People, Work, BarChart as ChartIcon, AdminPanelSettings, Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

// Dynamic graph data will be computed in the component.

const StatCard = ({ title, icon: Icon, active, onClick, count }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${active ? 'shadow-[0_10px_30px_rgba(15,23,42,0.3)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.1)]' : 'shadow-lg hover:shadow-xl'}`}
    >
      {/* Animated Glowing Border Behind Active Card */}
      {active && (
        <div className="absolute inset-0 z-0 pointer-events-none rounded-2xl overflow-hidden">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
             style={{ willChange: 'transform' }}
             className="absolute inset-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(15,23,42,0.3)_360deg)] dark:bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.4)_360deg)] opacity-100"
           />
        </div>
      )}

      {/* Card Body */}
      <div className={`relative z-10 m-[1px] p-5 rounded-[15px] flex items-center gap-4 transition-colors duration-300 ${active ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-slate-800/80'}`}>
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-inner ${active ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
          <Icon fontSize="medium" />
        </div>
        <div>
          <h3 className="font-bold text-sm tracking-wide uppercase opacity-80">{title}</h3>
          {count !== undefined && <p className="text-2xl font-black">{count}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('users');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('All');
  const [jobSearch, setJobSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('All');

  const [editOpen, setEditOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', data: null });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, jobsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`)
        ]);
        setUsers(usersRes.data);
        setJobs(jobsRes.data);

        // Compute job postings analytics
        const grouped = {};
        jobsRes.data.forEach(job => {
          const d = new Date(job.createdAt || job.postedAt || Date.now());
          const month = d.toLocaleString('default', { month: 'short' });
          grouped[month] = (grouped[month] || 0) + 1;
        });
        
        let formattedData = Object.keys(grouped).map(m => ({ month: m, postings: grouped[m] }));
        // If no jobs exist, provide empty state
        if (formattedData.length === 0) {
          formattedData = [{ month: 'No Data', postings: 0 }];
        }
        setGraphData(formattedData);

      } catch {
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const confirmDelete = (type, data) => setConfirmDialog({ open: true, type, data });

  const handleConfirmedDelete = async () => {
    const { type, data } = confirmDialog;
    setConfirmDialog({ open: false });

    if (type === 'user') {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${data.email}`);
      setUsers(prev => {
        const updated = prev.filter(user => user.email !== data.email);
        setUndoStack(u => [...u, { type: 'user', data }]);
        return updated;
      });
      toast.success("User deleted successfully");
    }

    if (type === 'job') {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/jobs/${data._id}`);
      setJobs(prev => {
        const updated = prev.filter(job => job._id !== data._id);
        setUndoStack(u => [...u, { type: 'job-delete', data }]);
        return updated;
      });
      toast.success("Job deleted successfully");
    }
  };

  const handleEditClick = (job) => {
    setEditJob({ ...job });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    const original = jobs.find(j => j._id === editJob._id);
    const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/jobs/${editJob._id}`, {
      title: editJob.title,
      company: editJob.company
    });
    setJobs(prev => prev.map(j => j._id === editJob._id ? res.data : j));
    setUndoStack(u => [...u, { type: 'job-edit', before: original, after: res.data }]);
    toast.success("Job updated successfully");
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

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, type: 'spring' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="relative min-h-screen font-sans py-32 px-4 sm:px-8">
      <ToastContainer position="bottom-right" theme="dark" />

      {/* Interactive Fluid Background (Monochrome Theme) - Optimized for Performance */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ willChange: 'transform' }}
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-slate-400/10 dark:bg-slate-600/10 blur-[100px]"
        />
        <motion.div 
          animate={{ rotate: [360, 0], scale: [1, 1.5, 1] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ willChange: 'transform' }}
          className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-zinc-300/10 dark:bg-zinc-700/10 blur-[120px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-[95%] 2xl:max-w-screen-2xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.3)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.1)] transform -rotate-3">
              <AdminPanelSettings fontSize="large" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Command Center</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">System administration and overview</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleUndo} 
              disabled={undoStack.length === 0} 
              className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Undo"
            >
              <Undo />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={redoStack.length === 0} 
              className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Redo"
            >
              <Redo />
            </button>
            <button 
              onClick={() => navigate('/adl')} 
              className="px-6 py-3 ml-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-900/50 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              Exit Admin
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="col-span-1 flex flex-col gap-4">
            <StatCard 
              title="Users Management" 
              icon={People} 
              count={users.length}
              active={activeSection === 'users'} 
              onClick={() => setActiveSection('users')} 
            />
            <StatCard 
              title="Job Postings" 
              icon={Work} 
              count={jobs.length}
              active={activeSection === 'jobs'} 
              onClick={() => setActiveSection('jobs')} 
            />
            <StatCard 
              title="Analytics" 
              icon={ChartIcon} 
              active={activeSection === 'analytics'} 
              onClick={() => setActiveSection('analytics')} 
            />
          </div>

          {/* Main Content Area */}
          <div className="col-span-1 lg:col-span-3">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/60 dark:border-slate-700/50 rounded-[2rem] p-6 sm:p-10 shadow-xl min-h-[600px] relative overflow-hidden">
              
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900 dark:border-white"></div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {activeSection === 'users' && (
                    <motion.div key="users" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Accounts</h2>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <input 
                            type="text" 
                            placeholder="Search name or email..." 
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="px-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 text-sm w-full sm:w-64"
                          />
                          <select 
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            className="px-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 text-sm"
                          >
                            <option value="All">All Roles</option>
                            <option value="Employer">Employer</option>
                            <option value="Job Seeker">Job Seeker</option>
                          </select>
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                              {['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                                <th key={h} className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {users
                              .filter(u => userFilter === 'All' || (userFilter.toLowerCase() === u.type.toLowerCase()))
                              .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                              .map((user, i) => (
                              <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-white/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-200">{user.name}</td>
                                <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{user.email}</td>
                                <td className="py-4 px-6">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.type === 'employer' || user.type === 'Employer' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                    {user.type}
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <span className="px-3 py-1 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">Active</span>
                                </td>
                                <td className="py-4 px-6">
                                  <button onClick={() => confirmDelete('user', user)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                                    <DeleteIcon fontSize="small" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === 'jobs' && (
                    <motion.div key="jobs" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Job Postings</h2>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <input 
                            type="text" 
                            placeholder="Search title or company..." 
                            value={jobSearch}
                            onChange={(e) => setJobSearch(e.target.value)}
                            className="px-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 text-sm w-full sm:w-64"
                          />
                          <select 
                            value={jobFilter}
                            onChange={(e) => setJobFilter(e.target.value)}
                            className="px-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 text-sm"
                          >
                            <option value="All">All Jobs</option>
                            <option value="Active">Active</option>
                          </select>
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                              {['Job Title', 'Company', 'Status', 'Actions'].map(h => (
                                <th key={h} className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {jobs
                              .filter(j => j.title.toLowerCase().includes(jobSearch.toLowerCase()) || j.company.toLowerCase().includes(jobSearch.toLowerCase()))
                              .map((job, i) => (
                              <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-white/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-200">{job.title}</td>
                                <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{job.company}</td>
                                <td className="py-4 px-6">
                                  <span className="px-3 py-1 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">Active</span>
                                </td>
                                <td className="py-4 px-6 flex items-center gap-2">
                                  <button onClick={() => handleEditClick(job)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                    <EditIcon fontSize="small" />
                                  </button>
                                  <button onClick={() => confirmDelete('job', job)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                                    <DeleteIcon fontSize="small" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === 'analytics' && (
                    <motion.div key="analytics" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Platform Analytics</h2>
                      <div className="p-6 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                            <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <RechartsTooltip 
                              cursor={{ fill: 'rgba(100,116,139,0.1)' }}
                              contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 16px' }}
                              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="postings" fill="currentColor" className="fill-slate-800 dark:fill-slate-200" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Framer Motion Dialog: Confirm Delete */}
      <AnimatePresence>
        {confirmDialog.open && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDialog({ open: false })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
                    <DeleteIcon />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Deletion</h3>
                </div>
                <button onClick={() => setConfirmDialog({ open: false })} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <Close />
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Are you sure you want to permanently delete this {confirmDialog.type}? This action cannot be undone unless you use the Undo button immediately.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmDialog({ open: false })} className="px-5 py-2.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={handleConfirmedDelete} className="px-5 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-lg shadow-rose-500/30">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Framer Motion Dialog: Edit Job */}
      <AnimatePresence>
        {editOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <EditIcon />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Job Details</h3>
                </div>
                <button onClick={() => setEditOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <Close />
                </button>
              </div>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                  <input 
                    type="text" 
                    value={editJob?.title || ''} 
                    onChange={(e) => setEditJob({ ...editJob, title: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-slate-900 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Company</label>
                  <input 
                    type="text" 
                    value={editJob?.company || ''} 
                    onChange={(e) => setEditJob({ ...editJob, company: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-slate-900 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setEditOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="px-5 py-2.5 font-bold text-white dark:text-slate-900 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl transition-colors shadow-lg shadow-slate-900/20 dark:shadow-white/10">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
