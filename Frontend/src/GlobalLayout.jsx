import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme';
import { FaBriefcase, FaFacebookF, FaTwitter, FaLinkedinIn, FaSearch, FaArrowUp } from 'react-icons/fa';
import { FiSun, FiMoon } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform, useVelocity, useSpring } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import AIHeadhunter from "./components/Job/AIHeadhunter";
import JobSeekerMenu from "./components/Job/JobSeekerMenu";
import EmployerMenu from "./components/Employer/EmployerMenu";

// 5. Premium Magnetic Cursor Tooltips
const MagneticTooltip = memo(function MagneticTooltip() {
  const [tooltip, setTooltip] = useState({ text: '', visible: false, x: 0, y: 0 });

  useEffect(() => {
    let rafId = null;
    const handleMouseMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
          setTooltip({
            text: target.getAttribute('data-tooltip'),
            visible: true,
            x: e.clientX,
            y: e.clientY
          });
        } else {
          setTooltip(prev => prev.visible ? { ...prev, visible: false } : prev);
        }
        rafId = null;
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => { window.removeEventListener('mousemove', handleMouseMove); if (rafId) cancelAnimationFrame(rafId); };
  }, []);

  return (
    <AnimatePresence>
      {tooltip.visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, x: tooltip.x + 15, y: tooltip.y + 15 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.5 }}
          className="fixed top-0 left-0 z-[99999] pointer-events-none px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-primary-500/20 shadow-[0_15px_40px_rgba(37,99,235,0.2)] rounded-2xl font-bold tracking-wide text-sm text-primary-600 dark:text-primary-400"
          style={{ willChange: 'transform, opacity' }}
        >
          {tooltip.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
});


// 3. Magnetic Physics Navigation Links
const springConfig = { type: "spring", stiffness: 150, damping: 15, mass: 0.1 };
const MagneticLink = memo(function MagneticLink({ children, to, className, onClick }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
  }, []);

  const reset = useCallback(() => setPosition({ x: 0, y: 0 }), []);

  if (onClick && !to) {
    return (
      <motion.button
        ref={ref}
        onMouseMove={handleMouse}
        onMouseLeave={reset}
        animate={{ x: position.x, y: position.y }}
        transition={springConfig}
        className={className}
        onClick={onClick}
        style={{ willChange: 'transform' }}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={springConfig}
      style={{ willChange: 'transform' }}
    >
      <Link to={to} className={className}>
        {children}
      </Link>
    </motion.div>
  );
});

// 4. Interactive Scroll-Progress Ring
const ScrollProgress = memo(function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);

  return (
    <motion.button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-[90] w-14 h-14 rounded-full bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl flex items-center justify-center border border-white/20 group hover:scale-110 transition-transform hidden md:flex"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.9 }}
      style={{ willChange: 'transform' }}
    >
      <svg className="w-14 h-14 transform -rotate-90 absolute" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" className="stroke-slate-200/20 dark:stroke-slate-800/50" strokeWidth="4" fill="none" />
        <motion.circle
          cx="50" cy="50" r="46"
          className="stroke-primary-500"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          style={{ pathLength: scrollYProgress }}
        />
      </svg>
      <div className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity absolute">
        <FaArrowUp size={20} />
      </div>
    </motion.button>
  );
});

// 5. Contextual "Frosted Glass" Toast Notifications
const Toast = memo(function Toast({ message, isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-28 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-primary-500/20 shadow-[0_20px_50px_rgba(37,99,235,0.2)] rounded-full flex items-center space-x-3 pointer-events-none"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]" />
          <span className="font-bold text-slate-800 dark:text-white tracking-wide">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

function Preloader({ onComplete, mode, particlesInit }) {
  const preloaderParticlesOptions = useMemo(() => ({
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
      color: { value: mode === 'light' ? "#3b82f6" : "#38bdf8" }, // More vibrant cyan/blue
      links: {
        color: mode === 'light' ? "#3b82f6" : "#38bdf8",
        distance: 150,
        enable: true,
        opacity: 0.8, // Much higher opacity
        width: 2.5, // Thicker lines
      },
      move: { enable: true, speed: 4, outModes: { default: "bounce" } }, // Faster animation
      number: { density: { enable: true, area: 800 }, value: 120 }, // Much denser network
      opacity: { value: 1 }, // Brighter particles
      size: { value: { min: 2, max: 5 } }, // Bigger particles
    },
    detectRetina: true,
  }), [mode]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 2.5, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden ${mode === 'dark' ? 'bg-[#0a0a0a]' : 'bg-slate-50'}`}
    >
      {/* Network Particles appearing slowly from center */}
      <motion.div 
        initial={{ scale: 0, opacity: 0, rotate: -45 }} 
        animate={{ scale: 1.5, opacity: 1, rotate: 0 }} 
        transition={{ duration: 2.5, type: "spring", bounce: 0.3 }}
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[100vw] h-[100vh] [mask-image:radial-gradient(circle_at_center,black_0%,transparent_90%)]">
          <Particles id="preloader-particles" init={particlesInit} options={preloaderParticlesOptions} className="w-full h-full" />
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
        className="flex items-center space-x-4 relative z-10"
      >
        <div className="w-16 h-16 bg-primary-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_40px_rgba(37,99,235,0.6)]">
          <FaBriefcase size={32} />
        </div>
        <span className={`text-5xl font-bold tracking-tight drop-shadow-lg ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          JobPortal<span className="text-primary-600 dark:text-primary-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">.</span>
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function GlobalLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const location = useLocation();

  const { scrollY, scrollYProgress } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Dynamic Background Theming based on scroll
  const currentBg = mode === 'dark' ? "#0f172a" : "#f0f4f8";

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    const html = document.documentElement;
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
    
    if (mode === 'dark') {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      link.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌙</text></svg>";
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      link.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☀️</text></svg>";
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    showToast(`${mode === 'light' ? 'Dark' : 'Light'} Mode Activated`);
  };
  const theme = getTheme(mode);

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = useMemo(() => ({
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
      color: { value: mode === 'light' ? "#2563eb" : "#38bdf8" },
      links: {
        color: mode === 'light' ? "#2563eb" : "#38bdf8",
        distance: 150,
        enable: true,
        opacity: mode === 'light' ? 0.4 : 0.3,
        width: 2,
      },
      move: {
        enable: true,
        outModes: { default: "bounce" },
        random: false,
        speed: 1,
        straight: false,
      },
      number: { density: { enable: true, area: 800 }, value: 60 },
      opacity: { value: mode === 'light' ? 0.6 : 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 2, max: 4 } },
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: { enable: true, mode: "grab" },
        resize: true,
      },
      modes: {
        grab: { distance: 200, links: { opacity: 0.8 } },
      },
    },
    detectRetina: true,
  }), [mode]);

  // Premium "Scale & Slide" Fluid Transition
  const pageVariants = {
    initial: { opacity: 0, y: 100, filter: "blur(20px)", scale: 0.95 },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, transition: { type: "spring", stiffness: 120, damping: 20, mass: 0.8 } },
    exit: { opacity: 0, y: -50, filter: "blur(20px)", scale: 0.95, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  const navRef = useRef(null);
  const [navMousePos, setNavMousePos] = useState({ x: 0, y: 0, opacity: 0 });
  const [toastMsg, setToastMsg] = useState('');
  
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const navRafRef = useRef(null);
  const handleNavMouseMove = useCallback((e) => {
    if (navRafRef.current) return;
    navRafRef.current = requestAnimationFrame(() => {
      if (!navRef.current) { navRafRef.current = null; return; }
      const rect = navRef.current.getBoundingClientRect();
      setNavMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top, opacity: 1 });
      navRafRef.current = null;
    });
  }, []);
  const handleNavMouseLeave = useCallback(() => setNavMousePos(prev => ({ ...prev, opacity: 0 })), []);



  const [isNavExpanded, setIsNavExpanded] = useState(false);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Preloader onComplete={() => setLoading(false)} mode={mode} particlesInit={particlesInit} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Job Seeker Navigation Menu */}
      {['/job', '/profile', '/editprofile', '/all-jobs', '/resume-studio', '/ap'].some(path => location.pathname.startsWith(path)) && (
        <JobSeekerMenu />
      )}
      
      {/* Employer Navigation Menu */}
      {['/d', '/job-post', '/applicant'].some(path => location.pathname.startsWith(path)) && (
        <EmployerMenu />
      )}
      <div className={`font-sans selection:bg-primary-200 selection:text-primary-900 dark:selection:bg-primary-800 dark:selection:text-white ${mode === 'dark' ? 'dark text-slate-100 bg-[#020617]' : 'text-slate-900 bg-[#e2e8f0]'}`}>
        
        <ScrollProgress />
        <Toast message={toastMsg} isVisible={!!toastMsg} />
        <MagneticTooltip />
        
        {/* 1. Cinematic Film Grain Overlay - GPU accelerated */}
        <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay" style={{ willChange: 'transform', transform: 'translateZ(0)', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, backgroundSize: '256px 256px' }}></div>

        {/* Light Mode Ambient Gradient Orbs */}
        {mode === 'light' && (
          <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
            <motion.div
              animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-400/[0.07] via-sky-300/[0.05] to-transparent blur-[100px]"
            />
            <motion.div
              animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-violet-400/[0.06] via-indigo-300/[0.04] to-transparent blur-[100px]"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-gradient-to-r from-cyan-300/[0.04] to-blue-400/[0.03] blur-[80px]"
            />
            {/* Subtle dot-grid pattern */}
            <div className="absolute inset-0 light-dot-grid opacity-40" />
          </div>
        )}

        <motion.div 
          style={{ backgroundColor: currentBg }} 
          className="relative z-20 min-h-screen flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Dark Mode Ambient Blue Overlay */}
          {mode === 'dark' && location.pathname !== '/' && (
            <div className="fixed inset-0 z-[0] pointer-events-none overflow-hidden mix-blend-screen">
              <div className="absolute inset-0 bg-blue-900/20 mix-blend-color" />
              <motion.div
                animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-bl from-blue-500/[0.12] via-indigo-500/[0.08] to-transparent blur-[120px]"
              />
              <motion.div
                animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-cyan-500/[0.12] via-blue-600/[0.08] to-transparent blur-[120px]"
              />
            </div>
          )}
          {/* Global Particles */}
          <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className="fixed inset-0 z-[-1] pointer-events-none" style={{ willChange: 'transform' }} />

        {/* Global Navbar */}
        <div className="fixed top-0 left-0 right-0 z-[110] flex justify-center w-full pointer-events-none">
          <motion.nav
            ref={navRef}
            onMouseMove={handleNavMouseMove}
            onMouseLeave={handleNavMouseLeave}
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            initial={{ y: 0, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              width: isScrolled && !isNavExpanded ? '90%' : '100%',
              marginTop: isScrolled && !isNavExpanded ? '1rem' : '0',
              borderRadius: isScrolled && !isNavExpanded ? '9999px' : '0px',
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ 
              backdropFilter: "blur(20px)", 
              borderColor: isScrolled ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.1)",
              WebkitBackdropFilter: "blur(20px)",
              willChange: 'transform, width, border-radius'
            }}
            className={`pointer-events-auto cursor-pointer shadow-lg transition-all duration-500 overflow-hidden relative ${mode === 'light' ? 'bg-white/80 border-slate-200/60 shadow-[0_4px_30px_rgba(59,130,246,0.08)]' : 'bg-slate-900/70'} backdrop-blur-2xl ${isScrolled && !isNavExpanded ? 'px-4 md:px-8 py-2 md:py-3 shadow-primary-500/10 border-b border-t border-x' : 'px-4 md:px-6 py-3 md:py-4 border-b border-b-transparent shadow-transparent'}`}
          >
            <div 
              className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-0"
              style={{
                opacity: navMousePos.opacity,
                background: `radial-gradient(150px circle at ${navMousePos.x}px ${navMousePos.y}px, rgba(37, 99, 235, 0.15), transparent 40%)`
              }}
            />
            <div className="relative z-10 flex justify-between items-center w-full">
              <Link to="/" className="flex items-center space-x-2 md:space-x-3 cursor-pointer scale-90 md:scale-100 origin-left" data-tooltip="Go to Homepage" onClick={(e) => e.stopPropagation()}>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/30">
                  <FaBriefcase className="text-sm md:text-xl" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                  JobPortal<span className="text-primary-600 dark:text-primary-400">.</span>
                </span>
              </Link>
            
            <div className="flex items-center space-x-3 md:space-x-8 scale-90 md:scale-100 origin-right" onClick={(e) => e.stopPropagation()}>
              <MagneticLink 
                onClick={toggleTheme} 
                className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <AnimatePresence mode="wait">
                  {mode === 'dark' ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <FiSun size={24} />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <FiMoon size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </MagneticLink>
              <MagneticLink to="/" className="hidden md:block font-bold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-white transition-colors">
                Home
              </MagneticLink>
              <MagneticLink to="/j" className="hidden md:block font-bold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-white transition-colors">
                Seeker Login
              </MagneticLink>
              <MagneticLink to="/e" className="hidden md:block font-bold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-white transition-colors">
                Employer Login
              </MagneticLink>
              <MagneticLink to="/adl">
                <button className="premium-button-primary scale-90">
                  Admin
                </button>
              </MagneticLink>
            </div>
            </div>

            {/* Mega Menu Expandable Section */}
            <AnimatePresence>
              {isNavExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="pt-4 md:pt-8 pb-4 border-t border-slate-200/40 dark:border-white/10 mt-3 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 px-2 md:px-4 cursor-default max-w-7xl mx-auto relative z-20">
                    
                    {/* Hero & Intro */}
                    <div>
                      <h3 className="text-primary-600 dark:text-primary-400 font-bold mb-3 md:mb-5 uppercase tracking-widest text-[10px] md:text-xs">Introduction</h3>
                      <ul className="space-y-2 md:space-y-4">
                        <li><a href="/#hero" onClick={() => setIsNavExpanded(false)} className="text-xs md:text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">Hero Area</a></li>
                        <li><a href="/#brands" onClick={() => setIsNavExpanded(false)} className="text-xs md:text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">Trusted Brands</a></li>
                      </ul>
                    </div>

                    {/* Features */}
                    <div>
                      <h3 className="text-primary-600 dark:text-primary-400 font-bold mb-3 md:mb-5 uppercase tracking-widest text-[10px] md:text-xs">Features</h3>
                      <ul className="space-y-2 md:space-y-4">
                        <li><a href="/#features" onClick={() => setIsNavExpanded(false)} className="text-xs md:text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">Premium Job Matching</a></li>
                        <li><a href="/#features" onClick={() => setIsNavExpanded(false)} className="text-xs md:text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">Smart Applicant Tracking</a></li>
                        <li><a href="/#features" onClick={() => setIsNavExpanded(false)} className="text-xs md:text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">Executive Dashboard</a></li>
                      </ul>
                    </div>

                    {/* Pathways */}
                    <div>
                      <h3 className="text-primary-600 dark:text-primary-400 font-bold mb-3 md:mb-5 uppercase tracking-widest text-[10px] md:text-xs">Get Started</h3>
                      <ul className="space-y-2 md:space-y-4">
                        <li><a href="/#pathway" onClick={() => setIsNavExpanded(false)} className="text-xs md:text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">Choose Your Path</a></li>
                        <li><Link to="/j" onClick={() => setIsNavExpanded(false)} className="text-xs md:text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">Job Seeker Login</Link></li>
                        <li><Link to="/e" onClick={() => setIsNavExpanded(false)} className="text-xs md:text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">Employer Login</Link></li>
                      </ul>
                    </div>

                    {/* Quick Action */}
                    <div>
                      <h3 className="text-primary-600 dark:text-primary-400 font-bold mb-3 md:mb-5 uppercase tracking-widest text-[10px] md:text-xs">Admin</h3>
                      <div className="p-3 md:p-5 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] md:text-sm text-slate-700 dark:text-slate-300 mb-2 md:mb-4 leading-relaxed">Authorized personnel only.</p>
                        <Link to="/adl" onClick={() => setIsNavExpanded(false)} className="inline-block text-[10px] md:text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-black py-1.5 md:py-2 px-3 md:px-4 rounded-lg hover:scale-105 transition-transform">Command Center &rarr;</Link>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </div>

        {/* Main Content with Route Transitions */}
        <main className="flex-grow relative z-10 origin-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        </motion.div>

        {/* Global Footer */}
        <div className="relative z-10 w-full mt-auto">
          <motion.footer 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15, type: 'spring', damping: 20, stiffness: 100 } }
            }}
            className={`w-full backdrop-blur-2xl border-t shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)] text-slate-600 dark:text-slate-400 py-8 md:py-16 text-sm md:text-base overflow-hidden relative ${mode === 'light' ? 'bg-white/80 border-slate-200/60 shadow-[0_-4px_30px_rgba(59,130,246,0.08)]' : 'bg-slate-900/70 border-white/10'}`}
          >
          {/* Subtle glowing top border & ambient light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-primary-500/30 dark:via-primary-500/50 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[200px] bg-primary-500/5 dark:bg-primary-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="max-w-[90rem] mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 relative z-10">
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } } }} className="space-y-5">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/30">
                  <FaBriefcase size={20} />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">JobPortal.</span>
              </div>
              <p className="text-base leading-relaxed">
                Connecting the world's professionals to make them more productive and successful.
              </p>
              <div className="flex space-x-4 pt-4">
                {[FaFacebookF, FaTwitter, FaLinkedinIn].map((Icon, idx) => (
                  <motion.a 
                    key={idx}
                    href="#" 
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 transition-colors shadow-sm border border-gray-200 dark:border-gray-800"
                  >
                    <Icon size={20} />
                  </motion.a>
                ))}
              </div>
            </motion.div>
            
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } } }}>
              <h4 className="text-gray-900 dark:text-white font-bold mb-6 uppercase text-base tracking-wider">Corporate Office</h4>
              <ul className="space-y-4 text-base">
                <li className="flex items-center space-x-3"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" /><span>Info Edge (India) Limited</span></li>
                <li className="flex items-center space-x-3"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" /><span>B - 8, Sector - 132</span></li>
                <li className="flex items-center space-x-3"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" /><span>Noida - 201304, India</span></li>
              </ul>
            </motion.div>
            
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } } }}>
              <h4 className="text-gray-900 dark:text-white font-bold mb-6 uppercase text-base tracking-wider">Quick Links</h4>
              <ul className="space-y-4 text-base">
                {[{name: 'Home', path: '/'}, {name: 'Job Seekers', path: '/j'}, {name: 'Employers', path: '/e'}].map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.path} className="group flex items-center text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      <span className="w-0 h-px bg-primary-600 dark:bg-primary-400 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } } }}>
              <h4 className="text-gray-900 dark:text-white font-bold mb-6 uppercase text-base tracking-wider">Newsletter</h4>
              <div className="flex shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 transition-all border border-gray-200 dark:border-gray-800">
                <input 
                  type="email" 
                  placeholder="Enter email" 
                  className="bg-white dark:bg-gray-800/50 border-none px-5 py-3 w-full text-base outline-none text-gray-900 dark:text-white"
                />
                <button className="bg-primary-600 hover:bg-primary-500 px-5 py-3 transition-colors shrink-0">
                  <FaSearch size={16} className="text-white" />
                </button>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.5 } } }}
            className="max-w-[90rem] mx-auto px-4 md:px-12 mt-10 md:mt-20 pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-800 text-xs md:text-base flex flex-col md:flex-row justify-between items-center relative z-10 max-md:text-center max-md:gap-4"
          >
            <p>&copy; {new Date().getFullYear()} JobPortal. All rights reserved.</p>
            <p className="mt-2 md:mt-0 text-slate-500">Designed with <span className="animate-pulse inline-block">❤️</span> for premium professionals.</p>
          </motion.div>
          </motion.footer>
        </div>
        
        {/* Global AI Headhunter Widget */}
        <AIHeadhunter />
      </div>
    </ThemeProvider>
  );
}
