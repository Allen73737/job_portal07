import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const InputField = ({ icon: Icon, rightIcon: RightIcon, onRightIconClick, ...props }) => (
  <div className="relative group mb-8">
    <div className="relative flex items-center border-b border-slate-300 dark:border-white/20 group-focus-within:border-slate-900 dark:group-focus-within:border-white transition-colors duration-500 pb-3">
      {Icon && <Icon className="text-slate-400 dark:text-white/40 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors mr-4 shrink-0" size={18} />}
      <input className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 font-light text-lg tracking-wide" {...props} />
      {RightIcon && (
        <button type="button" onClick={onRightIconClick} className="ml-3 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none">
          <RightIcon size={18} />
        </button>
      )}
    </div>
  </div>
);

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Apply .trim() and .toLowerCase() to catch accidental spaces or auto-capitalization
    const payload = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim()
    };

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/login`, payload);
      localStorage.setItem('adminToken', data.token); // Store token
      toast.success('System Override Complete. Access Granted.', {
        duration: 3000,
        style: { background: '#000', color: '#fff', border: '1px solid #333' }
      });
      setTimeout(() => navigate('/adb'), 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Connection Refused: Target server offline.';
      toast.error(`Access Denied: ${errorMsg}`, {
        duration: 4000,
        style: { background: '#000', color: '#ef4444', border: '1px solid #7f1d1d' },
        icon: '🛑'
      });
    }
    setLoading(false);
  };

  return (
    <div className="relative -mt-28 min-h-screen flex flex-col lg:flex-row font-sans overflow-hidden bg-white dark:bg-black selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Left Panel - Monolith Visual */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full lg:w-1/2 min-h-[40vh] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-24 pt-32 lg:pt-32"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center grayscale contrast-125"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent dark:from-black dark:via-black/80 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-50/50 dark:from-black dark:via-transparent dark:to-black/50" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center mb-8 backdrop-blur-md bg-white/50 dark:bg-white/5">
            <FaShieldAlt className="text-slate-800 dark:text-white text-2xl" />
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-slate-500 dark:text-white/50 tracking-[0.3em] text-sm font-bold uppercase mb-4">Classified Access</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-[1.05]">
              The <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-500 to-slate-400 dark:from-white dark:via-slate-300 dark:to-slate-600">Monolith.</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-white/60 leading-relaxed font-light max-w-md">
              Restricted executive terminal. All connection attempts are monitored, encrypted, and recorded.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Form Canvas */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 pt-32 lg:pt-32 bg-slate-50 dark:bg-black"
      >
        <div className="relative z-10 w-full max-w-md">
          
          <h2 className="text-3xl lg:text-4xl font-light text-slate-900 dark:text-white mb-2 tracking-tight">
            Authenticate
          </h2>
          <p className="text-sm text-slate-500 dark:text-white/40 mb-16 tracking-widest uppercase">
            Provide system credentials
          </p>

          <form onSubmit={handleSubmit}>
            <InputField 
              icon={FaEnvelope} 
              type="email" 
              name="email" 
              placeholder="Identification (Email)" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
            <InputField 
              icon={FaLock} 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Security Key" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              rightIcon={showPassword ? FaEyeSlash : FaEye}
              onRightIconClick={() => setShowPassword(!showPassword)}
            />
            
            <div className="mt-16">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full relative overflow-hidden group bg-slate-900 text-white dark:bg-white dark:text-black font-black py-5 px-6 transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-slate-200 shadow-xl dark:shadow-none"
              >
                <span className="relative z-10 text-lg uppercase tracking-[0.2em]">{loading ? 'Verifying...' : 'Initialize'}</span>
              </button>
            </div>
          </form>

          <div className="mt-24 text-center">
            <p className="text-xs text-slate-400 dark:text-white/20 tracking-widest uppercase font-mono">
              IP: SECURE • CONNECTION: ENCRYPTED
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
