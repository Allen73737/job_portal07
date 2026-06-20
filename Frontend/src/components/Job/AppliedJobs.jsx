import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import ResumeModal from './ResumeModal';
import { 
  FaArrowLeft, FaCalendarAlt, FaBuilding, FaMapMarkerAlt, 
  FaMoneyBillWave, FaClock, FaDownload, FaGlobe, FaTimes, FaBriefcase, FaChevronDown, FaFileAlt
} from 'react-icons/fa';

function getGoogleCalendarLink({ title, date, time, link, message }) {
  if (!date || !time) return "#";
  const start = new Date(`${date}T${time}`).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(new Date(`${date}T${time}`).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const details = encodeURIComponent([message, link].filter(Boolean).join('\n'));
  return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(title + " Interview")}&dates=${start}/${end}&details=${details}`;
}

const InterviewModal = ({ open, onClose, details }) => {
  if (!details || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 50, rotateX: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20, rotateX: -10 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/20 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 to-teal-500" />
        
        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-1 block">Good News!</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Interview Details</h3>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-10 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-400 block mb-2 text-sm uppercase tracking-wider">Date</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{details.interviewDate || "N/A"}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-400 block mb-2 text-sm uppercase tracking-wider">Time</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{details.interviewTime || "N/A"}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="font-bold text-slate-400 text-sm uppercase tracking-wider">Mode</span>
            <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl border border-emerald-200 dark:border-emerald-500/30">
              {details.mode || "N/A"}
            </span>
          </div>

          {details.link && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="font-bold text-slate-400 text-sm uppercase tracking-wider shrink-0">Meeting Link</span>
              <a href={details.link} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-bold break-all bg-primary-50 dark:bg-primary-900/20 px-4 py-3 rounded-xl border border-primary-100 dark:border-primary-900/50 text-center w-full sm:w-auto transition-colors">
                {details.link}
              </a>
            </div>
          )}

          {details.message && (
            <div>
              <span className="font-bold text-slate-400 block mb-3 text-sm uppercase tracking-wider">Message from Employer</span>
              <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                <p className="text-slate-700 dark:text-slate-300 italic text-lg leading-relaxed">"{details.message}"</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 pt-0">
          <a 
            href={getGoogleCalendarLink({
              title: "Interview",
              date: details.interviewDate,
              time: details.interviewTime,
              link: details.link,
              message: details.message
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
          >
            <FaCalendarAlt size={22} /> Add to Google Calendar
          </a>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default function AppliedJobs() {
  const [jobs, setJobs] = useState([]);
  const [modalDetails, setModalDetails] = useState(null);
  const [sortBy, setSortBy] = useState("");
  const [filterOnlyShortlisted, setFilterOnlyShortlisted] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [previewResumeUrl, setPreviewResumeUrl] = useState(null);
  const [resumeToDownload, setResumeToDownload] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const fetchApplications = () => {
    const email = localStorage.getItem("email");
    if (!email) {
      alert("You must be logged in!");
      navigate('/');
      return;
    }

    axios.get(`${import.meta.env.VITE_API_URL}/api/applied-jobs?email=${email}`)
      .then((res) => {
        const jobs = res.data;
        axios.get(`${import.meta.env.VITE_API_URL}/api/interviews?email=${email}`)
          .then((interviewRes) => {
            const interviews = interviewRes.data;
            const merged = jobs.map(job => {
              const interview = interviews.find(inv => inv.jobId?._id === job._id);
              if (interview || job.status === "interview scheduled" || job.status === "shortlisted") {
                return { ...job, status: "interview scheduled", interviewDetails: interview || job.interviewDetails };
              }
              return job;
            });
            setJobs(merged);
          })
          .catch(err => {
            console.error("Failed to fetch interviews", err);
            setJobs(jobs);
          });
      })
      .catch((err) => console.error("Failed to fetch applied jobs", err));
  };

  useEffect(() => {
    // Parse URL params for auto-filtering
    const params = new URLSearchParams(location.search);
    if (params.get('filter') === 'shortlisted') {
      setFilterOnlyShortlisted(true);
      setSortBy('interview');
    }

    fetchApplications();

    // Sockets setup
    const socket = io(import.meta.env.VITE_API_URL);
    const userEmail = localStorage.getItem("email");

    socket.on('application-updated', (data) => {
      if (data.email === userEmail) {
        fetchApplications();
      }
    });

    return () => socket.disconnect();
  }, [navigate, location.search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [previewResumeData, setPreviewResumeData] = useState(null);

  const handlePreviewResume = (resume) => {
    if (!resume || !resume.data) return;
    const byteArray = new Uint8Array(resume.data.data);
    setPreviewResumeData(byteArray);
    setResumeToDownload(resume);
    setIsResumeModalOpen(true);
  };

  const executeDownload = () => {
    if (!resumeToDownload) return;
    const blob = new Blob([Uint8Array.from(resumeToDownload.data.data)], { type: resumeToDownload.contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resumeToDownload.fileName || "resume.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSalary = (salary) => {
    if (!salary) return "Competitive";
    return salary.includes("₹") ? salary : `₹${salary}`;
  };

  const handleWithdraw = (jobId) => {
    const email = localStorage.getItem("email");
    if (!email) return alert("Not logged in");

    if (window.confirm("Are you sure you want to withdraw your application for this job?")) {
      axios.delete(`${import.meta.env.VITE_API_URL}/api/withdraw-application`, {
        data: { jobId, email },
      })
        .then(() => setJobs(jobs.filter(job => job._id !== jobId)))
        .catch((err) => console.error("Failed to withdraw application", err));
    }
  };

  const sortedJobs = useMemo(() => {
    let sorted = [...jobs];
    if (filterOnlyShortlisted) {
      sorted = sorted.filter(job => job.status === "interview scheduled" || job.status === "shortlisted");
    }
    const sortKey = sortBy || "appliedAt";
    
    if (sortKey === "interview") {
      return sorted.sort((a, b) => {
        if (a.status === "interview scheduled" && b.status !== "interview scheduled") return -1;
        if (b.status === "interview scheduled" && a.status !== "interview scheduled") return 1;
        return 0;
      });
    }
    if (sortKey === "appliedAt") {
      return sorted.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    }
    if (sortKey === "company") {
      return sorted.sort((a, b) => (a.company || "").localeCompare(b.company || ""));
    }
    return sorted;
  }, [jobs, sortBy]);

  // Mouse spotlight effect logic for cards
  const handleMouseMove = (e) => {
    const cards = document.querySelectorAll('.job-card');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring', stiffness: 80 } }
  };

  const sortOptions = {
    "": "Sort applications...",
    "appliedAt": "Newest First",
    "interview": "Shortlisted First",
    "company": "Company (A-Z)"
  };

  return (
    <div 
      className="relative min-h-screen font-sans bg-transparent pt-28 pb-20 px-4 sm:px-8 xl:px-16 overflow-hidden selection:bg-primary-500/30"
      onMouseMove={handleMouseMove}
    >
      {/* Cinematic Background Orbs (Hardware Accelerated) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ willChange: 'transform' }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-emerald-400/10 dark:bg-emerald-600/10 blur-[120px]"
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.2, 1] }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} style={{ willChange: 'transform' }}
          className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-screen-2xl mx-auto">
        
        {/* Floating Header Panel */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2rem] p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)]"
        >
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate('/job')}
              className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <FaArrowLeft className="text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Applications</h1>
              <p className="text-primary-600 dark:text-primary-400 font-bold">Total Active: {jobs.length}</p>
            </div>
          </div>
          
          <div className="w-full md:w-72 relative z-50" ref={dropdownRef}>
            <div 
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="relative flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 rounded-2xl px-5 h-14 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-inner"
            >
              <span className={`font-bold ${sortBy ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {sortOptions[sortBy]}
              </span>
              <FaChevronDown className={`text-slate-400 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            
            <AnimatePresence>
              {isSortDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  {Object.entries(sortOptions).map(([value, label]) => (
                    <div 
                      key={value}
                      onClick={() => { setSortBy(value); setIsSortDropdownOpen(false); }}
                      className={`px-5 py-4 cursor-pointer font-bold border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${sortBy === value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      {label}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Massive 2-Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <AnimatePresence>
            {sortedJobs.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-slate-900/20 backdrop-blur-lg rounded-[3rem] border border-white/20">
                <div className="w-24 h-24 bg-slate-200/50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                  <FaBriefcase className="text-4xl text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Applications Yet</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">You haven't sent out any applications. Head back to the dashboard to find your dream job.</p>
                <button 
                  onClick={() => navigate('/job')}
                  className="mt-6 px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-all"
                >
                  Browse Jobs
                </button>
              </motion.div>
            )}

            {sortedJobs.map((job) => {
              const isInterview = job.status === "interview scheduled";
              const isRejected = job.status === "rejected";
              
              return (
                <motion.div 
                  key={job._id} 
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} layout
                  className="job-card relative group bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 flex flex-col h-full overflow-hidden transition-transform duration-500 hover:-translate-y-2 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                >
                  {/* Glowing Spotlight Effect */}
                  <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
                    style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.12), transparent 40%)` }}
                  />

                  {/* Massive Status Indicator Line */}
                  <div className={`absolute top-0 left-0 w-full h-2 opacity-90 ${isInterview ? 'bg-emerald-500' : isRejected ? 'bg-rose-500' : 'bg-primary-500'}`} />

                  {/* Top Bar: Company & Journey Tracker */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 relative z-10 gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                        <FaBuilding className="text-3xl text-slate-500 dark:text-slate-400" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{job.company}</h4>
                        <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mt-1">
                          <FaMapMarkerAlt /> {job.location}
                        </span>
                      </div>
                    </div>
                    
                    {/* Sleek Journey Tracker */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      {isRejected ? (
                        <div className="flex items-center gap-2 px-3 py-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                          <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Rejected</span>
                        </div>
                      ) : (
                        <>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary-500 text-white shadow-md shadow-primary-500/30`}>1</div>
                          <div className={`w-6 h-1 rounded-full ${["shortlisted", "interview scheduled"].includes(job.status) ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${["shortlisted", "interview scheduled"].includes(job.status) ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>2</div>
                          <div className={`w-6 h-1 rounded-full ${job.status === "interview scheduled" ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${job.status === "interview scheduled" ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>3</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title & Tags */}
                  <div className="relative z-10 flex-grow mb-8">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-5 leading-tight">{job.title}</h3>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm">
                        <FaMoneyBillWave className="text-emerald-500 text-lg" /> {formatSalary(job.salary)}
                      </span>
                      <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm">
                        <FaClock className="text-primary-500 text-lg" /> {job.appliedAt ? new Date(job.appliedAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Links / Resumes */}
                  <div className="flex gap-3 mb-8 relative z-10">
                    {job.resume && (
                      <button onClick={() => handlePreviewResume(job.resume)} className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <FaFileAlt /> View Resume
                      </button>
                    )}
                    {job.companyWebsite && (
                      <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <FaGlobe /> Website
                      </a>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="relative z-10 mt-auto flex flex-col sm:flex-row gap-4">
                    {isInterview && job.interviewDetails && (
                      <button 
                        onClick={() => setModalDetails(job.interviewDetails)}
                        className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(16,185,129,0.4)]"
                      >
                        View Interview Invite
                      </button>
                    )}
                    <button 
                      onClick={() => handleWithdraw(job._id)}
                      className={`py-4 px-6 bg-white dark:bg-slate-800 border-2 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors ${isInterview && job.interviewDetails ? 'sm:w-auto w-full' : 'w-full'}`}
                    >
                      Withdraw
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {modalDetails && (
          <InterviewModal 
            open={!!modalDetails} 
            details={modalDetails} 
            onClose={() => setModalDetails(null)} 
          />
        )}
        <ResumeModal 
          open={isResumeModalOpen} 
          onClose={() => setIsResumeModalOpen(false)} 
          resumeData={previewResumeData} 
          resumeFileName={resumeToDownload?.fileName || "Resume"}
          onDownload={executeDownload} 
        />
      </AnimatePresence>
    </div>
  );
}
