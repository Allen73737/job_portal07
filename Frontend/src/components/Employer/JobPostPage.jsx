import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaBriefcase, FaBuilding, FaMapMarkerAlt, FaDollarSign, 
  FaAlignLeft, FaCheck, FaArrowLeft, FaMagic, FaSpinner
} from 'react-icons/fa';

const InputField = ({ icon: Icon, multiline, ...props }) => (
  <div className="relative group mb-6">
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="relative flex items-start bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 rounded-2xl px-5 py-4 transition-all duration-300 group-focus-within:border-emerald-400 dark:group-focus-within:border-emerald-500 shadow-sm">
      {Icon && <Icon className="text-slate-400 group-focus-within:text-emerald-500 transition-colors mr-4 mt-1 shrink-0 text-lg" />}
      {multiline ? (
        <textarea className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 resize-none h-40 font-medium custom-scrollbar leading-relaxed" {...props} />
      ) : (
        <input className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium" {...props} />
      )}
    </div>
  </div>
);

const JobPostPage = () => {
  const [form, setForm] = useState({
    title: '', company: '', location: '', type: 'Full Time', salary: '', description: '', datePosted: '',
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiForm, setAiForm] = useState({ skills: '', experience: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEdit = Boolean(jobId);

  useEffect(() => {
    const fetchData = async () => {
      if (isEdit) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}`);
          setForm({ ...res.data, datePosted: res.data.datePosted || '' });
        } catch (err) {
          console.error("Error loading job:", err);
        }
      } else {
        const employer = JSON.parse(localStorage.getItem("employer"));
        let company = '';
        if (employer?.email) {
          try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employers/${employer.email}`);
            company = res.data.company || '';
          } catch (err) {
            console.error("Error fetching employer:", err);
          }
        }
        setForm(prev => ({ ...prev, company, datePosted: new Date().toISOString() }));
      }
    };
    fetchData();
  }, [jobId, isEdit]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg('');
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.title || !form.company || !form.location) {
        setErrorMsg('Please fill in all required fields.');
        return false;
      }
    } else {
      if (!form.salary || !form.description) {
        setErrorMsg('Please fill in all required fields.');
        return false;
      }
    }
    setErrorMsg('');
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(2); };
  const handleBack = () => { setErrorMsg(''); setStep(1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    const employer = JSON.parse(localStorage.getItem('employer'));
    if (!employer) return navigate('/e');

    setLoading(true);
    try {
      if (isEdit) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}`, form);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs`, { ...form, postedBy: employer.email });
      }
      setTimeout(() => navigate('/d'), 1000);
    } catch {
      setErrorMsg('Failed to submit job. Please try again.');
      setLoading(false);
    }
  };

  const generateJobDescription = async () => {
    if (!form.title || !form.company) {
      setErrorMsg("Please enter at least a Job Title and Company name first.");
      return;
    }
    setGenerating(true);
    setErrorMsg('');
    setShowAiModal(false);
    try {
      const prompt = `Write a professional, compelling, ATS-friendly job description for the role of "${form.title}" at "${form.company}". 
Job Type: ${form.type}. 
Required Skills: ${aiForm.skills || 'Not specified'}. 
Experience Level: ${aiForm.experience || 'Not specified'}.

Include strictly professional sections for:
1. About the Role
2. Key Responsibilities
3. Qualifications & Skills
4. Benefits & Perks
Do not include any conversational filler. Keep it well-formatted with markdown or bullet points.`;
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
        messages: [{ role: "user", content: prompt }],
        systemPrompt: "You are an expert technical recruiter and copywriter. Generate only the job description content without any conversational filler."
      });
      
      setForm(prev => ({ ...prev, description: res.data.reply }));
    } catch (err) {
      setErrorMsg("Failed to generate description. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 lg:px-16 flex flex-col items-center bg-slate-50 dark:bg-slate-900 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/d')}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEdit ? 'Edit Job Posting' : 'Create Job Posting'}
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wide uppercase text-sm">Step {step} of 2</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">{step === 1 ? 'Basic Details' : 'Job Description'}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: step === 1 ? '50%' : '100%' }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl font-bold flex items-center"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Container */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <InputField icon={FaBriefcase} name="title" placeholder="Job Title (e.g. Senior Frontend Engineer)" value={form.title} onChange={handleChange} />
                <InputField icon={FaBuilding} name="company" placeholder="Company Name" value={form.company} onChange={handleChange} />
                <InputField icon={FaMapMarkerAlt} name="location" placeholder="Location (e.g. New York, Remote)" value={form.location} onChange={handleChange} />
                
                <div className="relative group mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 rounded-2xl px-5 py-4 transition-all duration-300 focus-within:border-emerald-400 dark:focus-within:border-emerald-500 shadow-sm">
                    <select 
                      name="type" value={form.type} onChange={handleChange}
                      className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      <option value="Full Time" className="text-slate-900">Full Time</option>
                      <option value="Part Time" className="text-slate-900">Part Time</option>
                      <option value="Internship" className="text-slate-900">Internship</option>
                      <option value="Contract" className="text-slate-900">Contract</option>
                      <option value="Remote" className="text-slate-900">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                  <button 
                    onClick={handleNext}
                    className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] hover:-translate-y-1 transition-all rounded-2xl font-bold shadow-xl text-lg flex items-center gap-2"
                  >
                    Next Step <FaArrowLeft className="rotate-180" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                <InputField icon={FaDollarSign} name="salary" placeholder="Salary / Compensation (e.g. $120,000 - $150,000)" value={form.salary} onChange={handleChange} />
                
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Job Description *</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (!form.title) {
                          setErrorMsg("Enter a job title first");
                          return;
                        }
                        setShowAiModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white font-bold rounded-xl text-sm transition-colors group"
                    >
                      {generating ? <FaSpinner className="animate-spin" /> : <FaMagic className="group-hover:rotate-12 transition-transform" />}
                      {generating ? 'Generating...' : 'Auto-Fill with AI'}
                    </button>
                </div>

                <InputField icon={FaAlignLeft} name="description" placeholder="Describe the role, responsibilities, and requirements..." value={form.description} onChange={handleChange} multiline />

                <div className="mt-10 flex flex-col-reverse sm:flex-row gap-4 justify-end">
                  <button 
                    type="button"
                    onClick={handleBack}
                    className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-2xl font-bold text-lg"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white transition-all hover:scale-[1.02] hover:-translate-y-1 rounded-2xl font-bold shadow-xl shadow-emerald-500/30 text-lg flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    {loading ? 'Publishing...' : (isEdit ? 'Update Job' : 'Publish Job')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Advanced AI Generator Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAiModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-2xl border border-indigo-100 dark:border-indigo-900/50">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg mb-6"><FaMagic /></div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Advanced JD Generator</h2>
              <p className="text-slate-500 mb-6">Tell the AI a bit more about what you're looking for to generate a highly optimized, ATS-friendly job description.</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Required Skills (Comma separated)</label>
                  <input type="text" placeholder="e.g. React, Node.js, AWS" value={aiForm.skills} onChange={e => setAiForm(f => ({ ...f, skills: e.target.value }))} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Experience Level</label>
                  <input type="text" placeholder="e.g. 3-5 years, Senior, Entry Level" value={aiForm.experience} onChange={e => setAiForm(f => ({ ...f, experience: e.target.value }))} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowAiModal(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">Cancel</button>
                <button onClick={generateJobDescription} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  <FaMagic /> Generate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobPostPage;