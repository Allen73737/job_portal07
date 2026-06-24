import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserCircle, FaSearch, FaBriefcase, FaBuilding, 
  FaMapMarkerAlt, FaFilter, FaMoneyBillWave, FaArrowRight, FaChevronDown,
  FaPaperPlane, FaStar, FaTimes, FaMagic, FaChartLine, FaSpinner
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import io from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

// Premium Mock Data
const radarData = [
  { subject: 'Technical Skills', A: 85, fullMark: 100 },
  { subject: 'Experience', A: 70, fullMark: 100 },
  { subject: 'Education', A: 90, fullMark: 100 },
  { subject: 'Presentation', A: 80, fullMark: 100 },
  { subject: 'Keywords', A: 65, fullMark: 100 },
];

const salaryData = [
  { month: 'Jan', value: 85000 },
  { month: 'Feb', value: 88000 },
  { month: 'Mar', value: 92000 },
  { month: 'Apr', value: 91000 },
  { month: 'May', value: 95000 },
  { month: 'Jun', value: 102000 },
];

const defaultRecruiterActivities = [
  "A recruiter from Google viewed your profile.",
  "Your resume ranks in the top 5% this week.",
  "New job matching your skills was posted 5m ago.",
  "You appeared in 12 search results yesterday.",
  "Microsoft is hiring for roles like yours."
];

const premiumSkills = [
  { name: 'React', jobs: 1240 },
  { name: 'Node.js', jobs: 850 },
  { name: 'UI/UX', jobs: 420 },
  { name: 'MongoDB', jobs: 610 },
  { name: 'Framer', jobs: 230 }
];

export default function JobSeekerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState(0);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [activeActivityIndex, setActiveActivityIndex] = useState(0);
  const [radarActivities, setRadarActivities] = useState(defaultRecruiterActivities);
  const [isNegotiatorOpen, setIsNegotiatorOpen] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [isAnalyzingMatches, setIsAnalyzingMatches] = useState(false);
  const [skillGapData, setSkillGapData] = useState(null);
  const [isAnalyzingSkills, setIsAnalyzingSkills] = useState(false);
  const [negotiatorMessages, setNegotiatorMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI HR Manager. Let's practice your salary negotiation. What's your counter-offer?" }
  ]);
  const [negotiatorInput, setNegotiatorInput] = useState("");
  const [isNegotiating, setIsNegotiating] = useState(false);
  const chatContainerRef = useRef(null);

  const handleAnalyzeSkills = async () => {
    if (!userProfile) return;
    setIsAnalyzingSkills(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/skill-gap`, {
        currentSkills: userProfile.skills || [],
        targetRole: "Senior Software Engineer" // Could be dynamic, defaulting for demo
      });
      setSkillGapData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to analyze skills.');
    } finally {
      setIsAnalyzingSkills(false);
    }
  };

  const handleNegotiatorSubmit = async (e) => {
    e.preventDefault();
    if (!negotiatorInput.trim()) return;
    
    const newMessages = [...negotiatorMessages, { role: 'user', content: negotiatorInput }];
    setNegotiatorMessages(newMessages);
    setNegotiatorInput('');
    setIsNegotiating(true);
    
    try {
      const safeProfile = { ...userProfile };
      delete safeProfile.resume;
      delete safeProfile.profilePhoto;
      
      const systemPrompt = `You are an HR Manager negotiating a salary with a candidate. 
The candidate's profile details: ${userProfile ? JSON.stringify(safeProfile) : 'Standard professional'}.
Be realistic, slightly tough, but professional. Keep your responses short (max 2 sentences). Start by offering slightly less than they want if they ask high, or accepting if reasonable. Do not use placeholders, be direct.`;
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
        messages: newMessages,
        systemPrompt
      });
      
      setNegotiatorMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (error) {
      toast.error('AI Negotiator is currently offline.');
    } finally {
      setIsNegotiating(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [negotiatorMessages, isNegotiating]);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Recruiter Radar Auto-Scroll
  useEffect(() => {
    if (!radarActivities || radarActivities.length === 0) return;
    const interval = setInterval(() => {
      setActiveActivityIndex(prev => (prev + 1) % radarActivities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [radarActivities]);

  const fetchJobsAndApplications = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`)
      .then((res) => setJobs(res.data))
      .catch((err) => console.error(err));

    const userEmail = localStorage.getItem("email");
    if (userEmail) {
      Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/applied-jobs?email=${userEmail}`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/interviews?email=${userEmail}`).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_URL}/api/seeker/profile?email=${userEmail}`).catch(() => ({ data: null }))
      ]).then(([jobsRes, interviewsRes, profileRes]) => {
        const applied = jobsRes.data;
        const interviews = interviewsRes.data;
        if (profileRes.data) setUserProfile(profileRes.data);
        
        setAppliedJobIds(applied.map(j => j._id));
        
        let shortListCount = 0;
        applied.forEach(job => {
          const hasInterview = interviews.some(inv => inv.jobId?._id === job._id);
          if (hasInterview || job.status === "interview scheduled" || job.status === "shortlisted") {
            shortListCount++;
          }
        });
        setShortlistedCount(shortListCount);

        // Fetch Real Radar Data
        axios.get(`${import.meta.env.VITE_API_URL}/api/seeker/activity-radar?email=${userEmail}`)
          .then(radarRes => {
            if (radarRes.data && radarRes.data.length > 0) {
              setRadarActivities(radarRes.data);
            }
          }).catch(err => console.error("Radar error:", err));

        // Fetch AI Matches
        if (profileRes.data && jobsRes.data.length > 0) {
          setIsAnalyzingMatches(true);
          const jobsForAi = jobsRes.data.slice(0, 6).map(j => ({
            title: j.title,
            company: j.company,
            location: j.location,
            description: j.description
          }));

          // Strip heavy payload fields
          const safeUserProfile = { ...profileRes.data };
          delete safeUserProfile.resume;
          delete safeUserProfile.profilePhoto;

          axios.post(`${import.meta.env.VITE_API_URL}/api/ai/match`, {
            userProfile: safeUserProfile,
            jobs: jobsForAi,
            email: userEmail
          }).then(matchRes => {
            setAiMatches(matchRes.data.matches || []);
          }).catch(err => console.error("AI Match Error:", err))
            .finally(() => setIsAnalyzingMatches(false));
        }

      }).catch(err => console.error(err));
    }
  };

  useEffect(() => {
    fetchJobsAndApplications();

    const socket = io(import.meta.env.VITE_API_URL);
    const userEmail = localStorage.getItem("email");

    socket.on('application-updated', (data) => {
      if (data.email === userEmail) {
        toast.info(`Status updated on one of your applications!`);
        fetchJobsAndApplications();
      }
    });

    return () => socket.disconnect();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCompanyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const companyOptions = useMemo(() => {
    const companies = jobs.map(j => j.company);
    return [...new Set(companies)].filter(Boolean);
  }, [jobs]);

  const maxSalary = useMemo(() => {
    let max = 0;
    jobs.forEach(job => {
      const match = String(job.salary).replace(/[^0-9]/g, '');
      if (match) {
        max = Math.max(max, parseInt(match, 10));
      }
    });
    return max || 100000;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchLower = search.toLowerCase();
      const matchesSearch = job.title?.toLowerCase().includes(searchLower) || job.company?.toLowerCase().includes(searchLower);
      const matchesCompany = companyFilter ? job.company === companyFilter : true;
      const numericSalary = parseInt(String(job.salary).replace(/[^0-9]/g, ''), 10) || 0;
      const matchesSalary = salaryFilter ? numericSalary >= salaryFilter : true;
      return matchesSearch && matchesCompany && matchesSalary;
    });
  }, [jobs, search, companyFilter, salaryFilter]);

  const handleApply = (jobId) => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      toast.warning('You must be logged in!');
      return;
    }

    axios.post(`${import.meta.env.VITE_API_URL}/api/apply`, { jobId, userEmail })
      .then(() => {
        setAppliedJobIds(prev => [...prev, jobId]);
        toast.success('Successfully Applied!');
      })
      .catch((err) => {
        if (err.response?.status === 409) {
          toast.info('Already Applied!');
        } else {
          toast.error('Something went wrong!');
        }
      });
  };

  const statCards = [
    { title: "Available Roles", count: jobs.length, icon: <FaBriefcase className="text-blue-500" size={24} />, onClick: () => navigate('/all-jobs') },
    { title: "Applications", count: appliedJobIds.length, icon: <FaPaperPlane className="text-emerald-500" size={24} />, onClick: () => navigate('/ap') },
    { title: "Shortlisted", count: shortlistedCount, icon: <FaStar className="text-amber-500" size={24} />, onClick: () => navigate('/ap?filter=shortlisted') }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring', stiffness: 80 } }
  };

  return (
    <div 
      className="relative min-h-screen font-sans bg-transparent pt-28 pb-20 px-4 sm:px-8 xl:px-16 overflow-hidden selection:bg-primary-500/30"
    >
      <ToastContainer position="bottom-right" theme="dark" toastClassName="backdrop-blur-xl bg-slate-900/80 border border-white/10" />

      {/* Sleek Minimalist Background (Apple-esque Glassmorphism) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-primary-500/5 to-transparent dark:from-primary-500/10" />
      </div>

      <div className="relative z-10 max-w-screen-2xl mx-auto">
        
        {/* Floating Header Panel */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2rem] p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)]"
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl blur-md opacity-50" />
              <div className="relative w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-white/20 overflow-hidden shadow-inner">
                {userProfile?.profilePhoto?.data ? (
                  <img src={`data:${userProfile.profilePhoto.contentType};base64,${userProfile.profilePhoto.data}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUserCircle className="text-4xl text-slate-400 dark:text-slate-500" />
                )}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome Back{userProfile?.name ? `, ${userProfile.name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Ready to find your next opportunity?</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/ap')}
              className="flex items-center gap-2 px-6 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group shadow-sm"
            >
              <FaBriefcase className="text-primary-500" />
              My Applications
              <FaArrowRight className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="w-12 h-12 flex items-center justify-center bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-colors"
              title="Profile Settings"
            >
              <FaUserCircle size={20} />
            </button>
          </div>
        </motion.div>

        {/* Stock Terminal Live Feed Ticker */}
        <div className="w-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl mb-12 flex relative z-10 border border-slate-700">
          <div className="bg-emerald-600 px-6 py-3 font-black uppercase tracking-widest text-xs flex items-center z-10 shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" /> Live Market
          </div>
          <div className="flex-1 overflow-hidden flex items-center whitespace-nowrap">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 35, repeat: Infinity }}
              className="flex gap-8 px-8 items-center"
            >
              {[...radarActivities, ...radarActivities, ...radarActivities].map((activity, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium border-r border-slate-700 pr-8">
                  <span className="text-emerald-400 font-bold">Activity:</span>
                  <span className="text-slate-300">{activity}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* iOS-Style Bento Widgets with Drag Physics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {statCards.map((stat, i) => (
            <motion.div 
              key={i} 
              drag
              dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.05, zIndex: 50, rotate: i % 2 === 0 ? 2 : -2 }}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}
              onClick={stat.onClick}
              className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl shadow-slate-200/50 hover:shadow-slate-300/50 dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] group cursor-grab active:cursor-grabbing transition-shadow duration-300"
            >
              <div className="flex justify-between items-start mb-4 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {stat.icon}
                </div>
                <FaArrowRight className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
              </div>
              <h3 className="text-4xl font-semibold text-slate-900 dark:text-white mb-1 tracking-tight pointer-events-none">{stat.count}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm pointer-events-none">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* The "River" Match Timeline */}
        {jobs.length > 0 && (
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-12 relative">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-2">
              <FaStar className="text-amber-500" /> Opportunity River
            </h2>
            <div className="w-full h-40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-6 flex items-center overflow-x-auto hide-scrollbar relative shadow-xl border border-slate-200/50 dark:border-slate-800/50">
              {/* Glowing River Base */}
              <div className="absolute inset-x-0 h-1 bg-amber-500/20 top-1/2 -translate-y-1/2 blur-sm" />
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent top-1/2 -translate-y-1/2" />
              
              <div className="flex items-center gap-12 px-8 relative z-10 min-w-max">
                {jobs.slice(0, 10).map((job, i) => {
                  const aiMatchData = aiMatches.find(m => m.jobIndex === i);
                  const isHot = aiMatchData && aiMatchData.matchScore > 80;

                  return (
                    <div key={i} className="flex flex-col items-center group relative cursor-pointer hover:-translate-y-2 transition-transform">
                      <div className={`w-8 h-8 rounded-full border-[3px] border-white dark:border-slate-900 relative z-10 transition-all ${isHot ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)] scale-125' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]'}`} />
                      <div className="absolute top-10 text-center opacity-0 group-hover:opacity-100 transition-opacity w-40 pointer-events-none z-20">
                        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-3 py-2 rounded-lg shadow-2xl">
                          <p className="line-clamp-1">{job.company}</p>
                          <p className="text-[10px] opacity-80 font-normal line-clamp-1 mt-0.5">{job.title}</p>
                        </div>
                        {isHot && <div className="text-[10px] text-amber-500 font-bold mt-1 uppercase tracking-wider">Top Match</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Smart Recommendations Carousel */}
        {jobs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Top Matches For You</h2>
                {isAnalyzingMatches && (
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-bold border border-indigo-500/20 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" /> Analyzing Market Fit...
                  </span>
                )}
              </div>
              <span onClick={() => navigate('/all-jobs')} className="text-sm font-medium text-primary-500 cursor-pointer hover:text-primary-600">View All</span>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar">
              {jobs.slice(0, 6).map((job, idx) => {
                const aiMatchData = aiMatches.find(m => m.jobIndex === idx);
                const matchScore = aiMatchData ? aiMatchData.matchScore : 50; 
                const isApplied = appliedJobIds.includes(job._id);

                return (
                  <motion.div 
                    key={job._id} 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}
                    className="min-w-[340px] max-w-[340px] snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl hover:shadow-2xl shadow-slate-200/50 hover:shadow-slate-300/50 dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-1 cursor-pointer flex flex-col relative overflow-hidden group"
                  >
                    {/* Glowing Accent */}
                    {aiMatchData && matchScore >= 80 && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
                    )}

                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                        {job.companyLogo ? (
                          <img src={`data:${job.companyLogo.contentType};base64,${job.companyLogo.data}`} alt="logo" className="w-full h-full object-contain" />
                        ) : (
                          <FaBuilding className="text-2xl text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={`px-3 py-1 rounded-full text-xs font-black tracking-widest border shadow-sm flex items-center gap-1 ${aiMatchData ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : (isAnalyzingMatches ? 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700')}`}>
                          {aiMatchData && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {aiMatchData ? `${matchScore}% AI MATCH` : (isAnalyzingMatches ? 'CALCULATING...' : 'PENDING MATCH')}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-1 line-clamp-2 min-h-[3.5rem] tracking-tight relative z-10">{job.title}</h3>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 relative z-10">{job.company}</p>

                    <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-bold flex items-center gap-1">
                        <FaMapMarkerAlt className="text-slate-400" /> {job.location || 'Remote'}
                      </span>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-bold flex items-center gap-1">
                        <FaMoneyBillWave className="text-slate-400" /> ₹{job.salary || 'Competitive'}
                      </span>
                    </div>

                    <div className="mt-auto mb-6 relative z-10">
                      {aiMatchData ? (
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                          <span className="font-bold text-emerald-500 dark:text-emerald-400">AI Insight:</span> {aiMatchData.reason}
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {job.title.split(' ').slice(0, 3).filter(w => w.length > 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-wider rounded border border-primary-100 dark:border-primary-500/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleApply(job._id); }}
                      disabled={isApplied}
                      className={`relative z-10 w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                        isApplied 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700' 
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary-600 dark:hover:bg-primary-500 hover:text-white shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:shadow-primary-500/30 hover:-translate-y-1'
                      }`}
                    >
                      {isApplied ? 'Application Sent' : 'Apply Now'}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Ultra-Premium Analytics & Insights Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          
          {/* 1. Market Demand & Salary Trends */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="lg:col-span-2 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                  <FaMoneyBillWave className="text-emerald-500" /> Salary Trends & Demand
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Market trajectory for your primary skill over the last 6 months</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-bold border border-emerald-500/20">
                  +12% Demand
                </div>
              </div>
            </div>
            <div className="h-48 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salaryData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 3. Smart Skill Recommendations (with Holographic Sphere) */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 flex flex-col shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          >
            {/* Holographic Sphere BG */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none opacity-20">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-full h-full rounded-full border border-indigo-500 border-dashed" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border border-purple-500 border-dotted" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight w-full text-left mb-4 flex items-center gap-2 relative z-10">
              <FaMagic className="text-indigo-500" /> Skill Gap Analyzer
            </h3>
            
            {!skillGapData ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 relative z-10">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 text-2xl mb-4 relative shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md" />
                  <FaChartLine className="relative z-10" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 text-sm">
                  Let AI analyze your profile against market demands.
                </p>
                <button 
                  onClick={handleAnalyzeSkills} disabled={isAnalyzingSkills}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm w-full justify-center disabled:opacity-70"
                >
                  {isAnalyzingSkills ? <FaSpinner className="animate-spin" /> : "Analyze Skills"}
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 relative z-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl p-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Missing Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {skillGapData.missingSkills?.map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold border border-rose-100 dark:border-rose-500/20 shadow-sm">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Certs</h4>
                  <ul className="space-y-1">
                    {skillGapData.recommendedCertifications?.map((cert, i) => (
                      <li key={i} className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.8)]" /> {cert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>

          {/* 4. Skill Mastery Orbs */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="lg:col-span-2 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Skill Mastery</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Your top skills visualized by market demand</p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pb-4">
              {premiumSkills.map((skill, idx) => {
                const size = Math.max(80, Math.min(140, skill.jobs / 10)); // Dynamic size based on jobs
                return (
                  <motion.div
                    key={skill.name}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3 + idx * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    style={{ width: size, height: size }}
                    className="relative rounded-[2rem] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                  >
                    <span className="font-black text-slate-700 dark:text-white text-lg tracking-tight z-10">{skill.name}</span>
                    
                    {/* Hover Tooltip Overlay */}
                    <div className="absolute inset-0 bg-primary-600 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white z-20">
                      <span className="font-bold text-xl">{skill.jobs}</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 mt-1">Jobs</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* 3D Network Orbit Connections */}
        {jobs.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-12 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[3rem] p-8 lg:p-16 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] min-h-[500px] flex items-center justify-center"
        >
          {/* Header */}
          <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-20 max-w-xs md:max-w-sm pointer-events-none">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Network Orbit</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">A real-time map of your position in the job market.</p>
            
            {/* Legend for clarity */}
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 backdrop-blur-md shadow-lg pointer-events-auto">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Visualization Legend</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Application</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-0.5 border-t-2 border-dashed border-slate-300 dark:border-slate-500"></div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Skill Match Opportunity</span>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center border-2 border-white dark:border-slate-900">
                    <FaUserCircle className="text-white text-[10px]" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">You (Center)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Orbit Container */}
          <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center mt-12 lg:mt-0">
             {/* Center Node (User) */}
             <div className="absolute z-10 w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.6)] border-4 border-white dark:border-slate-900">
               <FaUserCircle className="text-white text-4xl" />
             </div>

             {/* Orbit Rings */}
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-slate-200 dark:border-slate-800 border-dashed" />
             <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute inset-16 rounded-full border border-slate-200 dark:border-slate-800" />
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute inset-32 rounded-full border border-slate-100 dark:border-slate-800 border-dashed" />

             {/* Orbiting Nodes */}
             {jobs.slice(0, 5).map((job, index) => {
                const radius = 140 + (index % 2) * 70; // alternate radius (140px and 210px)
                const angle = (index * (360 / 5)) * (Math.PI / 180);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isApplied = appliedJobIds.includes(job._id);

                return (
                  <motion.div 
                    key={job._id}
                    className="absolute z-20 group"
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                  >
                    <div className="relative">
                      {/* Connection Line */}
                      <svg className="absolute top-1/2 left-1/2 overflow-visible pointer-events-none -z-10" style={{ transform: 'translate(-50%, -50%)' }}>
                        <line x1="0" y1="0" x2={-x} y2={-y} stroke={isApplied ? "#10b981" : "#cbd5e1"} strokeWidth={isApplied ? "3" : "2"} strokeDasharray={isApplied ? "0" : "4 4"} className={isApplied ? "opacity-100" : "opacity-40 dark:opacity-20"} />
                      </svg>
                      
                      <div className={`w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 ${isApplied ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'border-slate-200 dark:border-slate-700 shadow-lg'} flex items-center justify-center p-2 cursor-pointer hover:scale-110 transition-transform overflow-hidden relative`}>
                        {job.companyLogo ? (
                          <img src={`data:${job.companyLogo.contentType};base64,${job.companyLogo.data}`} alt="logo" className="w-full h-full object-contain relative z-10" />
                        ) : (
                          <FaBuilding className={`text-2xl ${isApplied ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'} relative z-10`} />
                        )}
                        {/* Status Tooltip */}
                        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-2xl pointer-events-none z-50 transform group-hover:-translate-y-1">
                          <p className="font-black text-base mb-0.5">{job.company}</p>
                          <p className="font-medium opacity-80 mb-2">{job.title}</p>
                          <div className={`px-2.5 py-1 inline-flex rounded-md border ${isApplied ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 dark:text-emerald-600' : 'bg-primary-500/20 border-primary-500/30 text-primary-400 dark:text-primary-600'} font-bold uppercase tracking-wider text-[10px]`}>
                            {isApplied ? 'Application Sent' : 'High Skill Match'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
             })}
          </div>
        </motion.div>
        )}


      </div>

      {/* Ambient AI Negotiator Orb */}
      <AnimatePresence>
        {!isNegotiatorOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-8 left-8 z-[100] group cursor-pointer"
            onClick={() => setIsNegotiatorOpen(true)}
          >
            {/* Ambient Pulsing Rings */}
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-blue-500 rounded-full blur-md pointer-events-none" />
            <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute inset-0 bg-primary-500 rounded-full blur-lg pointer-events-none" />
            
            {/* The Orb */}
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border border-white/30 dark:border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-primary-500 to-indigo-500 opacity-80" />
              {/* Glass Reflection */}
              <div className="absolute top-1 left-1 right-1 bottom-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-full pointer-events-none" />
              <FaStar className="text-white text-2xl relative z-10 drop-shadow-md" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* AI Negotiator Chat Modal (Ultra Premium) */}
      {createPortal(
        <AnimatePresence>
          {isNegotiatorOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl"
            >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white/95 dark:bg-slate-900/80 rounded-[2.5rem] max-w-lg w-full shadow-[0_0_100px_rgba(99,102,241,0.2)] border border-slate-200 dark:border-white/10 flex flex-col h-[650px] overflow-hidden relative backdrop-blur-2xl"
            >
              {/* Premium Glow Effects */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" />

              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-black/20 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-200 dark:border-white/20">
                      <FaStar className="text-xl" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">AI Salary Negotiator</h2>
                    <p className="text-xs font-bold text-emerald-500 dark:text-emerald-400 mt-1 uppercase tracking-widest opacity-80">Live Session</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNegotiatorOpen(false)}
                  className="text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 hover:rotate-90"
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* Chat Area */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
                {negotiatorMessages.map((msg, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-3xl px-5 py-4 text-[15px] leading-relaxed shadow-xl backdrop-blur-md ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-600 to-primary-600 text-white rounded-tr-sm border border-indigo-500/50 shadow-indigo-500/20' 
                        : 'bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-tl-sm shadow-black/5 dark:shadow-black/20'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isNegotiating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl rounded-tl-sm px-5 py-4 text-slate-500 dark:text-white/50 text-sm shadow-xl flex items-center gap-2 backdrop-blur-md">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce shadow-[0_0_8px_rgba(192,132,252,0.8)]" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce shadow-[0_0_8px_rgba(52,211,153,0.8)]" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-50/80 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 relative z-10 backdrop-blur-xl">
                <form onSubmit={handleNegotiatorSubmit} className="relative flex items-center">
                  <input 
                    type="text" 
                    value={negotiatorInput}
                    onChange={(e) => setNegotiatorInput(e.target.value)}
                    placeholder="Type your counter-offer..."
                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-6 pr-16 text-[15px] font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all shadow-inner"
                    disabled={isNegotiating}
                  />
                  <button 
                    type="submit"
                    disabled={isNegotiating || !negotiatorInput.trim()}
                    className="absolute right-2 top-2 bottom-2 w-12 bg-indigo-500 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white disabled:bg-slate-200 dark:disabled:bg-white/10 disabled:text-slate-400 dark:disabled:text-white/30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:shadow-none"
                  >
                    <FaPaperPlane className="ml-0.5" />
                  </button>
                </form>
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