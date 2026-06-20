import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser, FaBriefcase, FaMapMarkerAlt, FaLinkedin, FaInfoCircle, FaFileUpload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const steps = ['Personal Details', 'Profile Details', 'Account Setup'];

const InputField = ({ icon: Icon, rightIcon: RightIcon, onRightIconClick, multiline, ...props }) => (
  <div className="relative group mb-4">
    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="relative flex items-start bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl px-4 py-3.5 transition-all duration-300 group-focus-within:border-primary-400 dark:group-focus-within:border-primary-500 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
      {Icon && <Icon className="text-slate-400 group-focus-within:text-primary-500 transition-colors mr-3 mt-1 shrink-0" size={18} />}
      {multiline ? (
        <textarea className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 resize-none h-24 font-medium" {...props} />
      ) : (
        <input className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium" {...props} />
      )}
      {RightIcon && (
        <button type="button" onClick={onRightIconClick} className="ml-3 text-slate-400 hover:text-primary-500 transition-colors focus:outline-none">
          <RightIcon size={18} />
        </button>
      )}
    </div>
  </div>
);

export default function JobSeekerLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState('login'); 
  const [registerStep, setRegisterStep] = useState(0); 
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', age: '', location: '', linkedin: '', bio: '', resume: null 
  });
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/seeker/login`, {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('email', formData.email);
      toast.success("Login successful");
      setTimeout(() => navigate('/job'), 1000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Network Error: Unable to reach the server.';
      toast.error(`Login Failed: ${errorMsg}`, {
        duration: 4000,
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' },
        icon: '⚠️'
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNext = (e) => {
    e.preventDefault();
    if (registerStep === 1) {
      setOpenDialog(true); 
    } else {
      setRegisterStep((prev) => prev + 1);
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    setRegisterStep((prev) => prev - 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) form.append(key, formData[key]);
      });
      await axios.post(`${import.meta.env.VITE_API_URL}/api/seeker/register`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('email', formData.email);
      toast.success("Registration successful");
      setOpenDialog(false);
      setTimeout(() => {
        navigate('/job');
      }, 1200);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Server rejected registration.';
      toast.error(`Registration Failed: ${errorMsg}`, {
        duration: 4000,
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' },
        icon: '⚠️'
      });
    }
    setLoading(false);
  };

  const startRegister = () => {
    setMode('register');
    setRegisterStep(0);
    setFormData({ name: '', age: '', location: '', linkedin: '', bio: '', resume: null, email: '', password: '' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  return (
    <div className="relative -mt-28 min-h-[calc(100vh+7rem)] flex flex-col lg:flex-row font-sans overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
      
      {/* Left Panel - Editorial Full-Bleed Visual */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full lg:w-1/2 max-md:fixed max-md:inset-0 max-md:z-0 max-md:h-screen min-h-[30vh] lg:min-h-[calc(100vh+7rem)] flex flex-col justify-end max-md:justify-start max-md:pt-32 p-8 sm:p-12 lg:p-16 xl:p-24 pt-20 lg:pt-32"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute inset-0 bg-primary-900/20 mix-blend-overlay" />

        <div className="relative z-10 max-w-xl max-md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-8 md:mb-12 inline-flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <FaBriefcase className="text-white text-xl" />
            </div>
            <div>
              <p className="font-black text-white text-xl leading-tight">50,000+ Jobs</p>
              <p className="text-sm text-slate-200 font-medium">Your dream job awaits!</p>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-7xl xl:text-[5.5rem] font-black text-white mb-6 tracking-tight leading-[1.05]"
          >
            Elevate Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-300 drop-shadow-lg">Career.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg lg:text-xl text-slate-300 leading-relaxed font-medium max-w-lg hidden sm:block"
          >
            Join the most exclusive professional network. Connect with world-class employers and discover opportunities that match your unparalleled skills.
          </motion.p>
        </div>
      </motion.div>

      {/* Right Panel - Massive Clean Canvas */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full lg:w-1/2 flex flex-col lg:items-center justify-center p-6 sm:p-12 lg:p-16 pt-20 lg:pt-32 max-md:pt-10 max-md:absolute max-md:bottom-0 max-md:h-[75vh] max-md:overflow-y-auto max-md:rounded-t-[3rem] max-md:shadow-[0_-20px_50px_rgba(0,0,0,0.5)] max-md:border-t max-md:border-white/20 max-md:backdrop-blur-3xl bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm max-md:bg-white/70 max-md:dark:bg-slate-900/80 z-10"
      >
        {/* Mobile Drag Handle */}
        <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-8 hidden max-md:block" />
        {/* Subtle Interactive Fluid Background on the right */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] rounded-full bg-gradient-to-l from-primary-400/50 to-blue-600/50 dark:from-primary-600/40 dark:to-blue-600/40 blur-[80px] mix-blend-screen"
          />
        </div>

        <div className="relative z-10 w-full max-w-md">
          
          <div className="flex justify-start mb-8 lg:mb-12">
            <div className="w-16 h-16 max-md:w-12 max-md:h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-primary-500/30 transform hover:scale-110 transition-transform">
              <FaUser className="text-white text-2xl" />
            </div>
          </div>
          
          <h2 className="text-3xl lg:text-5xl max-md:text-2xl font-black text-slate-900 dark:text-white mb-3 max-md:mb-1">
            {mode === 'login' ? 'Welcome Back' : 'Join Us'}
          </h2>
          <p className="text-lg max-md:text-base text-slate-500 dark:text-slate-400 mb-10 max-md:mb-6 font-medium">
            {mode === 'login' ? 'Sign in to access your premium dashboard' : 'Create your elite job seeker profile'}
          </p>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
              >
                <div className="space-y-4">
                  <InputField 
                    icon={FaEnvelope} type="email" name="email" placeholder="Email Address" 
                    value={formData.email} onChange={handleChange} required 
                  />
                  <InputField 
                    icon={FaLock} type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" 
                    value={formData.password} onChange={handleChange} required
                    rightIcon={showPassword ? FaEyeSlash : FaEye} onRightIconClick={() => setShowPassword(!showPassword)}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-6 mb-8">
                  <div className="flex items-center">
                    <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-800" />
                    <label htmlFor="remember" className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer">Remember me</label>
                  </div>
                  <a href="#" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline">Forgot password?</a>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full relative overflow-hidden group bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 max-md:py-3 px-6 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <span className="relative z-10 text-lg max-md:text-base">{loading ? 'Authenticating...' : 'Sign In'}</span>
                  <div className="absolute inset-0 w-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:w-full transition-all duration-500 ease-out skew-x-12 -ml-12" />
                </button>
                
                <p className="text-center mt-8 text-slate-600 dark:text-slate-400 font-medium">
                  New here? <button type="button" onClick={startRegister} className="text-primary-600 dark:text-primary-400 font-bold hover:underline">Create an account</button>
                </p>
              </motion.form>
            ) : (
              <motion.form 
                key="register"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleNext}
              >
                {/* Custom Stepper */}
                <div className="flex items-center justify-between mb-10 relative">
                  <div className="absolute left-0 top-1/2 w-full h-[2px] bg-slate-200 dark:bg-slate-700 -z-10 -translate-y-1/2" />
                  {steps.map((label, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        idx <= registerStep ? 'bg-primary-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-110' : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <p className="text-xs font-bold mt-2 text-slate-500 dark:text-slate-400 absolute -bottom-6 whitespace-nowrap">{label}</p>
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {registerStep === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-4">
                      <div className="space-y-4">
                        <InputField icon={FaUser} name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                        <div className="flex gap-4">
                          <div className="w-1/3">
                            <InputField name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required />
                          </div>
                          <div className="w-2/3">
                            <InputField icon={FaMapMarkerAlt} name="location" placeholder="City, Country" value={formData.location} onChange={handleChange} required />
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="w-full mt-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg py-4 px-6 rounded-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all shadow-xl hover:shadow-2xl">
                        Next Step
                      </button>
                    </motion.div>
                  )}
                  {registerStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-4">
                      <div className="space-y-4">
                        <InputField icon={FaLinkedin} name="linkedin" placeholder="LinkedIn URL" value={formData.linkedin} onChange={handleChange} />
                        <InputField icon={FaInfoCircle} name="bio" placeholder="Short Bio (What makes you unique?)" multiline value={formData.bio} onChange={handleChange} />
                        
                        <div className="relative group cursor-pointer">
                          <div className="absolute inset-0 bg-primary-500/5 rounded-2xl border-2 border-dashed border-primary-500/30 group-hover:border-primary-500/60 group-hover:bg-primary-500/10 transition-colors" />
                          <div className="relative p-6 flex flex-col items-center justify-center text-center">
                            <FaFileUpload className="text-3xl text-primary-500 mb-3" />
                            <p className="text-slate-700 dark:text-slate-200 font-bold">Upload Resume</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">PDF, DOC, or DOCX</p>
                            <input type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-8">
                        <button type="button" onClick={handleBack} className="w-1/3 py-4 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          Back
                        </button>
                        <button type="submit" className="w-2/3 py-4 rounded-2xl font-bold text-white text-lg bg-primary-600 hover:bg-primary-500 hover:-translate-y-1 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all">
                          Continue
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <p className="text-center mt-8 text-slate-600 dark:text-slate-400 font-medium">
                  Already registered? <button type="button" onClick={() => { setMode('login'); setRegisterStep(0); }} className="text-primary-600 dark:text-primary-400 font-bold hover:underline">Sign In</button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Custom Modal for Final Registration Step */}
      <AnimatePresence>
        {openDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setOpenDialog(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md p-[2px] rounded-[2.5rem] shadow-2xl"
            >
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-indigo-600" />
              <div className="relative w-full bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 border border-white/20">
                <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Secure Account</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Just one more step to access your dashboard.</p>
                <form onSubmit={handleRegister}>
                  <InputField icon={FaEnvelope} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                  <InputField 
                    icon={FaLock} name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" 
                    value={formData.password} onChange={handleChange} required
                    rightIcon={showPassword ? FaEyeSlash : FaEye} onRightIconClick={() => setShowPassword(!showPassword)}
                  />
                  <div className="flex gap-4 mt-8">
                    <button type="button" onClick={() => setOpenDialog(false)} className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex-[2] py-3 font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl shadow-lg shadow-primary-500/30 transition-colors disabled:opacity-70">
                      {loading ? 'Creating...' : 'Complete Setup'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
