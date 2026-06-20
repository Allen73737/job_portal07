import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaBars, FaTimes, FaTachometerAlt, FaPlus, FaSignOutAlt, FaUsers, FaChartLine 
} from 'react-icons/fa';

const EmployerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('employer');
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/d', icon: <FaTachometerAlt /> },
    { label: 'Post New Job', path: '/job-post', icon: <FaPlus /> },
    { label: 'Manage Applicants', path: '/applicant', icon: <FaUsers /> },
    { label: 'AI Analytics', path: '/employer/stats/jobs', icon: <FaChartLine /> }
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-28 right-6 z-50 p-4 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 hover:scale-110 hover:shadow-[0_8px_40px_rgba(16,185,129,0.4)] hover:bg-emerald-600 hover:text-white transition-all duration-300 backdrop-blur-3xl group hidden md:block"
      >
        <FaBars className="text-xl group-hover:rotate-180 transition-transform duration-300" />
      </button>

      {/* Overlay & Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 md:w-96 bg-white/80 dark:bg-slate-950/80 backdrop-blur-[40px] border-l border-white/40 dark:border-white/10 z-[70] shadow-[0_0_80px_rgba(0,0,0,0.2)] rounded-l-[3rem] flex flex-col font-sans"
            >
              <div className="p-8 flex justify-between items-center border-b border-slate-200 dark:border-white/10">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600"></div> Menu
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {navItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setIsOpen(false); navigate(item.path); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition-all group"
                  >
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-sm border border-transparent group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-lg tracking-wide">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-white/10">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl font-bold text-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm group"
                >
                  <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40 md:hidden pb-safe">
        <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl border-t border-slate-200 dark:border-white/10 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-6 py-4 flex items-center justify-between">
          {navItems.slice(0, 4).map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1.5 p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <div className="text-2xl">{item.icon}</div>
              <span className="text-[10px] font-bold tracking-wide">{item.label.split(' ')[0]}</span>
            </button>
          ))}
          <button 
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center gap-1.5 p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <div className="text-2xl"><FaBars /></div>
            <span className="text-[10px] font-bold tracking-wide">Menu</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default EmployerMenu;
