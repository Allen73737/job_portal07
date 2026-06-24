import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FaSearch, FaMapMarkerAlt, FaBuilding, FaMoneyBillWave, FaArrowLeft, FaFilter, FaBriefcase, FaStar, FaCopy, FaTimes } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const JobCard = ({ 
  job, 
  isApplied, 
  handleApply, 
  handleGeneratePrep, 
  handleGeneratePitch, 
  handleGenerateCL, 
  generatingPrepId, 
  generatingPitchId, 
  generatingClId 
}) => {
  const cardRef = useRef(null);
  const rectRef = useRef(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
  };

  const handleMouseMove = (e) => {
    if (!rectRef.current && cardRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
    if (rectRef.current) {
      const x = e.clientX - rectRef.current.left;
      const y = e.clientY - rectRef.current.top;
      cardRef.current.style.setProperty('--mouse-x', `${x}px`);
      cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
  };

  return (
    <motion.div 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="all-job-card relative group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col shadow-xl hover:shadow-2xl shadow-slate-200/50 hover:shadow-slate-300/50 dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-2 overflow-hidden"
    >
      {/* Glowing Spotlight Effect */}
      <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.15), transparent 40%)` }}
      />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden flex items-center justify-center p-2 shadow-inner">
          {job.companyLogo ? (
            <img src={`data:${job.companyLogo.contentType};base64,${job.companyLogo.data}`} alt="logo" className="w-full h-full object-contain" />
          ) : (
            <FaBuilding className="text-2xl text-slate-300 dark:text-slate-600" />
          )}
        </div>
        <div className="px-4 py-1.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full text-xs font-black uppercase tracking-widest border border-primary-100 dark:border-primary-500/20">
          {job.jobType || 'Full Time'}
        </div>
      </div>

      <div className="relative z-10 mb-8 flex-1">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2 tracking-tight group-hover:text-primary-500 transition-colors">{job.title}</h3>
        <p className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-4">{job.company}</p>
        
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
            <FaMapMarkerAlt className="text-slate-400" /> {job.location || 'Remote'}
          </span>
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-bold flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-500/20">
            <FaMoneyBillWave className="text-emerald-500" /> ₹{job.salary || 'Competitive'}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleApply(job._id)}
          disabled={isApplied}
          className={`relative z-10 flex-1 py-4 rounded-xl font-bold text-sm transition-all duration-300 ${
            isApplied 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700' 
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary-600 dark:hover:bg-primary-500 hover:text-white shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:shadow-primary-500/30 hover:-translate-y-1'
          }`}
        >
          {isApplied ? 'Application Sent' : 'Apply Now'}
        </button>
        {isApplied ? (
          <button
            onClick={() => handleGeneratePrep(job)}
            disabled={generatingPrepId === job._id}
            className="relative z-10 px-5 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-bold flex items-center justify-center transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-wait group"
            title="Generate Interview Prep via AI"
          >
            {generatingPrepId === job._id ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <FaBriefcase className="text-xl group-hover:-translate-y-1 transition-transform" />
            )}
          </button>
        ) : (
          <>
            <button
              onClick={() => handleGeneratePitch(job)}
              disabled={generatingPitchId === job._id}
              className="relative z-10 px-5 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-bold flex items-center justify-center transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-wait group"
              title="Generate Custom Pitch via AI"
            >
              {generatingPitchId === job._id ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <FaStar className="text-xl group-hover:rotate-12 transition-transform" />
              )}
            </button>
            <button
              onClick={() => handleGenerateCL(job)}
              disabled={generatingClId === job._id}
              className="relative z-10 px-5 bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white rounded-xl font-bold flex items-center justify-center transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-pink-500/30 disabled:opacity-70 disabled:cursor-wait group"
              title="Generate Cover Letter via AI"
            >
              {generatingClId === job._id ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <FaBriefcase className="text-xl group-hover:-translate-y-1 transition-transform" />
              )}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default function AllJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState(0);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [generatingPitchId, setGeneratingPitchId] = useState(null);
  const [pitchModalData, setPitchModalData] = useState(null); // { pitch: string, jobCompany: string }
  const [generatingPrepId, setGeneratingPrepId] = useState(null);
  const [prepModalData, setPrepModalData] = useState(null); // { questions: [], jobCompany: string }
  const [generatingClId, setGeneratingClId] = useState(null);
  const [clModalData, setClModalData] = useState(null); // { coverLetter: string, jobCompany: string }
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search');
    if (searchQuery) {
      setSearch(searchQuery);
    }
  }, [location.search]);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`)
      .then((res) => {
        setJobs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    const userEmail = localStorage.getItem("email");
    if (userEmail) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/applied-jobs?email=${userEmail}`)
        .then(res => setAppliedJobIds(res.data.map(j => j._id)))
        .catch(err => console.error(err));
      
      axios.get(`${import.meta.env.VITE_API_URL}/api/seeker/profile?email=${userEmail}`)
        .then(res => { if(res.data) setUserProfile(res.data) })
        .catch(err => console.error(err));
    }
  }, []);

  const handleApply = (jobId) => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      toast.warning('You must be logged in to apply! Redirecting...');
      setTimeout(() => navigate('/j'), 1500);
      return;
    }

    axios.post(`${import.meta.env.VITE_API_URL}/api/apply`, { jobId, userEmail })
      .then(() => {
        setAppliedJobIds(prev => [...prev, jobId]);
        toast.success('Successfully Applied!');
      })
      .catch((err) => {
        if (err.response?.status === 409) toast.info('Already Applied!');
        else toast.error('Something went wrong!');
      });
  };

  const handleGeneratePitch = async (job) => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      toast.warning('Sign in to unlock AI features! Redirecting...');
      setTimeout(() => navigate('/j'), 1500);
      return;
    }
    setGeneratingPitchId(job._id);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/pitch`, {
        userProfile,
        job
      });
      setPitchModalData({ pitch: res.data.pitch, jobCompany: job.company });
    } catch (err) {
      toast.error('AI Pitch is offline right now.');
    } finally {
      setGeneratingPitchId(null);
    }
  };

  const handleGenerateCL = async (job) => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      toast.warning('Sign in to unlock AI features! Redirecting...');
      setTimeout(() => navigate('/j'), 1500);
      return;
    }
    setGeneratingClId(job._id);
    try {
      const safeBio = userProfile?.bio || "I am a driven professional.";
      const safeSkills = userProfile?.skills?.join(', ') || "";
      const resumeText = `Bio: ${safeBio}\nSkills: ${safeSkills}`;

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/cover-letter`, {
        resumeText,
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.description || job.title
      });
      setClModalData({ coverLetter: res.data.coverLetter, jobCompany: `${job.title} at ${job.company}` });
      toast.success('Cover Letter Generated!');
    } catch (err) {
      toast.error('AI Cover Letter generator failed.');
    } finally {
      setGeneratingClId(null);
    }
  };

  const handleGeneratePrep = async (job) => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      toast.warning('Sign in to unlock AI features! Redirecting...');
      setTimeout(() => navigate('/j'), 1500);
      return;
    }
    setGeneratingPrepId(job._id);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/interview-prep`, {
        userProfile,
        job
      });
      setPrepModalData({ questions: res.data.questions, jobCompany: job.company });
    } catch (error) {
      toast.error('AI Interview Prep is currently offline.');
    } finally {
      setGeneratingPrepId(null);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchLower = (search || '').toLowerCase();
      const titleLower = (job.title || '').toLowerCase();
      const companyLower = (job.company || '').toLowerCase();
      
      const matchesSearch = titleLower.includes(searchLower) || companyLower.includes(searchLower);
      
      const locFilterLower = (locationFilter || '').toLowerCase();
      const locLower = (job.location || '').toLowerCase();
      const matchesLocation = locFilterLower ? locLower.includes(locFilterLower) : true;
      
      const numericSalary = parseInt(String(job.salary || '').replace(/[^0-9]/g, ''), 10) || 0;
      const matchesSalary = salaryFilter ? numericSalary >= salaryFilter : true;
      
      return matchesSearch && matchesLocation && matchesSalary;
    });
  }, [jobs, search, locationFilter, salaryFilter]);

  return (
    <div 
      className="relative min-h-screen font-sans bg-transparent pt-28 pb-20 px-4 sm:px-8 xl:px-16 overflow-hidden selection:bg-primary-500/30"
    >
      <ToastContainer position="bottom-right" theme="dark" toastClassName="backdrop-blur-xl bg-slate-900/80 border border-white/10" />

      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-28 left-4 sm:left-8 z-50 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 group"
        aria-label="Go back"
      >
        <FaArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Hero Header */}
      <div className="relative z-10 max-w-screen-2xl mx-auto mb-12 flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center text-white shadow-xl mb-6 shadow-primary-500/30">
          <FaBriefcase size={28} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500">Opportunities</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
          Explore {jobs.length} premium roles tailored to your unique skill set.
        </motion.p>
      </div>

      {/* Sticky Premium Search & Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="sticky top-24 z-50 max-w-screen-2xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-4 mb-12 shadow-[0_20px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col lg:flex-row gap-4"
      >
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <FaSearch className="text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input 
            type="text" placeholder="Search by role or company..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl pl-12 pr-4 py-4 font-bold border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
          />
        </div>

        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <FaMapMarkerAlt className="text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input 
            type="text" placeholder="City, State, or Remote"
            value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl pl-12 pr-4 py-4 font-bold border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
          />
        </div>

        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <FaMoneyBillWave className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input 
            type="number" placeholder="Min Salary (e.g. 80000)"
            value={salaryFilter || ''} onChange={(e) => setSalaryFilter(Number(e.target.value))}
            className="w-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl pl-12 pr-4 py-4 font-bold border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
          />
        </div>
      </motion.div>

      {/* Jobs Grid */}
      <div className="relative z-10 max-w-screen-2xl mx-auto min-h-[50vh]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((skel) => (
              <div key={skel} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50" />
                  <div className="w-24 h-6 rounded-full bg-slate-200/50 dark:bg-slate-800/50" />
                </div>
                <div className="w-3/4 h-8 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg mb-4" />
                <div className="w-1/2 h-6 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg mb-8" />
                <div className="flex gap-2 mb-8">
                  <div className="w-24 h-8 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg" />
                  <div className="w-32 h-8 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg" />
                </div>
                <div className="mt-auto flex gap-2">
                  <div className="flex-1 h-12 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl" />
                  <div className="w-16 h-12 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-3xl backdrop-blur-md">
            <div className="inline-flex w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center mb-6">
              <FaSearch className="text-3xl text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No jobs found</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredJobs.map((job) => {
                const isApplied = appliedJobIds.includes(job._id);
                return (
                  <JobCard 
                    key={job._id}
                    job={job}
                    isApplied={isApplied}
                    handleApply={handleApply}
                    handleGeneratePrep={handleGeneratePrep}
                    handleGeneratePitch={handleGeneratePitch}
                    handleGenerateCL={handleGenerateCL}
                    generatingPrepId={generatingPrepId}
                    generatingPitchId={generatingPitchId}
                    generatingClId={generatingClId}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* AI Pitch Modal (Ultra Premium) */}
      {createPortal(
        <AnimatePresence>
          {pitchModalData && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-slate-900/80 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-[0_0_100px_rgba(99,102,241,0.2)] border border-white/10 relative overflow-hidden flex flex-col max-h-[85vh] backdrop-blur-2xl"
              >
                {/* Premium Glow Effects */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/30 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/20">
                        <FaStar className="text-xl" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Instant AI Pitch</h2>
                      <p className="text-sm font-bold text-indigo-400 mt-1 uppercase tracking-widest opacity-80">For {pitchModalData.jobCompany}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPitchModalData(null)}
                    className="text-white/50 hover:text-white transition-all w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 hover:rotate-90"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-8 pr-2 custom-scrollbar relative z-10">
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-inner backdrop-blur-md relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-slate-200 whitespace-pre-wrap font-medium leading-relaxed text-lg">
                      {pitchModalData.pitch}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pitchModalData.pitch).then(() => {
                        toast.success('Pitch copied to clipboard!');
                      });
                    }}
                    className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:-translate-y-1"
                  >
                    <FaCopy /> Copy Pitch to Clipboard
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* AI Interview Prep Modal (Ultra Premium) */}
      {createPortal(
        <AnimatePresence>
          {prepModalData && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-slate-900/80 rounded-[2.5rem] p-8 max-w-3xl w-full shadow-[0_0_100px_rgba(16,185,129,0.2)] border border-white/10 relative overflow-hidden flex flex-col max-h-[85vh] backdrop-blur-2xl"
              >
                {/* Premium Glow Effects */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-white/20">
                        <FaBriefcase className="text-xl" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">AI Interview Prep</h2>
                      <p className="text-sm font-bold text-emerald-400 mt-1 uppercase tracking-widest opacity-80">For {prepModalData.jobCompany}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPrepModalData(null)}
                    className="text-white/50 hover:text-white transition-all w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 hover:rotate-90"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-4 pr-2 custom-scrollbar relative z-10 space-y-6">
                  {prepModalData.questions.map((item, idx) => (
                    <div key={idx} className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner backdrop-blur-md relative group">
                      <div className="absolute top-6 -left-3 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-black text-slate-900 border-2 border-slate-900 shadow-md">
                        {idx + 1}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3 ml-4">{item.question}</h3>
                      <div className="ml-4 p-4 rounded-2xl bg-black/30 border border-emerald-500/20 text-emerald-50 text-sm leading-relaxed">
                        <span className="font-black text-emerald-400 block mb-1">AI Tip:</span>
                        {item.tip}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
