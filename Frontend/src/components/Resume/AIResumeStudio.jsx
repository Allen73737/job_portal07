import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFilePdf, FaMagic, FaChartLine, FaEnvelopeOpenText, 
  FaUpload, FaCheckCircle, FaRobot, FaPenFancy, FaArrowRight, FaSpinner,
  FaDownload, FaFileAlt, FaCopy, FaArrowLeft
} from 'react-icons/fa';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

const AIResumeStudio = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('builder');
  
  // --- Builder State ---
  const [isParsing, setIsParsing] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  
  // Form State
  const [personal, setPersonal] = useState({ name: '', email: '', phone: '', location: '' });
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState('');

  // Generated Resume
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const printRef = useRef();

  // --- ATS State ---
  const [atsResumeText, setAtsResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  
  // Improver State
  const [isImproving, setIsImproving] = useState(false);
  const [improvementResult, setImprovementResult] = useState(null);

  // --- Cover Letter State ---
  const [clJobTitle, setClJobTitle] = useState('');
  const [clCompany, setClCompany] = useState('');
  const [clJobDesc, setClJobDesc] = useState('');
  const [clResumeText, setClResumeText] = useState('');
  const [isGeneratingCl, setIsGeneratingCl] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  // --- Handlers ---

  const handleFileUpload = async (e, target) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsParsing(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/resume-parse`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { parsed, rawText } = res.data;
      toast.success("Resume parsed successfully!");

      if (target === 'builder') {
        // Auto-fill form
        if (parsed.personal) setPersonal(parsed.personal);
        if (parsed.education) setEducation(JSON.stringify(parsed.education, null, 2));
        if (parsed.experience) setExperience(JSON.stringify(parsed.experience, null, 2));
        if (parsed.projects) setProjects(JSON.stringify(parsed.projects, null, 2));
        if (parsed.skills) setSkills(parsed.skills.join(', '));
      } else if (target === 'ats') {
        setAtsResumeText(rawText);
      }
      
      // Auto-fill Cover Letter too
      setClResumeText(rawText);
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to parse file.");
    } finally {
      setIsParsing(false);
      e.target.value = null; // reset input
    }
  };

  const handleBuildResume = async () => {
    setIsBuilding(true);
    try {
      const resumeData = { personal, education, experience, projects, skills };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/resume-build`, { resumeData });
      setGeneratedMarkdown(res.data.markdown);
      toast.success("Resume generated!");
    } catch (err) {
      toast.error("Failed to generate resume");
    } finally {
      setIsBuilding(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = printRef.current;
    if (!element) return;
    
    const clone = element.cloneNode(true);
    clone.id = 'print-clone';
    
    const style = document.createElement('style');
    style.innerHTML = `
      @media screen {
        #print-clone { display: none; }
      }
      @media print {
        #root { display: none !important; }
        body, html { background: white !important; height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
        #print-clone { display: block !important; position: relative; width: 100%; margin: 0; padding: 0; }
        @page { margin: 0.5in; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(clone);
    
    window.print();
    
    setTimeout(() => {
      document.body.removeChild(clone);
      document.head.removeChild(style);
    }, 100);
  };

  const handleATSAnalyze = async () => {
    if (!atsResumeText || !jobDescription) return toast.warning("Provide both Resume and Job Description.");
    setIsAnalyzing(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/ats-analyze`, {
        resumeText: atsResumeText, jobDescription
      });
      setAtsResult(res.data);
    } catch (err) {
      toast.error("Failed to analyze ATS Score.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImproveResume = async () => {
    if (!atsResumeText) return toast.warning("Provide Resume Text.");
    setIsImproving(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/resume-improve`, {
        resumeText: atsResumeText
      });
      setImprovementResult(res.data);
      toast.success("Improvements generated!");
    } catch (err) {
      toast.error("Failed to generate improvements.");
    } finally {
      setIsImproving(false);
    }
  };

  const handleGenerateCL = async () => {
    if (!clResumeText || !clJobTitle || !clCompany || !clJobDesc) return toast.warning("Fill all fields.");
    setIsGeneratingCl(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/cover-letter`, {
        resumeText: clResumeText, jobTitle: clJobTitle, company: clCompany, jobDescription: clJobDesc
      });
      setCoverLetter(res.data.coverLetter);
      toast.success("Cover Letter Generated!");
    } catch (err) {
      toast.error("Failed to generate cover letter.");
    } finally {
      setIsGeneratingCl(false);
    }
  };

  // --- Render Helpers ---

  const renderTabs = () => (
    <div className="flex gap-4 mb-8 bg-white/50 dark:bg-slate-900/50 p-2 rounded-2xl backdrop-blur-md border border-slate-200 dark:border-white/10 w-fit mx-auto shadow-xl relative z-10 flex-wrap justify-center">
      {[
        { id: 'builder', icon: <FaPenFancy />, label: 'Resume Builder' },
        { id: 'ats', icon: <FaChartLine />, label: 'ATS & Improver' },
        { id: 'coverletter', icon: <FaEnvelopeOpenText />, label: 'Cover Letter' },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
            activeTab === tab.id 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 px-4 relative overflow-hidden font-sans">
      <ToastContainer position="bottom-right" theme="colored" />
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold transition-colors bg-white/50 dark:bg-slate-900/50 py-2 px-4 rounded-xl backdrop-blur-sm shadow-sm w-fit"
          >
            <FaArrowLeft /> Back to previous
          </button>
        </div>
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl mb-6 shadow-xl shadow-indigo-500/30"
          >
            <FaRobot />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            AI Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Studio</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Leverage elite AI models to build, parse, optimize, and generate your professional brand.
          </motion.p>
        </div>

        {renderTabs()}

        <AnimatePresence mode="wait">
          
          {/* --- BUILDER TAB --- */}
          {activeTab === 'builder' && (
            <motion.div key="builder" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Form Side */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col max-h-[80vh] overflow-y-auto custom-scrollbar">
                
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <FaPenFancy className="text-indigo-500" /> Resume Editor
                  </h2>
                  <div className="relative overflow-hidden group">
                    <button disabled={isParsing} className="px-4 py-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-200 transition-colors disabled:opacity-50">
                      {isParsing ? <FaSpinner className="animate-spin" /> : <FaUpload />} Auto-Fill PDF/DOCX
                    </button>
                    <input type="file" accept=".pdf,.docx" onChange={(e) => handleFileUpload(e, 'builder')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isParsing} />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Personal */}
                  <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-2xl border border-slate-200 dark:border-white/5 space-y-4">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300">Personal Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input placeholder="Name" value={personal.name} onChange={e => setPersonal({...personal, name: e.target.value})} className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                      <input placeholder="Email" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                      <input placeholder="Phone" value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                      <input placeholder="Location" value={personal.location} onChange={e => setPersonal({...personal, location: e.target.value})} className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                  </div>

                  {/* Textareas */}
                  {[
                    { label: 'Experience (JSON or Text)', state: experience, setter: setExperience },
                    { label: 'Education (JSON or Text)', state: education, setter: setEducation },
                    { label: 'Projects (JSON or Text)', state: projects, setter: setProjects },
                    { label: 'Skills (Comma separated)', state: skills, setter: setSkills },
                  ].map((field, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-black/20 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                      <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">{field.label}</h3>
                      <textarea 
                        value={field.state} onChange={e => field.setter(e.target.value)}
                        className="w-full h-24 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none custom-scrollbar"
                      />
                    </div>
                  ))}

                  <button onClick={handleBuildResume} disabled={isBuilding} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-indigo-500/30 flex justify-center items-center gap-3">
                    {isBuilding ? <><FaSpinner className="animate-spin" /> Building...</> : <><FaMagic /> Build Markdown Resume</>}
                  </button>
                </div>
              </div>

              {/* Preview Side */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col h-[80vh]">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <FaFileAlt className="text-purple-500" /> Preview
                    </h2>
                    {generatedMarkdown && (
                      <button onClick={handleDownloadPDF} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/30">
                        <FaDownload /> Save PDF
                      </button>
                    )}
                 </div>

                 <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 overflow-y-auto custom-scrollbar relative shadow-inner">
                   {generatedMarkdown ? (
                     <div ref={printRef} className="prose prose-sm max-w-none text-slate-800 markdown-resume font-serif p-4">
                       <ReactMarkdown>{generatedMarkdown}</ReactMarkdown>
                     </div>
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                       <FaFileAlt className="text-6xl mb-4 opacity-20" />
                       <p className="font-medium">Your generated resume will appear here.</p>
                     </div>
                   )}
                 </div>
              </div>

            </motion.div>
          )}

          {/* --- ATS & IMPROVER TAB --- */}
          {activeTab === 'ats' && (
            <motion.div key="ats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-[2rem] shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Your Resume Text</label>
                  </div>
                  
                  <div className="mb-4 relative overflow-hidden group">
                     <div className="w-full border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer">
                        <FaUpload className="text-2xl text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">Upload PDF/DOCX from Device</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs mt-1">Or paste your text below</span>
                        <input type="file" accept=".pdf,.docx" onChange={(e) => handleFileUpload(e, 'ats')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isParsing}/>
                     </div>
                     {isParsing && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <FaSpinner className="animate-spin text-indigo-500 text-2xl mr-2" /> <span className="font-bold text-slate-900 dark:text-white animate-pulse">Extracting...</span>
                        </div>
                     )}
                  </div>
                  <textarea 
                    value={atsResumeText} onChange={(e) => setAtsResumeText(e.target.value)}
                    className="w-full h-48 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none custom-scrollbar"
                    placeholder="Paste your resume text here, or upload a file..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Job Description</label>
                  <textarea 
                    value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full h-48 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none custom-scrollbar"
                    placeholder="Paste the job description you are applying for..."
                  />
                </div>
              </div>
              
              <div className="flex justify-center gap-4 mb-12 flex-wrap">
                <button 
                  onClick={handleATSAnalyze} disabled={isAnalyzing}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-indigo-500/30 flex items-center gap-3 disabled:opacity-70"
                >
                  {isAnalyzing ? <><FaSpinner className="animate-spin" /> Analyzing...</> : <><FaChartLine /> Analyze ATS Score</>}
                </button>
                <button 
                  onClick={handleImproveResume} disabled={isImproving}
                  className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-rose-500/30 flex items-center gap-3 disabled:opacity-70"
                >
                  {isImproving ? <><FaSpinner className="animate-spin" /> Improving...</> : <><FaMagic /> Suggest Improvements</>}
                </button>
              </div>

              {/* ATS Results */}
              {atsResult && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Match Score</div>
                    <div className={`text-6xl font-black ${atsResult.matchScore >= 80 ? 'text-emerald-500' : atsResult.matchScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {atsResult.matchScore}%
                    </div>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-6">
                    <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-4 flex items-center gap-2"><FaCheckCircle className="rotate-45" /> Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {atsResult.missingKeywords?.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-white dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 rounded-lg text-sm font-medium border border-rose-100 dark:border-rose-500/20">{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-6">
                    <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2"><FaMagic /> Actionable Advice</h4>
                    <ul className="space-y-3">
                      {atsResult.improvementSuggestions?.map((sug, i) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <FaArrowRight className="text-indigo-500 mt-1 flex-shrink-0" /> {sug}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Improvement Results */}
              {improvementResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3"><FaPenFancy className="text-rose-500" /> Suggested Re-writes</h3>
                  <div className="space-y-4">
                    {improvementResult.suggestions?.map((sug, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-through">"{sug.original}"</div>
                        <div className="text-md font-bold text-emerald-600 dark:text-emerald-400 mb-2">"{sug.improved}"</div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">Why: {sug.reason}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* --- COVER LETTER TAB --- */}
          {activeTab === 'coverletter' && (
            <motion.div key="coverletter" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-[2rem] shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Job Title</label>
                      <input type="text" value={clJobTitle} onChange={(e) => setClJobTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Senior Dev" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Company</label>
                      <input type="text" value={clCompany} onChange={(e) => setClCompany(e.target.value)} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Google" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Job Description</label>
                    <textarea value={clJobDesc} onChange={(e) => setClJobDesc(e.target.value)} className="w-full h-32 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none custom-scrollbar" placeholder="Paste JD..." />
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Your Resume Text</label>
                  </div>
                  <div className="mb-4 relative overflow-hidden group">
                     <div className="w-full border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer">
                        <FaUpload className="text-2xl text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">Upload PDF/DOCX from Device</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs mt-1">Or paste your text below</span>
                        <input type="file" accept=".pdf,.docx" onChange={(e) => handleFileUpload(e, 'coverletter')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isParsing}/>
                     </div>
                     {isParsing && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <FaSpinner className="animate-spin text-indigo-500 text-2xl mr-2" /> <span className="font-bold text-slate-900 dark:text-white animate-pulse">Extracting...</span>
                        </div>
                     )}
                  </div>
                  <textarea value={clResumeText} onChange={(e) => setClResumeText(e.target.value)} className="w-full h-32 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none custom-scrollbar" placeholder="Paste resume..." />
                  <button onClick={handleGenerateCL} disabled={isGeneratingCl} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-indigo-500/30 flex justify-center items-center gap-3">
                    {isGeneratingCl ? <><FaSpinner className="animate-spin" /> Generating...</> : <><FaMagic /> Generate Cover Letter</>}
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 relative group">
                  {coverLetter ? (
                    <>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(coverLetter); toast.success("Cover letter copied!"); }}
                        className="absolute top-4 right-4 p-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-all opacity-0 group-hover:opacity-100 z-10"
                        title="Copy to clipboard"
                      >
                        <FaCopy />
                      </button>
                      <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm font-medium custom-scrollbar h-[500px] overflow-y-auto pr-4 relative">
                        {coverLetter}
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <FaEnvelopeOpenText className="text-6xl mb-4 opacity-20" />
                      <p className="font-medium">Your tailored cover letter will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIResumeStudio;
