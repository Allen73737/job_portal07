import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBuilding, FaUsers } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const InputField = ({ icon: Icon, rightIcon: RightIcon, onRightIconClick, ...props }) => (
  <div className="relative group mb-4">
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="relative flex items-center bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl px-4 py-3.5 transition-all duration-300 group-focus-within:border-emerald-400 dark:group-focus-within:border-emerald-500 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
      {Icon && <Icon className="text-slate-400 group-focus-within:text-emerald-500 transition-colors mr-3 shrink-0" size={18} />}
      <input className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium" {...props} />
      {RightIcon && (
        <button type="button" onClick={onRightIconClick} className="ml-3 text-slate-400 hover:text-emerald-500 transition-colors focus:outline-none">
          <RightIcon size={18} />
        </button>
      )}
    </div>
  </div>
);

export default function Employer() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', company: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: '', password: '', company: '' });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isSignUp
        ? `${import.meta.env.VITE_API_URL}/api/employer/register`
        : `${import.meta.env.VITE_API_URL}/api/employer/login`;
      const { data } = await axios.post(url, formData);
      localStorage.setItem('employer', JSON.stringify(data.employer));
      toast.success(data.message);
      setTimeout(() => navigate('/d'), 1000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Authentication server unreachable.';
      toast.error(`${isSignUp ? 'Registration' : 'Login'} Failed: ${errorMsg}`, {
        duration: 4000,
        style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' },
        icon: '🛑'
      });
    }
    setLoading(false);
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
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&auto=format&fit=crop&q=80")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute inset-0 bg-emerald-900/20 mix-blend-overlay" />

        <div className="relative z-10 max-w-xl max-md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-8 md:mb-12 inline-flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FaUsers className="text-white text-xl" />
            </div>
            <div>
              <p className="font-black text-white text-xl leading-tight">Elite Talent Pool</p>
              <p className="text-sm text-slate-200 font-medium">Ready to hire today</p>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-7xl xl:text-[5.5rem] font-black text-white mb-6 tracking-tight leading-[1.05]"
          >
            Build Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-lg">Dream Team.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg lg:text-xl text-slate-300 leading-relaxed font-medium max-w-lg hidden sm:block"
          >
            Access a curated network of top-tier professionals. Streamline your hiring process and scale your business with the right people.
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
            className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] rounded-full bg-gradient-to-l from-emerald-400/50 to-teal-600/50 dark:from-emerald-600/40 dark:to-teal-600/40 blur-[80px] mix-blend-screen"
          />
        </div>

        <div className="relative z-10 w-full max-w-md">
          
          <div className="flex justify-start mb-8 lg:mb-12">
            <div className="w-16 h-16 max-md:w-12 max-md:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 transform hover:scale-110 transition-transform">
              <FaBuilding className="text-white text-2xl" />
            </div>
          </div>
          
          <h2 className="text-3xl lg:text-5xl max-md:text-2xl font-black text-slate-900 dark:text-white mb-3 max-md:mb-1">
            Employer Portal
          </h2>
          <p className="text-lg max-md:text-base text-slate-500 dark:text-slate-400 mb-10 max-md:mb-6 font-medium">
            {isSignUp ? 'Register your enterprise account' : 'Access your company dashboard'}
          </p>

          <AnimatePresence mode="wait">
            <motion.form 
              key={isSignUp ? "signup" : "login"}
              initial={{ opacity: 0, x: isSignUp ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
              onSubmit={handleSubmit}
            >
              <div className="space-y-4">
                {isSignUp && (
                  <InputField 
                    icon={FaBuilding} type="text" name="company" placeholder="Company Name" 
                    value={formData.company} onChange={handleChange} required 
                  />
                )}
                <InputField 
                  icon={FaEnvelope} type="email" name="email" placeholder="Work Email" 
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
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-slate-800" />
                  <label htmlFor="remember" className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer">Remember me</label>
                </div>
                {!isSignUp && <a href="#" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Forgot access?</a>}
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full relative overflow-hidden group bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 max-md:py-3 px-6 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 text-lg max-md:text-base">{loading ? 'Processing...' : (isSignUp ? 'Register Enterprise' : 'Secure Login')}</span>
                <div className="absolute inset-0 w-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:w-full transition-all duration-500 ease-out skew-x-12 -ml-12" />
              </button>
              
              <p className="text-center mt-8 text-slate-600 dark:text-slate-400 font-medium">
                {isSignUp ? "Already registered? " : "New enterprise? "}
                <button type="button" onClick={toggleMode} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  {isSignUp ? "Sign In" : "Request Access"}
                </button>
              </p>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
