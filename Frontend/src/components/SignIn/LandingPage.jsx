import React, { useRef, useState, useEffect, useCallback, useMemo, memo } from 'react';
import { FaUsers, FaBriefcase, FaChartLine, FaSearch, FaMapMarkerAlt, FaRegFileAlt, FaCheckCircle, FaChartPie, FaUserTie, FaBolt, FaShieldAlt, FaRocket, FaExclamationTriangle, FaMicrochip, FaBuilding, FaGlobe, FaStar, FaArrowUp, FaArrowRight } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useScroll, useTransform, useVelocity, useSpring, useMotionValue, useMotionTemplate, useMotionValueEvent } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const testimonialsData = [
  // 0: Active Job Seekers
  [
    { text: "The platform made finding my Senior Dev role effortless. Highly recommend!", author: "Sarah Jenkins", role: "Senior Developer", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
    { text: "I landed 3 interviews within my first week. Incredible UX and matching.", author: "Marcus Thorne", role: "UX Designer", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
    { text: "Finally, a job portal that doesn't feel like a spreadsheet. Got hired in 10 days.", author: "Elena Rodriguez", role: "Product Manager", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" },
    { text: "The organic layout makes job hunting actually enjoyable. Secured my dream job!", author: "David Kim", role: "Frontend Engineer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
    { text: "Trustworthy and fast. I found a company that perfectly aligns with my values.", author: "Aaliyah Patel", role: "Data Scientist", image: "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?w=150&h=150&fit=crop" },
  ],
  // 1: Job Openings
  [
    { text: "We sourced our entire engineering team here in just 2 weeks.", author: "Michael Chang", role: "CTO", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" },
    { text: "The quality of candidates is unmatched. Best premium portal available.", author: "Sarah O'Connor", role: "HR Director", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop" },
    { text: "Posting a job takes seconds, and the applicant tracking is top-tier.", author: "James Wilson", role: "Founder", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop" },
    { text: "Our time-to-hire dropped by 40% after switching to this platform.", author: "Priya Sharma", role: "Recruiter", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop" },
    { text: "A beautiful interface that attracts serious, high-quality professionals.", author: "Thomas Wright", role: "CEO", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop" },
  ],
  // 2: Placement Success
  [
    { text: "I was skeptical of the placement rate until I got 3 offers in a week.", author: "Daniel Lee", role: "Backend Engineer", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop" },
    { text: "They don't just list jobs; they actively ensure you get placed.", author: "Sophia Martinez", role: "Marketing Lead", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" },
    { text: "98% success rate is real! I was matched with an amazing agency instantly.", author: "Chris Evans", role: "Art Director", image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop" },
    { text: "The personalized recommendations lead to actual placements, not just rejections.", author: "Olivia Taylor", role: "Project Manager", image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop" },
    { text: "From sign-up to offer letter in 14 days. This platform delivers results.", author: "Liam Johnson", role: "Software Architect", image: "https://images.unsplash.com/photo-1552058544-e2bfd330c733?w=150&h=150&fit=crop" },
  ]
];

// 5. "Liquid Jelly" Magnetic Buttons
const jellySpring = { type: "spring", stiffness: 300, damping: 10, mass: 0.8 };
const MagneticJellyButton = memo(function MagneticJellyButton({ children, className, onClick, onMouseEnter, onMouseLeave }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  const handleMouse = useCallback((e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  }, []);

  const reset = useCallback(() => setPosition({ x: 0, y: 0 }), []);

  return (
    <motion.button
      ref={ref}
      className={`${className} relative z-[100]`}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseEnter={() => { setIsHovered(true); onMouseEnter?.(); }}
      onMouseLeave={() => { reset(); setIsHovered(false); onMouseLeave?.(); }}
      animate={{ 
        x: position.x, 
        y: position.y,
        scale: isHovered ? 1.05 : 1,
      }}
      whileTap={{ scale: 0.9, borderRadius: "2rem" }}
      transition={jellySpring}
    >
      <motion.div
        animate={{ x: position.x * 0.2, y: position.y * 0.2 }}
        transition={jellySpring}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </motion.button>
  );
});

function AnimatedBorderButton({ children, className, onMouseEnter, onMouseLeave }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-[2px] group w-full">
      <div className="absolute inset-[-1000%] animate-spin bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#3b82f6_50%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDuration: '3s' }} />
      <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-[14px] overflow-hidden">
        <MagneticJellyButton className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          {children}
        </MagneticJellyButton>
      </div>
    </div>
  );
}

function SpotlightCard({ children, className }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };
  
  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(37, 99, 235, 0.15), transparent 40%)`;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 z-50"
        style={{
          opacity,
          background,
        }}
      />
      {children}
    </div>
  );
}


// 10. Ultimate Premium CTA Button
function UltimatePremiumCTA({ text, to, icon: Icon, primary = false }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const buttonRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };
  
  const background = useMotionTemplate`radial-gradient(150px circle at ${mouseX}px ${mouseY}px, ${primary ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)'}, transparent 100%)`;

  return (
    <Link to={to} className="w-full sm:w-auto relative group block">
      {/* Massive Glowing Aura for Primary */}
      {primary && (
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 rounded-full blur-2xl opacity-40 group-hover:opacity-80 transition duration-700 animate-pulse pointer-events-none" />
      )}

      {/* Moving Gradient Border Wrapper */}
      <div 
        ref={buttonRef}
        onMouseMove={handleMouseMove}
        className={`relative p-[3px] rounded-full overflow-hidden transition-transform duration-300 hover:scale-[1.04] shadow-2xl ${primary ? 'shadow-blue-500/50' : 'shadow-slate-500/20'}`}
      >
        {/* Static Optimized Gradient for the Border */}
        <div className={`absolute inset-0 ${primary ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
        
        {/* Button Core */}
        <div className="relative w-full h-full bg-slate-50 dark:bg-slate-900 rounded-[calc(9999px-3px)] px-10 py-5 flex items-center justify-center gap-3 overflow-hidden border border-white/20 dark:border-white/5">
          
          {/* Mouse Spotlight effect inside */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition duration-300 mix-blend-overlay"
            style={{
              background,
            }}
          />
          
          {/* Shiny overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] pointer-events-none" />
          
          <span className={`relative z-10 font-black text-xl tracking-tight ${primary ? 'text-slate-900 dark:text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'text-slate-700 dark:text-slate-200'}`}>
            {text}
          </span>
          {Icon && <Icon className={`relative z-10 ${primary ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'} group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-md`} size={22} />}
        </div>
      </div>
    </Link>
  );
}

// 10.5 Ultimate Premium Search Bar
function UltimatePremiumSearchBar({ placeholder, buttonText, primary = true, className = "" }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    if (!searchRef.current) return;
    const rect = searchRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };
  
  const background = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, ${primary ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)'}, transparent 100%)`;

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/all-jobs?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate(`/all-jobs`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`w-full relative group block pointer-events-auto ${className}`}>
      {/* Massive Glowing Aura for Primary */}
      {primary && (
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 rounded-full blur-2xl opacity-40 group-hover:opacity-80 transition duration-700 animate-pulse pointer-events-none" />
      )}

      {/* Moving Gradient Border Wrapper */}
      <div 
        ref={searchRef}
        onMouseMove={handleMouseMove}
        className={`relative p-[3px] rounded-full overflow-hidden transition-transform duration-300 shadow-2xl ${primary ? 'shadow-blue-500/50' : 'shadow-slate-500/20'}`}
      >
        {/* Static Optimized Gradient for the Border */}
        <div className={`absolute inset-0 ${primary ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500' : 'bg-slate-300 dark:bg-slate-700'} pointer-events-none`} />
        
        {/* Search Bar Core */}
        <div className="relative w-full h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[calc(9999px-3px)] p-2 flex items-center overflow-hidden border border-white/20 dark:border-white/5 pointer-events-auto">
          
          {/* Mouse Spotlight effect inside */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition duration-300 mix-blend-overlay"
            style={{
              background,
            }}
          />
          
          {/* Shiny overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] pointer-events-none" />
          
          <FaSearch className={`relative z-10 ml-4 mr-3 ${primary ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'} drop-shadow-md`} size={20} />
          
          <input 
            type="text" 
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="relative z-10 w-full bg-transparent border-none outline-none text-base md:text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0" 
          />
          
          <button 
            onClick={handleSearch}
            className={`relative z-10 flex-shrink-0 px-6 md:px-8 py-3 rounded-full font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 ml-2`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}



// 11. Shatter Text Components
function ShatterChar({ char }) {
  const randomX = useMemo(() => (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 400 + 100), []);
  const randomY = useMemo(() => (Math.random() * -400) - 100, []);
  const randomRotate = useMemo(() => (Math.random() * 360) - 180, []);
  const randomScale = useMemo(() => Math.random() * 1.5 + 0.2, []);

  const variants = {
    hidden: { opacity: 0, x: randomX, y: randomY, rotateZ: randomRotate, scale: randomScale },
    visible: { opacity: 1, x: 0, y: 0, rotateZ: 0, scale: 1, transition: { type: "spring", damping: 12, stiffness: 100 } }
  };

  return (
    <motion.span variants={variants} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
      {char}
    </motion.span>
  );
}

function ShatterText({ text, className }) {
  return (
    <motion.span 
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: { transition: { staggerChildren: 0.02 } }
      }}
    >
      {text.split("").map((char, i) => (
        <ShatterChar key={i} char={char} />
      ))}
    </motion.span>
  );
}

// 3. Cinematic Scroll-Linked Stacking Feature Deck
function StackingFeatureDeck() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Timeline (300vh = 3 tight scroll-steps):
  //
  // ENTRY PHASE:
  //   0.00–0.10 → Card 1 flies in from left, lands center
  //   0.10–0.25 → Hold (Card 1 visible)
  //   0.25–0.35 → Card 2 flies in from right, stacks on Card 1
  //   0.35–0.50 → Hold (Cards 1+2 stacked)
  //   0.50–0.60 → Card 3 flies in from bottom, stacks on top
  //   0.60–0.70 → Hold (all 3 stacked)
  //
  // EXIT PHASE:
  //   0.70–0.80 → Card 3 exits upward
  //   0.80–0.90 → Card 2 exits right
  //   0.90–1.00 → Card 1 exits left

  // ─── Card 1 ───
  // Enters from left, gets pushed back as cards stack on it, then exits left
  const c1X = useTransform(scrollYProgress,
    [0, 0.05, 0.95, 1.0],
    ["-120vw", "0vw", "0vw", "-120vw"]
  );
  const c1Rotate = useTransform(scrollYProgress,
    [0, 0.05, 0.95, 1.0],
    [-15, 0, 0, -15]
  );
  // Scale shrinks as cards stack on top, returns to 1 as they leave
  const c1Scale = useTransform(scrollYProgress,
    [0, 0.05, 0.25, 0.35, 0.50, 0.60, 0.75, 0.85, 0.95, 1.0],
    [1, 1,     1,    0.93,  0.93, 0.86, 0.86, 0.93, 1,    1]
  );
  // Shifts up as cards stack on top
  const c1Y = useTransform(scrollYProgress,
    [0, 0.05, 0.25, 0.35, 0.50, 0.60, 0.75, 0.85, 0.95, 1.0],
    ["0vh","0vh","0vh","-4vh","-4vh","-8vh","-8vh","-4vh","0vh","0vh"]
  );

  // ─── Card 2 ───
  // Hidden offscreen until 0.25, enters from right, stacks, then exits right
  const c2X = useTransform(scrollYProgress,
    [0, 0.25, 0.35, 0.85, 0.95, 1.0],
    ["120vw","120vw","0vw","0vw","120vw","120vw"]
  );
  const c2Rotate = useTransform(scrollYProgress,
    [0, 0.25, 0.35, 0.85, 0.95, 1.0],
    [15, 15, 0, 0, 15, 15]
  );
  // Scale shrinks when Card 3 stacks on it
  const c2Scale = useTransform(scrollYProgress,
    [0, 0.35, 0.50, 0.60, 0.75, 0.85, 1.0],
    [1, 1,     1,   0.93, 0.93, 1,     1]
  );
  const c2Y = useTransform(scrollYProgress,
    [0, 0.35, 0.50, 0.60, 0.75, 0.85, 1.0],
    ["0vh","0vh","0vh","-4vh","-4vh","0vh","0vh"]
  );

  // ─── Card 3 ───
  // Hidden offscreen until 0.50, enters from bottom, stacks on top, exits upward
  const c3Y = useTransform(scrollYProgress,
    [0, 0.50, 0.60, 0.75, 0.85, 1.0],
    ["120vh","120vh","0vh","0vh","-120vh","-120vh"]
  );
  const c3Rotate = useTransform(scrollYProgress,
    [0, 0.50, 0.60, 0.75, 0.85, 1.0],
    [8, 8, 0, 0, -8, -8]
  );

  return (
    <div id="features" ref={containerRef} className="relative w-full z-[60]" style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden px-4 md:px-8 max-md:pt-20">
        {/* Card 1 */}
        <motion.div 
          style={{ x: c1X, y: c1Y, scale: c1Scale, rotateZ: c1Rotate }}
          className="absolute w-[90vw] xl:w-[75vw] max-w-[90vw] xl:max-w-[75vw] h-[65vh] md:h-[55vh] rounded-[3rem] p-[2px] origin-center overflow-hidden will-change-transform transform-gpu drop-shadow-xl"
        >
          {/* Static Optimized Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500" />
          
          <div className="relative z-10 w-full h-full rounded-[2.9rem] bg-gradient-to-br from-white/95 via-blue-50/80 to-purple-50/50 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-900/40 overflow-hidden flex flex-col md:flex-row border border-white/80 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="flex-1 p-6 md:p-10 lg:p-20 flex flex-col justify-center">
              <FaBolt className="text-5xl text-blue-500 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">Lightning Fast AI Matching</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">Our proprietary matching engine processes over 10M datapoints instantly to find your perfect fit in milliseconds, not weeks.</p>
            </div>
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/20">
               <div className="absolute w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.5)_0%,transparent_70%)]" />
               <div className="w-48 h-48 border-[2px] border-blue-400/50 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                  <div className="absolute w-full h-full border-[2px] border-cyan-400/50 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
                  <div className="absolute w-full h-full border-[2px] border-cyan-400/30 rounded-full scale-110" />
                  <div className="absolute w-24 h-24 bg-[radial-gradient(circle,rgba(96,165,250,0.8)_0%,transparent_70%)] rounded-full" />
               </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          style={{ x: c2X, y: c2Y, scale: c2Scale, rotateZ: c2Rotate }}
          className="absolute w-[90vw] xl:w-[75vw] max-w-[90vw] xl:max-w-[75vw] h-[65vh] md:h-[55vh] rounded-[3rem] p-[2px] origin-center overflow-hidden will-change-transform transform-gpu drop-shadow-xl"
        >
          {/* Static Optimized Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500" />

          <div className="relative z-10 w-full h-full rounded-[2.9rem] bg-gradient-to-br from-white/95 via-emerald-50/80 to-teal-50/50 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-900/40 overflow-hidden flex flex-col md:flex-row border border-white/80 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="flex-1 p-6 md:p-10 lg:p-20 flex flex-col justify-center">
              <FaShieldAlt className="text-5xl text-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">Enterprise-Grade Security</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">Your personal data is heavily encrypted and protected with AES-256 military-grade security. You control exactly who sees your profile.</p>
            </div>
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-emerald-500/10 dark:bg-emerald-500/20">
               <div className="absolute w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.5)_0%,transparent_70%)]" />
               <div className="w-48 h-48 border-[2px] border-emerald-400/50 rounded-2xl flex items-center justify-center relative shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                 <div className="absolute w-32 h-32 border-[2px] border-teal-400/50 rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.4)]" />
                 <div className="absolute w-24 h-24 bg-[radial-gradient(circle,rgba(52,211,153,0.8)_0%,transparent_70%)] rounded-full" />
               </div>
            </div>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          style={{ y: c3Y, rotateZ: c3Rotate }}
          className="absolute w-[90vw] xl:w-[75vw] max-w-[90vw] xl:max-w-[75vw] h-[65vh] md:h-[55vh] rounded-[3rem] p-[2px] origin-center overflow-hidden will-change-transform transform-gpu drop-shadow-xl"
        >
          {/* Static Optimized Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-fuchsia-500" />

          <div className="relative z-10 w-full h-full rounded-[2.9rem] bg-gradient-to-br from-white/95 via-purple-50/80 to-fuchsia-50/50 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-900/40 overflow-hidden flex flex-col md:flex-row border border-white/80 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="flex-1 p-6 md:p-10 lg:p-20 flex flex-col justify-center">
              <FaRocket className="text-5xl text-purple-500 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">Unprecedented Career Growth</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">Access exclusive 1-on-1 coaching, automated dynamic resume building, and real-time salary negotiation insights.</p>
            </div>
            <div className="flex-1 relative overflow-hidden flex items-end justify-center pb-20 bg-purple-500/5 dark:bg-purple-500/10 gap-6">
               <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent" />
               {[40, 70, 100].map((height, i) => (
                 <div 
                   key={i}
                   className="w-16 bg-gradient-to-t from-purple-600 to-fuchsia-400 rounded-t-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] relative z-10"
                   style={{ height: `${height}%` }}
                 />
               ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PathCard({ 
  title, 
  description, 
  features, 
  image, 
  ctaText,
  ctaLink,
  ctaType,
  badges
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      animate={{ flex: isHovered ? 1.4 : 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="relative h-full overflow-hidden rounded-[2rem] group cursor-pointer shadow-2xl transition-shadow duration-500 hover:shadow-primary-500/20"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* Cinematic Background */}
      <motion.div
        animate={{
          scale: isHovered ? 1.05 : 1.15,
        }}
        style={{
          x: useTransform(mouseX, x => x * -30),
          y: useTransform(mouseY, y => y * -30),
        }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
        className="absolute inset-0 z-0 origin-center"
      >
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#1e3a8a]/70 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/80 dark:to-[#0a0a0a]/30 mix-blend-multiply opacity-90" />
      </motion.div>

      {/* SVG Neon Tracing */}
      <svg className="absolute inset-0 w-[calc(100%-2px)] h-[calc(100%-2px)] m-[1px] z-20 pointer-events-none rounded-[2rem]" xmlns="http://www.w3.org/2000/svg">
        <rect 
          x="0" y="0" width="100%" height="100%" rx="31"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="2"
          style={{
            strokeDasharray: 3000,
            strokeDashoffset: isHovered ? 0 : 3000,
            opacity: isHovered ? 1 : 0,
            transition: 'stroke-dashoffset 1.5s ease-out, opacity 0.3s'
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Badges */}
      {badges.map((badge, i) => (
        <motion.div
          key={i}
          animate={{
            y: isHovered ? [0, -10, 0] : 0,
          }}
          style={{
            x: useTransform(mouseX, x => x * badge.parallax),
          }}
          transition={{
            y: { duration: 3 + i, repeat: Infinity, ease: "easeInOut" },
          }}
          className={`absolute z-10 glass-card px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-xl backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/10 ${badge.position}`}
          style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
        >
          <div className={`p-2 rounded-lg ${badge.bgClass}`}>
            <badge.icon className={`text-lg ${badge.textClass}`} />
          </div>
          <span className="font-bold text-sm text-white">{badge.text}</span>
        </motion.div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 z-20 p-8 md:p-12 flex flex-col justify-end pointer-events-none">
        <motion.div
          animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0.8 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex flex-col"
        >
          <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">{title}</h3>
          
          <motion.div
             animate={{ height: isHovered ? 'auto' : 0, opacity: isHovered ? 1 : 0 }}
             transition={{ duration: 0.3 }}
             className="overflow-hidden"
          >
            <p className="text-slate-200 text-lg mb-6 max-w-md drop-shadow-md font-medium">
              {description}
            </p>
            <ul className="space-y-3 mb-8">
              {features.map((item, i) => (
                <li key={i} className="flex items-center text-slate-100 font-medium drop-shadow-md">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="w-full sm:w-auto inline-block pointer-events-auto">
            <Link to={ctaLink} className="block w-full">
              <MagneticJellyButton className="w-full">
                <div className={`px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 w-full text-center ${
                  ctaType === 'primary' 
                    ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-500/30' 
                    : 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl'
                }`}>
                  {ctaText}
                </div>
              </MagneticJellyButton>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

const Word = ({ word, i, total, scrollYProgress }) => {
  const start = i / total;
  const end = start + (1 / total);
  const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
  return (
    <motion.span style={{ opacity }} className="text-slate-900 dark:text-white">
      {word}
    </motion.span>
  );
};

const NetworkingCinematicEngine = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#020617] overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_70%)]" />
      
      {/* Central AI matching core (Static Optimized) */}
      <div className="absolute z-20">
        <div className="w-32 h-32 rounded-full bg-cyan-900/40 backdrop-blur-xl border border-cyan-400/30 flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.2)]">
          <FaMicrochip className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
        </div>
      </div>

      {/* Matching Streams (Static Optimized) */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="match-stream-left" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(167,139,250,0)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.6)" />
          </linearGradient>
          <linearGradient id="match-stream-right" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.6)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </linearGradient>
        </defs>
        
        {/* Streams from Seekers to Core */}
        {[25, 40, 60, 75].map((y, i) => (
          <path key={`left-${i}`} d={`M 20 ${y} Q 35 ${y} 50 50`} fill="none" stroke="url(#match-stream-left)" strokeWidth="0.5" strokeDasharray="2 4" />
        ))}
        {/* Streams from Core to Employers */}
        {[25, 40, 60, 75].map((y, i) => (
          <path key={`right-${i}`} d={`M 50 50 Q 65 ${y} 80 ${y}`} fill="none" stroke="url(#match-stream-right)" strokeWidth="0.5" strokeDasharray="2 4" />
        ))}
      </svg>

      {/* Floating Seekers and Employers (Static Optimized) */}
      <div className="absolute inset-0 z-20">
        <div className="absolute left-[15%] top-[20%] p-4 bg-purple-900/30 backdrop-blur-md rounded-full border border-purple-500/30"><FaUsers className="w-6 h-6 text-purple-400" /></div>
        <div className="absolute left-[15%] top-[70%] p-4 bg-purple-900/30 backdrop-blur-md rounded-full border border-purple-500/30"><FaUserTie className="w-6 h-6 text-purple-400" /></div>
        
        <div className="absolute right-[15%] top-[20%] p-4 bg-blue-900/30 backdrop-blur-md rounded-xl border border-blue-500/30"><FaBuilding className="w-8 h-8 text-blue-400" /></div>
        <div className="absolute right-[15%] top-[70%] p-4 bg-blue-900/30 backdrop-blur-md rounded-xl border border-blue-500/30"><FaBuilding className="w-8 h-8 text-blue-400" /></div>
      </div>
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.95)_100%)] z-40 pointer-events-none" />
    </div>
  );
};

const EliteTalentEngine = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#0A0612] overflow-hidden flex items-center justify-center">
      <div className="absolute w-[200%] h-[200%] opacity-30" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.2) 0%, transparent 40%), radial-gradient(circle at 30% 70%, rgba(79, 70, 229, 0.2) 0%, transparent 40%)' }} />
      
      {/* Central World-Class Globe (Static Optimized) */}
      <div className="relative z-20 flex items-center justify-center">
        <div className="absolute w-72 h-72 border border-amber-500/20 rounded-full border-t-amber-400" />
        <div className="absolute w-80 h-80 border-2 border-dotted border-amber-300/30 rounded-full" />
        
        <div className="relative p-10 bg-slate-900/60 backdrop-blur-lg rounded-full border border-amber-500/40 shadow-[0_0_80px_rgba(217,119,6,0.25)]">
          <div>
            <FaGlobe className="w-20 h-20 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
          </div>
        </div>
        
        {/* Elite Stars (Static Optimized) */}
        <div className="absolute w-[400px] h-[400px]">
           <FaStar className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-300 drop-shadow-[0_0_10px_#fcd34d]" />
           <FaStar className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-300 drop-shadow-[0_0_10px_#fcd34d]" />
           <FaStar className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-amber-300 drop-shadow-[0_0_10px_#fcd34d]" />
           <FaStar className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 text-amber-300 drop-shadow-[0_0_10px_#fcd34d]" />
        </div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.95)_100%)] z-40 pointer-events-none" />
    </div>
  );
};

const DataStreamEngine = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#010B0E] overflow-hidden flex flex-col justify-end">
      {/* Background Grid */}
      <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)`, backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg)', transformOrigin: 'bottom' }} />
      
      {/* Real-time Data Bars (Static Optimized) */}
      <div className="relative z-10 w-full h-[60%] flex items-end justify-between px-8 pb-16 opacity-80">
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className="w-8 bg-gradient-to-t from-cyan-900/80 to-cyan-400/80 rounded-t-sm border-t border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
            style={{ height: `${(i % 5) * 15 + 20}%` }}
          />
        ))}
      </div>

      {/* Cinematic Precision Scanner (Static Optimized) */}
      <div className="absolute top-[30%] left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_15px_#34d399,0_0_30px_#34d399] z-20" />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.95)_100%)] z-40 pointer-events-none" />
    </div>
  );
};

const LeadershipEngine = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#040816] overflow-hidden flex items-center justify-center">
      {/* Forward Moving Hyperspace (Static Optimized) */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute w-[2px] h-32 bg-gradient-to-b from-blue-400 to-transparent opacity-50 rounded-full" style={{ left: `${(i * 5)}%`, top: `${(i % 3) * 30}%` }} />
        ))}
      </div>

      {/* Leadership Arrow (Static Optimized) */}
      <div className="relative z-20 p-10 bg-blue-900/30 backdrop-blur-2xl rounded-3xl border-t-2 border-blue-400 shadow-[0_0_80px_rgba(59,130,246,0.3)]">
        <FaArrowUp className="w-24 h-24 text-blue-400 drop-shadow-[0_0_20px_#60a5fa]" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.95)_100%)] z-40 pointer-events-none" />
    </div>
  );
};

const TransformationEngine = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#0A0216] overflow-hidden flex items-center justify-center">
      {/* Morphing Blob Background (Static Optimized) */}
      <div className="absolute w-[400px] h-[400px] bg-fuchsia-600/30 blur-[80px] rounded-[40%]" />
      <div className="absolute w-[300px] h-[300px] bg-cyan-600/30 blur-[60px] rounded-[30%]" />

      {/* Central Transforming Geometric Core (Static Optimized) */}
      <div className="relative z-20 flex items-center justify-center rotate-45">
        <div className="absolute w-48 h-48 border-[3px] border-fuchsia-400/80 shadow-[0_0_30px_#d946ef] rounded-[20%]" />
        <div className="absolute w-48 h-48 border-[3px] border-cyan-400/80 shadow-[0_0_30px_#22d3ee] rounded-[30%] -rotate-12" />
        
        <FaBolt className="w-16 h-16 text-white drop-shadow-[0_0_20px_#fff] z-30 -rotate-45" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.95)_100%)] z-40 pointer-events-none" />
    </div>
  );
};

const CinematicMotionGraphic = () => {
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  const subtitles = [
    "Experience the pinnacle of AI-driven matching.",
    "A world-class platform for elite talent.",
    "Real-time data. Cinematic precision.",
    "Unparalleled results for forward-thinking leaders.",
    "Transforming How You Hire."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % subtitles.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const engines = [
    <NetworkingCinematicEngine key="0" />,
    <EliteTalentEngine key="1" />,
    <DataStreamEngine key="2" />,
    <LeadershipEngine key="3" />,
    <TransformationEngine key="4" />
  ];

  return (
    <div className="relative w-full max-w-[500px] xl:max-w-[700px] h-[600px] xl:h-[800px] rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-slate-200/50 dark:border-white/10 group bg-slate-950">
      {/* Dynamic Cinematic Carousel - Renders all scenes to avoid DOM destruction lag, fades opacity */}
      <div className="absolute inset-0 z-0">
        {engines.map((Engine, idx) => (
          <div 
            key={idx} 
            className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
            style={{ opacity: subtitleIndex === idx ? 1 : 0, pointerEvents: subtitleIndex === idx ? 'auto' : 'none' }}
          >
            {Engine}
          </div>
        ))}
      </div>

      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-72 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />

      <div className="absolute bottom-0 left-0 w-full p-10 z-20 pointer-events-none flex flex-col items-center justify-end text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={subtitleIndex}
            initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-3xl xl:text-4xl font-medium text-white mb-10 drop-shadow-[0_4px_12px_rgba(0,0,0,1)] max-w-lg leading-tight tracking-wide"
            style={{ textShadow: "0px 6px 20px rgba(0,0,0,0.9), 0px 0px 15px rgba(56,189,248,0.3)" }}
          >
            "{subtitles[subtitleIndex]}"
          </motion.p>
        </AnimatePresence>

        {/* Cinematic Progress Dots */}
        <div className="flex gap-2.5 mt-2">
          {subtitles.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-1000 ease-in-out ${i === subtitleIndex ? "w-10 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" : "w-3 bg-white/20"}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function ScrollRevealText() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 50%"]
  });

  const words = "We believe that finding a job should not be a chore. It should be a journey of discovery. We are here to guide you to the perfect role.".split(" ");

  // Video Container Scroll Animation
  const videoRef = useRef(null);
  const { scrollYProgress: videoScroll } = useScroll({
    target: videoRef,
    offset: ["start end", "end start"]
  });
  
  const videoScale = useTransform(videoScroll, [0, 0.4, 0.6, 1], [0.8, 1, 1, 0.8]);
  const videoOpacity = useTransform(videoScroll, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const videoY = useTransform(videoScroll, [0, 0.5, 1], [150, 0, -150]);
  const videoRotateX = useTransform(videoScroll, [0, 0.5, 1], [15, 0, -15]);

  return (
    <section ref={containerRef} className="py-32 px-6 lg:px-24 xl:px-32 w-full flex flex-col lg:flex-row items-center justify-between min-h-[60vh] gap-16 relative overflow-hidden border-t border-slate-200/50 dark:border-slate-800/50">
      
      {/* Background Architectural Grid (Matte) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)", backgroundSize: "4rem 4rem" }} />

      {/* Left: Text Reveal */}
      <div className="flex-1 max-w-4xl relative z-10">
        <p className="text-3xl md:text-5xl lg:text-7xl font-bold leading-[1.1] text-left flex flex-wrap gap-x-3 gap-y-2 lg:gap-x-4 lg:gap-y-4">
          {words.map((word, i) => (
            <Word key={i} word={word} i={i} total={words.length} scrollYProgress={scrollYProgress} />
          ))}
        </p>
      </div>

      {/* Right: Cinematic Motion Graphic */}
      <motion.div 
        ref={videoRef}
        style={{ scale: videoScale, opacity: videoOpacity, y: videoY, rotateX: videoRotateX }}
        className="hidden lg:flex flex-1 justify-end relative z-10 pr-8 xl:pr-16 perspective-[2000px]"
      >
         <CinematicMotionGraphic />
      </motion.div>
    </section>
  );
}

// 3. Haptic 3D Testimonial Inspection
function HapticTestimonialCard({ testimonial }) {
  const ref = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y * 0.05);
    setRotateY(x * 0.05);
  };

  return (
    <motion.div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setRotateX(0); setRotateY(0); }}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className="relative p-[2px] w-full h-full rounded-[2.5rem] shadow-2xl shadow-primary-600/10 z-20 group"
    >
      {/* Clipping Wrapper for 3D Border (Pure Blue) */}
      <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none [mask-image:radial-gradient(white,black)]" style={{ transform: "translateZ(0)" }}>
        <div className="absolute top-1/2 left-1/2 w-[200%] aspect-square -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,#dbeafe,#3b82f6,#1e3a8a,#dbeafe)] opacity-60" />
      </div>

      <div className="relative z-10 w-full h-full p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg rounded-[2.4rem] border border-white/80 dark:border-white/10">
      <img 
        src={testimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.author)}&background=0D8ABC&color=fff`} 
        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.author)}&background=0D8ABC&color=fff` }}
        alt={testimonial.author} 
        style={{ transform: "translateZ(40px)" }}
        className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl flex-shrink-0"
      />
      <div className="flex-grow text-center md:text-left" style={{ transform: "translateZ(30px)" }}>
        <p className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-100 italic mb-6 leading-relaxed">
          "{testimonial.text}"
        </p>
        <div className="flex flex-col">
          <span className="font-bold text-primary-600 dark:text-primary-400 text-lg">
            {testimonial.author}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mt-1">
            {testimonial.role}
          </span>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
const heroImages = [
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800", // Modern office
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800", // Team collaborating
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800"  // Tech worker
];

function PremiumHeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-[340px] md:max-w-[420px] aspect-[4/5] mx-auto perspective-[1200px] flex items-center justify-center">
      {heroImages.map((src, i) => {
        let offset = i - currentIndex;
        if (offset < -1) offset += heroImages.length;
        if (offset > 1) offset -= heroImages.length;

        const isCenter = offset === 0;
        const zIndex = isCenter ? 20 : 10;
        const xOffset = offset * 25; // shift left/right
        const zOffset = Math.abs(offset) * -80; // push back
        const rotateY = offset * -10; // angle inwards
        const opacity = Math.abs(offset) > 1 ? 0 : isCenter ? 1 : 0.4;
        const scale = isCenter ? 1 : 0.9;

        return (
          <motion.div
            key={src}
            animate={{
              x: `${xOffset}%`,
              z: zOffset,
              rotateY: rotateY,
              opacity: opacity,
              scale: scale,
            }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="absolute top-0 left-0 w-full h-full rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/5"
            style={{ zIndex, transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent z-10" />
            <img src={src} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary-500/10 mix-blend-overlay z-10" />
            
            {isCenter && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute bottom-8 left-8 right-8 z-20 text-white"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                    <FaCheckCircle className="text-emerald-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-lg font-black tracking-tight leading-none">Top Talent</p>
                    <p className="text-sm text-white/80 font-medium mt-1">Verified Professionals</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Orbiting particles around carousel */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-40px] rounded-full border border-primary-500/10 pointer-events-none"
      >
        <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
      </motion.div>
    </div>
  );
}

function DynamicStatsSection() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const { ref: statsRef, inView: statsInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const dynamicStatsRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const staggerContainer = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }), []);

  const fadeInUp = useMemo(() => ({
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 60, damping: 12, duration: 0.8 } }
  }), []);

  return (
    <section ref={dynamicStatsRef} className="relative w-full py-24">
      <div className="w-full flex items-center justify-center py-20 px-4">
        <motion.div 
          ref={statsRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="w-full mx-auto relative flex flex-col justify-center h-full max-h-[1000px]"
        >
        {/* Connecting Circuit Lines (Background) */}
        <div className="absolute top-[60%] left-0 w-full h-[2px] hidden md:block z-0 pointer-events-none opacity-20 dark:opacity-30">
           <div className="w-full h-full bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
        </div>

        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Trusted by professionals globally</h2>
        </motion.div>
        
        {/* Stat Cards Grid - Ultra Premium 3D Isometric Effect */}
        <div className="grid grid-cols-1 md:grid-cols-3 place-items-center w-full max-w-7xl mx-auto gap-8 relative z-20 perspective-[2000px] mt-20 px-4">
          {[
            { icon: FaUsers, count: 50000, label: "Active Job Seekers", suffix: "+", yOffset: 0 },
            { icon: FaBriefcase, count: 100000, label: "Job Openings", suffix: "+", yOffset: -40 },
            { icon: FaChartLine, count: 98, label: "Placement Success", suffix: "%", yOffset: 0 }
          ].map((stat, i) => {
            const isActive = activeCardIndex === i;
            return (
              <motion.div
                key={i}
                animate={{
                  rotateY: isActive ? 0 : i === 0 ? 25 : -25,
                  scale: isActive ? 1.1 : 0.85,
                  z: isActive ? 80 : -80,
                  opacity: isActive ? 1 : 0.5,
                }}
                transition={{ type: "spring", stiffness: 70, damping: 25 }}
                className={`relative p-[2px] group w-full max-w-[320px] aspect-square rounded-[2.5rem] transition-all duration-700 ${isActive ? 'shadow-[0_0_80px_rgba(56,189,248,0.4)]' : 'shadow-2xl'}`}
                style={{ zIndex: isActive ? 50 : 10, marginTop: stat.yOffset }}
              >
                {/* Clipping Wrapper for 3D Border (Holographic Cyan) */}
                <div className={`absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none [mask-image:radial-gradient(white,black)] transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ transform: "translateZ(0)" }}>
                  <div className="absolute top-1/2 left-1/2 w-[200%] aspect-square -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,#0ea5e9,#38bdf8,#818cf8,#3b82f6,#0ea5e9)] opacity-60" />
                </div>

                <div className="relative z-10 p-10 flex flex-col items-center justify-center text-center w-full h-full rounded-[2.4rem] bg-gradient-to-b from-white/95 to-white/80 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-lg border border-white/80 dark:border-white/10">
                <motion.div variants={fadeInUp}>
                  <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner border border-primary-500/20 transition-transform duration-300">
                    <stat.icon className={`text-3xl transition-colors duration-500 ${isActive ? "text-primary-600 dark:text-primary-400 scale-110" : "text-slate-400 dark:text-slate-500"}`} />
                  </div>
                  <h3 className={`text-4xl font-bold mb-2 transition-colors duration-500 ${isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                    {statsInView ? <CountUp end={stat.count} duration={2.5} separator="," /> : "0"}{stat.suffix}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">{stat.label}</p>
                </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Testimonial Container */}
        <div className="mt-12 relative w-full max-w-7xl mx-auto z-10 min-h-[250px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full"
            >
              {/* Ultra Premium Glowing Laser Beam connecting the card */}
              <div 
                className="absolute bottom-[100%] w-[3px] bg-gradient-to-t from-cyan-400 to-transparent transition-all duration-700 ease-in-out hidden md:block shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                style={{ 
                  left: activeCardIndex === 0 ? '16.66%' : activeCardIndex === 1 ? '50%' : '83.33%',
                  height: activeCardIndex === 1 ? '110px' : '70px',
                  transform: 'translateX(-50%)',
                  zIndex: 5
                }}
              />
              
              {/* The Connector Arrow */}
              <div 
                className="absolute -top-4 w-8 h-8 bg-white dark:bg-[#151e2d] border-t-2 border-l-2 border-cyan-400 rotate-45 transform origin-center transition-all duration-700 ease-in-out hidden md:block shadow-[-10px_-10px_20px_rgba(34,211,238,0.2)]"
                style={{ 
                  left: activeCardIndex === 0 ? '16.66%' : activeCardIndex === 1 ? '50%' : '83.33%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  zIndex: 10
                }}
              />
              
              {/* Testimonial Content (Updates without unmounting) */}
              <div className="transition-opacity duration-500" key={`testim-${activeCardIndex}`}>
                <HapticTestimonialCard testimonial={testimonialsData[activeCardIndex][testimonialIndex]} />
              </div>
            </motion.div>
        </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const choosePathRef = useRef(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Scroll-Velocity Element Skewing
  const { scrollY, scrollYProgress } = useScroll();
  
  // Idea 1: Typography Window Masking Scale
  const textWindowScale = useTransform(scrollYProgress, [0, 0.3], [1, 80]);
  const textWindowOpacity = useTransform(scrollYProgress, [0.25, 0.3], [1, 0]);

  // Idea 4: 3D CSS Parallax Background
  const gridRotateX = useTransform(scrollYProgress, [0, 0.5], ["60deg", "0deg"]);
  const gridTranslateZ = useTransform(scrollYProgress, [0, 0.5], ["-800px", "200px"]);

  // Scroll-Driven Exploding Typography Physics
  const explodeScale = useTransform(scrollY, [0, 500], [1, 1.5]);
  const explodeOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const explodeY = useTransform(scrollY, [0, 500], [0, -100]);

  // 5. Water-Ripple Click Interactions
  const [ripples, setRipples] = useState([]);
  const handleHeroClick = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newRipple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() };
    setRipples(prev => [...prev.slice(-3), newRipple]); // Keep max 4 ripples to prevent memory buildup
  }, []);

  // 2. Scroll-Docking Search Bar
  const searchDockY = useTransform(scrollY, [600, 800], ["-100%", "0%"]);
  const searchDockOpacity = useTransform(scrollY, [600, 800], [0, 1]);

  const fadeInUp = useMemo(() => ({
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 60, damping: 12, duration: 0.8 } }
  }), []);

  const staggerContainer = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }), []);



  const wordReveal3D = useMemo(() => ({
    hidden: { y: "150%", rotateX: 90, opacity: 0 },
    visible: { y: 0, rotateX: 0, opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 100 } }
  }), []);

  // 1. Zoom-Parallax Hero Effect (replaces Velocity Skewing)
  const heroScale = useTransform(scrollY, [0, 800], [1, 0.85]);
  const heroOpacity = useTransform(scrollY, [0, 800], [1, 0]);

  // Logo Carousel Scroll-to-Straighten Effect
  const carouselRef = useRef(null);
  const { scrollYProgress: carouselScrollY } = useScroll({
    target: carouselRef,
    offset: ["start end", "center center"]
  });
  const carouselRotateX = useTransform(carouselScrollY, [0, 1], ["40deg", "0deg"]);
  const carouselRotateZ = useTransform(carouselScrollY, [0, 1], ["-5deg", "0deg"]);

  return (
    <motion.div className="flex flex-col font-sans transition-all duration-700 blur-0 brightness-100 overflow-x-clip w-full">

      {/* 2. Scroll-Docking Search Bar */}
      <motion.div 
        style={{ y: searchDockY, opacity: searchDockOpacity }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-2xl pointer-events-none"
      >
        <UltimatePremiumSearchBar placeholder="Search jobs..." buttonText="Search" primary={true} />
      </motion.div>
      
      {/* Hero Section — Full Bleed Asymmetric Layout */}
      <motion.section 
        id="hero"
        style={{ scale: heroScale, opacity: heroOpacity, transformOrigin: "center top" }}
        onClick={handleHeroClick}
        className="relative flex-grow pt-12 lg:pt-20 pb-16 min-h-[calc(100vh-6rem)] cursor-pointer overflow-visible z-10"
      >
        {/* Architectural Edge Accents - Left */}
        <div className="absolute inset-y-0 left-0 w-[4vw] 2xl:w-[6vw] pointer-events-none hidden lg:block border-r border-slate-200/40 dark:border-slate-800/40">
          <motion.div 
            animate={{ y: ["-20vh", "120vh"] }} 
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-transparent via-slate-400/50 dark:via-slate-500/50 to-transparent -translate-x-1/2"
          />
          <div className="absolute top-[20%] -left-[10vw] w-[20vw] h-[40vh] bg-slate-200/50 dark:bg-slate-800/30 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-overlay" />
        </div>

        {/* Architectural Edge Accents - Right */}
        <div className="absolute inset-y-0 right-0 w-[4vw] 2xl:w-[6vw] pointer-events-none hidden lg:block border-l border-slate-200/40 dark:border-slate-800/40">
          <motion.div 
            animate={{ y: ["120vh", "-20vh"] }} 
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-1/2 w-px h-48 bg-gradient-to-b from-transparent via-slate-400/40 dark:via-slate-500/40 to-transparent -translate-x-1/2"
          />
          <div className="absolute bottom-[20%] -right-[10vw] w-[25vw] h-[40vh] bg-slate-300/40 dark:bg-slate-700/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-overlay" />
        </div>



        {/* Static Premium Background */}
        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.1),transparent_60%)] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1),transparent_60%)] pointer-events-none" />
          <AnimatePresence>
            {ripples.map(r => (
              <motion.div 
                key={r.id} 
                initial={{ scale: 0, opacity: 0.8, borderWidth: "8px" }} 
                animate={{ scale: 15, opacity: 0, borderWidth: "1px" }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 1.5, ease: "easeOut" }} 
                className="absolute w-32 h-32 rounded-full border-blue-400 dark:border-primary-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
                style={{ left: r.x - 64, top: r.y - 64 }} 
              />
            ))}
          </AnimatePresence>
        </div>

        {/* 4. Interactive 3D CSS Scroll Parallax (Optimized to Single CSS Grid) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ perspective: "1500px" }}>
          <motion.div 
            style={{ rotateX: gridRotateX, z: gridTranslateZ }}
            className="absolute top-[-50vh] left-[-50vw] w-[200vw] h-[200vh] opacity-10 dark:opacity-20"
          >
            <div className="w-full h-full border border-slate-500 rounded-2xl bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </motion.div>
        </div>
        
        {/* Full Bleed Content Container */}
        <motion.div 
          style={{ opacity: explodeOpacity, scale: explodeScale, y: explodeY }} 
          className="relative z-10 w-full px-6 lg:px-16 2xl:px-32 mx-auto flex flex-col justify-center min-h-[calc(100vh-120px)] max-md:min-h-0 max-md:py-20"
        >
          {/* Top Row: Split Layout — Text Left, Visual Right */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 w-full">

            {/* LEFT COLUMN — Headline, Sub, Search */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              className="flex-1 space-y-6 text-center lg:text-left max-w-3xl 2xl:max-w-4xl max-md:mx-auto max-md:flex max-md:flex-col max-md:items-center"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp}>
                <motion.span 
                  animate={{ boxShadow: ["0 4px 20px rgba(37,99,235,0.15)", "0 4px 30px rgba(37,99,235,0.35)", "0 4px 20px rgba(37,99,235,0.15)"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-primary-900/30 dark:to-indigo-900/30 text-primary-700 dark:text-primary-300 px-5 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase border border-white/60 dark:border-primary-800/50 inline-flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  The Future of Hiring
                </motion.span>
              </motion.div>
              
              {/* Title - Disintegrating on Scroll */}
              <motion.h1 
                variants={staggerContainer} 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4.2rem] font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight relative z-20"
                style={{ perspective: 1000 }}
              >
                <div className="whitespace-nowrap max-md:whitespace-normal overflow-hidden">
                  <motion.div variants={wordReveal3D} style={{ transformOrigin: "bottom" }} className="inline-block pb-2 drop-shadow-sm pr-3 lg:pr-4">
                    <ShatterText text="Find " />
                  </motion.div>
                  <motion.div variants={wordReveal3D} style={{ transformOrigin: "bottom" }} className="inline-block pb-2 drop-shadow-sm pr-3 lg:pr-4">
                    <ShatterText text="your " />
                  </motion.div>
                  <motion.div variants={wordReveal3D} style={{ transformOrigin: "bottom" }} className="inline-block pb-2 drop-shadow-sm pr-3 lg:pr-4">
                    <ShatterText text="next " />
                  </motion.div>
                  <motion.div variants={wordReveal3D} style={{ transformOrigin: "bottom" }} className="inline-block text-primary-600 dark:text-primary-400 pb-2 drop-shadow-md pr-2 lg:pr-3">
                    <ShatterText text="dream job" />
                  </motion.div>
                </div>
                <div className="whitespace-nowrap overflow-hidden hidden lg:block">
                  <motion.div variants={wordReveal3D} style={{ transformOrigin: "bottom" }} className="inline-block pb-2 drop-shadow-sm pr-3 lg:pr-4">
                    <ShatterText text="with " />
                  </motion.div>
                  <motion.div variants={wordReveal3D} style={{ transformOrigin: "bottom" }} className="inline-block pb-2 drop-shadow-sm">
                    <ShatterText text="confidence." />
                  </motion.div>
                </div>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed lg:text-left text-center lg:mx-0 mx-auto">
                Connect with top employers worldwide and discover opportunities that match your skills, passion, and career goals.
              </motion.p>
              
              {/* Search Bar — Full Width */}
              <motion.div variants={fadeInUp} className="-mt-3" style={{ zIndex: (isSearchFocused || isSearchHovered) ? 1000 : 1, position: 'relative' }}>
                <motion.div 
                  onMouseEnter={() => setIsSearchHovered(true)}
                  onMouseLeave={() => setIsSearchHovered(false)}
                  animate={{ scale: isSearchFocused ? 1.35 : (isSearchHovered ? 1.25 : 1) }}
                  style={{ transformOrigin: "left center" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`transition-shadow duration-500 rounded-2xl ${(isSearchFocused || isSearchHovered) ? 'shadow-[0_0_80px_rgba(37,99,235,0.4)] dark:shadow-[0_0_80px_rgba(37,99,235,0.6)]' : ''}`}
                >
                <div className="w-full" onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)}>
                  <UltimatePremiumSearchBar placeholder="Job title, keywords, or company..." buttonText="Search" primary={true} />
                </div>
                <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  <span className="text-slate-400 dark:text-slate-500">Popular:</span>
                  {['Software Engineer', 'Product Manager', 'Remote', 'Design'].map((tag) => (
                    <span key={tag} className="hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
                </motion.div>
              </motion.div>

              {/* Unmissable Ultra-Premium CTAs */}
              <motion.div variants={fadeInUp} className="flex flex-row max-md:justify-center items-center gap-4 sm:gap-6 mt-10 pt-8 border-t border-slate-200 dark:border-slate-800/60 w-full">
                
                <motion.div initial={{ x: -40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}>
                  <UltimatePremiumCTA text="Find Jobs" to="/j" icon={FaRocket} primary={true} />
                </motion.div>
                <motion.div initial={{ x: 40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}>
                  <UltimatePremiumCTA text="Hire Talent" to="/e" icon={FaBriefcase} primary={false} />
                </motion.div>

              </motion.div>

              {/* Trust Indicators — Left Aligned */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 dark:text-slate-500 font-medium pt-4">
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-500" /> 50K+ seekers</span>
                <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary-500" /> 100K+ jobs</span>
                <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-violet-500" /> 98% placed</span>
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN — Ultra Premium Photo Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.3 }}
              className="flex-1 relative flex items-center justify-center lg:translate-x-24 xl:translate-x-36 min-h-[420px] lg:min-h-[600px] w-full max-w-lg lg:max-w-none z-50"
            >
              <PremiumHeroCarousel />
            </motion.div>

          </div>
        </motion.div>

      </motion.section>

      {/* 3. Infinite Logo Carousel - Gooey Liquid State */}
      <div id="brands" ref={carouselRef} className="w-full overflow-hidden py-16 max-md:py-8 bg-transparent relative z-10 perspective-[1000px] max-md:perspective-none">
        {/* fading edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#e2e8f0] dark:from-[#020617] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#e2e8f0] dark:from-[#020617] to-transparent z-10 pointer-events-none" />
        
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 40, repeat: Infinity }}
          className="flex whitespace-nowrap items-center w-max py-8 max-md:py-0 max-md:gap-4"
          style={{ 
            transformOrigin: "center center", 
            rotateX: carouselRotateX, 
            rotateZ: carouselRotateZ, 
            transformStyle: "preserve-3d"
          }}
          whileHover={{ rotateX: "0deg", rotateZ: "0deg", scale: 1.1, transition: { duration: 0.5 } }}
        >
          {["Google", "Microsoft", "Meta", "Netflix", "Amazon", "Apple", "Spotify", "Stripe", "Airbnb", "Uber", "Google", "Microsoft", "Meta", "Netflix", "Amazon", "Apple", "Spotify", "Stripe", "Airbnb", "Uber"].map((logo, i) => (
            <motion.div 
              drag 
              dragConstraints={{ left: -40, right: 40, top: -40, bottom: 40 }} 
              dragElastic={0.2}
              key={i} 
              className="mx-4 max-md:mx-0 max-md:px-6 max-md:py-4 px-10 py-6 bg-primary-600 dark:bg-primary-500 text-white rounded-[3rem] max-md:rounded-[1.5rem] flex items-center justify-center relative group cursor-grab active:cursor-grabbing"
            >
              <span className="text-3xl font-black uppercase tracking-widest drop-shadow-md">{logo}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll-Driven Text Highlighter */}
      <ScrollRevealText />

      {/* 3. Cinematic Feature Deck */}
      <StackingFeatureDeck />

      {/* Dynamic Statistics Section - Auto Rotating */}
      <DynamicStatsSection />

      {/* Choose Your Path */}
      <section id="pathway" ref={choosePathRef} className="py-12 md:py-20 px-6 lg:px-16 xl:px-24 mx-auto w-full relative z-[90] bg-slate-50/50 dark:bg-slate-900/50 min-h-screen flex flex-col justify-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={staggerContainer}
          className="text-center mb-8 lg:mb-12"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight"
          >
            Choose Your Path
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-lg lg:text-xl text-slate-700 dark:text-slate-400 font-medium"
          >
            Whether you're looking for your next opportunity or searching for top talent.
          </motion.p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeInUp}
          className="flex flex-col md:flex-row gap-6 xl:gap-10 min-h-[800px] md:min-h-0 md:h-[600px] xl:h-[675px] w-full max-w-7xl mx-auto"
        >
          <PathCard 
            title="For Job Seekers"
            description="Discover thousands of job opportunities. Build your profile, showcase your skills, and land your dream job with top companies."
            features={['Easy application process', 'Track your applications', 'Personalized recommendations']}
            image="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80"
            ctaText="Explore Opportunities"
            ctaLink="/j"
            ctaType="primary"
            badges={[
              { text: "Resume Checked", icon: FaCheckCircle, position: "top-12 right-8 md:right-12", parallax: 40, bgClass: "bg-green-500/20", textClass: "text-green-400" },
              { text: "7 New Matches", icon: FaRegFileAlt, position: "bottom-1/3 right-4 md:right-8", parallax: -30, bgClass: "bg-blue-500/20", textClass: "text-blue-400" },
            ]}
          />
          <PathCard 
            title="For Employers"
            description="Post jobs, manage candidates, and find top talent to grow your team and business efficiently."
            features={['Post jobs easily', 'Browse qualified applicants', 'Manage hiring efficiently']}
            image="https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1200&auto=format&fit=crop&q=80"
            ctaText="Start Hiring"
            ctaLink="/e"
            ctaType="secondary"
            badges={[
              { text: "Top Talent", icon: FaUserTie, position: "top-16 left-8 md:left-12", parallax: 50, bgClass: "bg-purple-500/20", textClass: "text-purple-400" },
              { text: "98% Hire Rate", icon: FaChartPie, position: "top-1/3 left-4 md:left-8", parallax: -40, bgClass: "bg-orange-500/20", textClass: "text-orange-400" },
            ]}
          />
        </motion.div>
      </section>

    </motion.div>
  );
}