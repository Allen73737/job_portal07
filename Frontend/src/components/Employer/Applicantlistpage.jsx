import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ResumeModal from '../Job/ResumeModal';
import { 
  FaEye, FaCheck, FaTimes, FaEnvelope, FaMapMarkerAlt, 
  FaCalendarAlt, FaBriefcase, FaLinkedin, FaArrowLeft, 
  FaSpinner, FaRobot, FaCalendarPlus, FaChartLine, FaExpand, FaCompress
} from 'react-icons/fa';

const Toast = ({ open, message, type, onClose }) => (
  <AnimatePresence>
    {open && (
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border ${
          type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700/50' 
            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700/50'
        }`}
      >
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100"><FaTimes /></button>
      </motion.div>
    )}
  </AnimatePresence>
);

const ApplicantListPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  
  // Modals
  const [interviewModal, setInterviewModal] = useState({ open: false, applicant: null });
  const [rejectModal, setRejectModal] = useState({ open: false, applicant: null });
  const [aiModal, setAiModal] = useState({ open: false, applicant: null, loading: false, data: null });
  const [summaryModal, setSummaryModal] = useState({ open: false, applicant: null, loading: false, data: null });
  const [atsModal, setAtsModal] = useState({ open: false, applicant: null, loading: false, data: null, isFullScreen: false });
  const [resumeModal, setResumeModal] = useState({ open: false, data: null, fileName: null });

  // Semantic Search
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState(null); // { [id]: reason }
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({ date: '', time: '', mode: '', link: '', notes: '' });

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const [appRes, interviewRes, jobRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/applicant?jobId=${jobId}`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/interviews/job/${jobId}`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}`)
      ]);
      setJob(jobRes.data);
      const interviewMap = {};
      interviewRes.data.forEach(int => {
        interviewMap[int.seekerEmail] = int;
      });
      const merged = appRes.data.map(app => ({ ...app, interviewDetails: interviewMap[app.email] || null }));
      setApplicants(merged);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, open: false })), 4000);
  };

  const submitInterview = async () => {
    const applicant = interviewModal.applicant;
    try {
      if (interviewModal.isUpdate && applicant.interviewDetails?._id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/interviews/${applicant.interviewDetails._id}`, {
          interviewDate: formData.date, 
          interviewTime: formData.time, mode: formData.mode, link: formData.link, message: formData.notes
        });
        showToast(`Interview updated for ${applicant.name}`);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/interviews`, {
          jobId, seekerEmail: applicant.email, interviewDate: formData.date, 
          interviewTime: formData.time, mode: formData.mode, link: formData.link, message: formData.notes
        });
        await axios.put(`${import.meta.env.VITE_API_URL}/api/applicant/status`, {
          jobId, email: applicant.email, status: "interview scheduled"
        });
        showToast(`Interview scheduled with ${applicant.name}`);
      }
      setInterviewModal({ open: false, applicant: null });
      fetchInitialData();
    } catch {
      showToast("Failed to schedule/update interview", "error");
    }
  };

  const openScheduleModal = (app) => {
    setFormData({ date: '', time: '', mode: '', link: '', notes: '' });
    setInterviewModal({ open: true, applicant: app, isUpdate: false });
  };

  const openUpdateModal = (app) => {
    const int = app.interviewDetails;
    setFormData({ 
      date: int?.interviewDate ? new Date(int.interviewDate).toISOString().split('T')[0] : '', 
      time: int?.interviewTime || '', 
      mode: int?.mode || '', 
      link: int?.link || '', 
      notes: int?.message || ''
    });
    setInterviewModal({ open: true, applicant: app, isUpdate: true });
  };

  const confirmReject = async () => {
    const applicant = rejectModal.applicant;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/applicant`, { params: { jobId, email: applicant.email } });
      await axios.put(`${import.meta.env.VITE_API_URL}/api/applicant/status`, {
        jobId, email: applicant.email, status: "rejected"
      });
      showToast(`Application rejected for ${applicant.name}`, 'error');
      setApplicants(prev => prev.filter(a => a.email !== applicant.email));
      setRejectModal({ open: false, applicant: null });
    } catch {
      showToast("Failed to reject applicant", "error");
    }
  };

  const handleHire = async (applicant) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/applicant/status`, {
        jobId, email: applicant.email, status: "hired"
      });
      showToast(`🎉 Congratulations! You have hired ${applicant.name}`, "success");
      fetchInitialData();
    } catch {
      showToast("Failed to hire applicant", "error");
    }
  };

  const generateAIQuestions = async (applicant) => {
    setAiModal({ open: true, applicant, loading: true, data: null });
    try {
      const prompt = `You are an elite technical interviewer hiring for the role of "${job?.title || 'Job'}" at "${job?.company || 'Company'}". 
Based on this applicant's profile (Bio: ${applicant.bio || 'N/A'}, Experience: ${applicant.experience || 'N/A'}), generate 3 highly targeted interview questions to evaluate them.
Return strictly as JSON format: { "questions": [ { "q": "Question text...", "tip": "What to look for in their answer..." } ] }`;

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
        messages: [{ role: "user", content: prompt }],
        systemPrompt: "You are an AI Interview Guide. Output JSON only."
      });

      let parsed = { questions: [] };
      try {
        const text = res.data.reply;
        const match = text.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch (e) {
        parsed = { questions: [{ q: "Tell me about your experience.", tip: "Look for relevant skills." }] };
      }
      setAiModal({ open: true, applicant, loading: false, data: parsed });
    } catch (err) {
      setAiModal({ open: false, applicant: null, loading: false, data: null });
      showToast("Failed to generate AI questions.", "error");
    }
  };

  const generateSummary = async (applicant) => {
    setSummaryModal({ open: true, applicant, loading: true, data: null });
    try {
      const candidateData = `Bio: ${applicant.bio}\nExperience: ${applicant.experience}\nSkills: ${applicant.skills}`;
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/candidate-summary`, { candidateData });
      setSummaryModal({ open: true, applicant, loading: false, data: res.data });
    } catch (err) {
      setSummaryModal({ open: false, applicant: null, loading: false, data: null });
      showToast("Failed to generate summary.", "error");
    }
  };

  const getAtsScore = async (applicant) => {
    setAtsModal({ open: true, applicant, loading: true, data: null });
    try {
      const resumeText = `Bio: ${applicant.bio}\nExperience: ${applicant.experience}\nLocation: ${applicant.location}`;
      const jobDescription = `${job?.title} at ${job?.company}. ${job?.description}`;
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/ats-analyze`, { resumeText, jobDescription });
      setAtsModal({ open: true, applicant, loading: false, data: res.data });
    } catch (err) {
      setAtsModal({ open: false, applicant: null, loading: false, data: null });
      showToast("Failed to get ATS score.", "error");
    }
  };

  const performSemanticSearch = async () => {
    if (!searchQuery.trim()) {
      setSemanticResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/semantic-search`, {
        query: searchQuery,
        candidates: applicants
      });
      setSemanticResults(res.data.matchReasons || {});
    } catch (err) {
      showToast("Semantic search failed.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const displayedApplicants = semanticResults 
    ? applicants.filter(a => semanticResults[a._id])
    : applicants;

  const openResume = (resume) => {
    if (resume && resume.data && resume.data.data) {
      setResumeModal({ 
        open: true, 
        data: new Uint8Array(resume.data.data), 
        fileName: resume.fileName || "Applicant_Resume" 
      });
    }
  };

  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 lg:px-16 bg-slate-50 dark:bg-slate-900 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => navigate('/d')}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-all shrink-0"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Applications
            </h1>
            {job && <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">{job.title}</p>}
          </div>
          <div className="w-full md:w-96 flex gap-2">
            <input 
              type="text" 
              placeholder="Semantic Search (e.g. Needs React & Node)" 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if(!e.target.value) setSemanticResults(null); }}
              onKeyDown={e => e.key === 'Enter' && performSemanticSearch()}
              className="flex-1 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 font-medium border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button onClick={performSemanticSearch} disabled={isSearching} className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-md disabled:opacity-50">
              {isSearching ? <FaSpinner className="animate-spin" /> : <FaRobot />}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <FaSpinner className="animate-spin text-4xl text-emerald-500" />
            <p className="text-slate-500 font-bold">Loading applicants...</p>
          </div>
        ) : displayedApplicants.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] p-12 text-center shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Applicants Found</h3>
            <p className="text-slate-500">No candidates match your current search criteria.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {displayedApplicants.map((app) => (
                <motion.div
                  key={app._id}
                  layout
                  variants={itemVariants} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 lg:p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col md:flex-row gap-8 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 opacity-80" />
                  
                  <div className="flex-1 ml-2">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-black shadow-inner">
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{app.name}</h2>
                        <p className="text-slate-500 dark:text-slate-400">{app.bio}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium mt-6">
                      <div className="flex items-center gap-2"><FaEnvelope className="text-indigo-500" /> {app.email}</div>
                      <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-500" /> {app.location || "Not specified"}</div>
                      <div className="flex items-center gap-2"><FaCalendarAlt className="text-indigo-500" /> Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "N/A"}</div>
                      {app.experience && <div className="flex items-center gap-2"><FaBriefcase className="text-indigo-500" /> Exp: {app.experience}</div>}
                    </div>

                    {semanticResults && semanticResults[app._id] && (
                      <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm font-medium text-indigo-700 dark:text-indigo-300">
                        <span className="font-bold mr-2">Semantic Match:</span> {semanticResults[app._id]}
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button onClick={() => generateSummary(app)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
                        <FaRobot className="text-indigo-500" /> AI Summary
                      </button>
                      <button onClick={() => getAtsScore(app)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
                        <FaChartLine className="text-emerald-500" /> ATS Match Score
                      </button>
                    </div>

                    {app.status === "interview scheduled" && app.interviewDetails && (
                      <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 rounded-xl flex flex-col gap-2">
                        <span className="font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest text-xs">Interview Scheduled</span>
                        <div className="grid grid-cols-2 gap-2 text-sm font-medium text-emerald-900 dark:text-emerald-100">
                          <div><span className="opacity-70">Date:</span> {new Date(app.interviewDetails.interviewDate).toLocaleDateString()}</div>
                          <div><span className="opacity-70">Time:</span> {app.interviewDetails.interviewTime}</div>
                          <div><span className="opacity-70">Mode:</span> {app.interviewDetails.mode}</div>
                          {app.interviewDetails.link && <div className="col-span-2"><span className="opacity-70">Link:</span> <a href={app.interviewDetails.link} className="underline" target="_blank" rel="noreferrer">Meeting Link</a></div>}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 min-w-[220px]">
                    {app.status === "hired" ? (
                      <div className="px-5 py-3.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-black text-center rounded-xl flex items-center justify-center gap-2">
                        🎉 Hired
                      </div>
                    ) : app.status === "interview scheduled" ? (
                      <>
                        <button onClick={() => openUpdateModal(app)} className="flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5">
                          <FaCalendarAlt /> Update Interview
                        </button>
                        <button onClick={() => handleHire(app)} className="flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:-translate-y-0.5">
                          Make Offer / Hire
                        </button>
                      </>
                    ) : app.status === "rejected" ? (
                      <div className="px-5 py-3.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-black text-center rounded-xl">
                        Rejected
                      </div>
                    ) : (
                      <>
                        <button onClick={() => openScheduleModal(app)} className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5">
                          <FaCheck /> Accept & Schedule
                        </button>
                        <button onClick={() => setRejectModal({ open: true, applicant: app })} className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-800 border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white font-bold rounded-xl transition-all">
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                    
                    <button onClick={() => generateAIQuestions(app)} className="flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white font-bold rounded-xl transition-all group border border-indigo-200 dark:border-indigo-500/20">
                      <FaRobot className="group-hover:rotate-12 transition-transform" /> AI Interview Guide
                    </button>

                    {app.resume && (
                      <button onClick={() => openResume(app.resume)} className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl transition-all">
                        <FaEye /> View Resume
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, open: false }))} />

      {/* Schedule Interview Modal */}
      <AnimatePresence>
        {interviewModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInterviewModal({ open: false, applicant: null })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 relative z-10 shadow-2xl border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{interviewModal.isUpdate ? 'Update Interview' : 'Schedule Interview'}</h2>
              <p className="text-slate-500 mb-6">{interviewModal.isUpdate ? 'Update the interview details for' : 'Set up an interview with'} <span className="font-bold text-emerald-600">{interviewModal.applicant?.name}</span>.</p>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input type="time" value={formData.time} onChange={e => setFormData(f => ({ ...f, time: e.target.value }))} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Mode</label>
                  <input type="text" placeholder="Online / In-person" value={formData.mode} onChange={e => setFormData(f => ({ ...f, mode: e.target.value }))} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Meeting Link (Optional)</label>
                  <input type="url" value={formData.link} onChange={e => setFormData(f => ({ ...f, link: e.target.value }))} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                  <textarea rows={2} value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white resize-none" />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setInterviewModal({ open: false, applicant: null })} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">Cancel</button>
                <button onClick={submitInterview} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5">{interviewModal.isUpdate ? 'Update' : 'Schedule'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRejectModal({ open: false, applicant: null })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 relative z-10 shadow-2xl border border-rose-100 dark:border-rose-900/50 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"><FaTimes /></div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Reject Application?</h2>
              <p className="text-slate-500 mb-8">Are you sure you want to reject <strong className="text-rose-500">{rejectModal.applicant?.name}</strong>? This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setRejectModal({ open: false, applicant: null })} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">Cancel</button>
                <button onClick={confirmReject} className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30 transition-all hover:-translate-y-0.5">Reject</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Interview Guide Modal */}
      <AnimatePresence>
        {aiModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAiModal({ open: false })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-2xl border border-indigo-100 dark:border-indigo-900/50 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg"><FaRobot /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">AI Interview Guide</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Customized for {aiModal.applicant?.name}</p>
                </div>
              </div>
              
              {aiModal.loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <FaSpinner className="animate-spin text-4xl text-indigo-500" />
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold animate-pulse">Analyzing profile & generating questions...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {aiModal.data?.questions?.map((q, idx) => (
                    <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex gap-3">
                        <span className="text-indigo-500">Q{idx + 1}.</span> {q.q || q.question}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 font-medium pl-8 border-l-2 border-indigo-200 dark:border-indigo-500/30">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-1">Tip:</span> {q.tip}
                      </p>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-end">
                    <button onClick={() => setAiModal({ open: false })} className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">Close Guide</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Summary Modal */}
      <AnimatePresence>
        {summaryModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSummaryModal({ open: false })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-2xl border border-indigo-100 dark:border-indigo-900/50 scrollbar-hide">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shrink-0"><FaRobot /></div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">AI Candidate Summary</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{summaryModal.applicant?.name}</p>
                  </div>
                </div>
                <button onClick={() => setSummaryModal({ open: false })} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
                  <FaTimes className="text-slate-600 dark:text-slate-300" />
                </button>
              </div>
              
              {summaryModal.loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <FaSpinner className="animate-spin text-4xl text-indigo-500" />
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold animate-pulse">Summarizing profile...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Overall Suitability</h4>
                    <p className="text-lg font-medium text-slate-900 dark:text-white leading-relaxed">{summaryModal.data?.overallSuitability}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Key Highlights</h4>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {summaryModal.data?.summary?.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Top Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {summaryModal.data?.topSkills?.map((s, i) => (
                        <span key={i} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/50 shadow-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button onClick={() => setSummaryModal({ open: false })} className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">Close</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ATS Match Score Modal */}
      <AnimatePresence>
        {atsModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAtsModal({ open: false, isFullScreen: false })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} 
              className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-2xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col transition-all duration-300 ${atsModal.isFullScreen ? 'w-[95vw] h-[95vh] max-w-none' : 'w-full max-w-2xl max-h-[90vh]'}`}
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shrink-0"><FaChartLine /></div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">ATS Match Score</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md">Against {job?.title}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAtsModal({ ...atsModal, isFullScreen: !atsModal.isFullScreen })} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
                    {atsModal.isFullScreen ? <FaCompress /> : <FaExpand />}
                  </button>
                  <button onClick={() => setAtsModal({ open: false, isFullScreen: false })} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-6">
                {atsModal.loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
                    <FaSpinner className="animate-spin text-4xl text-emerald-500" />
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">Analyzing resume against job description...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-lg">Overall Match</span>
                      <span className={`text-4xl font-black ${atsModal.data?.matchScore >= 80 ? 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]' : atsModal.data?.matchScore >= 60 ? 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-rose-500 drop-shadow-[0_0_15px_rgba(225,29,72,0.3)]'}`}>
                        {atsModal.data?.matchScore}%
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaCheck className="text-emerald-500" /> Strengths</h4>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          {atsModal.data?.strengths?.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                      <div className="bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100/50 dark:border-rose-800/30">
                        <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FaTimes className="text-rose-500" /> Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {atsModal.data?.missingKeywords?.map((s, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 rounded-xl text-sm font-bold shadow-sm">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Suggestions</h4>
                      <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        {atsModal.data?.improvementSuggestions?.join(' ')}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resume Viewer Modal */}
      <ResumeModal 
        open={resumeModal.open} 
        onClose={() => setResumeModal({ open: false, data: null, fileName: null })} 
        resumeData={resumeModal.data} 
        resumeFileName={resumeModal.fileName}
      />

    </div>
  );
};

export default ApplicantListPage;
