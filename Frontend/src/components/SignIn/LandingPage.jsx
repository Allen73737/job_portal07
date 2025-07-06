import React, { useRef, useState, useEffect } from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaUsers, FaBriefcase, FaChartLine, FaRocket, FaStar, FaGlobe } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import Typewriter from 'typewriter-effect';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const carouselImages = [
  {
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    caption: 'Explore Remote Opportunities',
  },
  {
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    caption: 'Build a Career with Confidence',
  },
  {
    url: 'https://images.unsplash.com/photo-1522199710521-72d69614c702',
    caption: 'Achieve Work-Life Balance',
  },
  {
    url: 'https://images.unsplash.com/photo-1542744173-05336fcc7ad4',
    caption: 'Find Your Dream Job Today',
  },
  {
    url: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b2ZmaWNlfGVufDB8fDB8fHww',
    caption: 'Boost Your Career with Global Opportunities',
  },
];

export default function HomePage() {
  const footerRef = useRef(null);
  const choosePathRef = useRef(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [currentImage, setCurrentImage] = useState(0);

  // Footer animation controls
  const footerControls = useAnimation();

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const scrollToFooter = async () => {
    footerControls.set({ scale: 0.8, opacity: 0.5 });
    footerControls.start({ scale: 1, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } });
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToChoosePath = () => choosePathRef.current?.scrollIntoView({ behavior: 'smooth' });

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % carouselImages.length);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  useEffect(() => {
    const interval = setInterval(() => setCurrentImage((prev) => (prev + 1) % carouselImages.length), 6000);
    return () => clearInterval(interval);
  }, []);

  // SVGs for theme toggle morph animation
  const SunIcon = (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
      <motion.circle cx="12" cy="12" r="5" fill="orange" />
      <motion.g>
        <motion.line x1="12" y1="1" x2="12" y2="3" stroke="orange" strokeWidth="2" />
        <motion.line x1="12" y1="21" x2="12" y2="23" stroke="orange" strokeWidth="2" />
        <motion.line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="orange" strokeWidth="2" />
        <motion.line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="orange" strokeWidth="2" />
        <motion.line x1="1" y1="12" x2="3" y2="12" stroke="orange" strokeWidth="2" />
        <motion.line x1="21" y1="12" x2="23" y2="12" stroke="orange" strokeWidth="2" />
        <motion.line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="orange" strokeWidth="2" />
        <motion.line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="orange" strokeWidth="2" />
      </motion.g>
    </svg>
  );
  const MoonIcon = (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
      <motion.path
        d="M21 12.79A9 9 0 0111.21 3a7 7 0 100 14 9 9 0 009.79-4.21z"
        fill="yellow"
      />
    </svg>
  );

  // Floating animated shapes for hero background
  const FloatingShapes = () => (
    <div className="pointer-events-none absolute inset-0 z-0">
      <motion.div
        className="absolute top-10 left-10 w-24 h-24 bg-blue-300 rounded-full opacity-30 blur-2xl"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-16 right-20 w-32 h-32 bg-pink-300 rounded-full opacity-30 blur-2xl"
        animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-20 h-20 bg-purple-300 rounded-full opacity-20 blur-2xl"
        animate={{ y: [0, 25, 0], x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* deeddelivery.com inspired floating icons */}
      <motion.div
        className="absolute top-8 right-1/3 text-blue-500 opacity-70"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <FaRocket size={40} />
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-1/4 text-yellow-400 opacity-70"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <FaStar size={36} />
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-12 text-green-400 opacity-70"
        animate={{ x: [0, 25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <FaGlobe size={38} />
      </motion.div>
    </div>
  );

  // Button color classes (white background, colored font)
  const classyBlueButton =
    "bg-white text-blue-800 font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-300 border border-blue-200/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-300/60 hover:bg-blue-50";
  const classyGreenButton =
    "bg-white text-green-800 font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-300 border border-green-200/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-green-300/60 hover:bg-green-50";

  // Card content animation variants
  const flyInStagger = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.13,
        type: "spring",
        stiffness: 60,
        damping: 18,
      }
    })
  };

  // Card slide-in variants for "Choose Your Path"
  const cardSlideVariants = {
    hiddenLeft: { opacity: 0, x: -120 },
    hiddenRight: { opacity: 0, x: 120 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 70, damping: 18 } }
  };

  return (
    <div className="font-sans transition-colors duration-300 dark:bg-gray-900 dark:text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center px-6 py-4 shadow-xl bg-white/90 dark:bg-gray-800/90 sticky top-0 z-50 backdrop-blur-xl"
      >
        <div className="flex items-center space-x-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-wide">
          <span>🔍</span>
          <span>JobPortal</span>
        </div>
        <motion.div
          className="space-x-4 flex items-center"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
        >
          <motion.button
            whileHover={{ scale: 1.07, boxShadow: "0 4px 24px #2563eb" }}
            whileTap={{ scale: 0.97 }}
            onClick={scrollToFooter}
            className={classyBlueButton}
          >
            About Us
          </motion.button>
          <Link to="/adl" className="inline-block">
            <motion.button
              whileHover={{ scale: 1.07, boxShadow: "0 4px 24px #2563eb" }}
              whileTap={{ scale: 0.97 }}
              className={classyBlueButton}
            >
              Admin
            </motion.button>
          </Link>
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 flex-grow flex items-center justify-center min-h-[70vh]">
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="w-full h-full bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 opacity-40 blur-2xl"
            style={{ backgroundSize: '400% 400%' }}
          />
          <FloatingShapes />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl flex flex-col lg:flex-row justify-between items-center max-w-7xl mx-auto border border-blue-100/30 dark:border-gray-700"
        >
          <motion.div
            className="lg:w-1/2 space-y-6"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.7, type: "spring" }}
          >
            <motion.h1
              whileHover={{ letterSpacing: "0.08em", color: "#2563eb" }}
              className="text-5xl md:text-6xl font-extrabold text-gray-800 dark:text-white leading-tight font-display transition-all duration-200"
            >
              Your Dream Job
            </motion.h1>
            <motion.h2
              whileHover={{ letterSpacing: "0.08em", color: "#059669" }}
              className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 dark:from-blue-400 dark:to-pink-400 transition-all duration-200"
            >
              Awaits You
            </motion.h2>
            <motion.p
              whileHover={{ scale: 1.03 }}
              className="text-xl text-gray-700 dark:text-gray-300 font-medium"
            >
              Connect with top employers worldwide and discover opportunities that match your skills, passion, and career goals.
            </motion.p>
            <div className="flex space-x-6">
              <motion.button
                whileHover={{ scale: 1.07, boxShadow: "0 4px 24px #2563eb" }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToChoosePath}
                className={classyBlueButton}
              >
                Find Your Job
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.07, boxShadow: "0 4px 24px #059669" }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToChoosePath}
                className={classyGreenButton}
              >
                Hire Talent
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            {...swipeHandlers}
            initial={{ scale: 0.9, opacity: 0, x: 60 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            className="lg:w-1/2 mt-10 lg:mt-0 relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={carouselImages[currentImage].url}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.6 }}
                className="w-3/4 mx-auto overflow-hidden rounded-xl shadow-2xl relative"
              >
                <img
                  src={carouselImages[currentImage].url}
                  alt={carouselImages[currentImage].caption}
                  loading="lazy"
                  aria-label={carouselImages[currentImage].caption}
                  className="w-full h-64 object-cover transition-all duration-700 rounded-xl hover:scale-105"
                />
                <AnimatePresence>
                  <motion.p
                    key={carouselImages[currentImage].caption}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5 }}
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-base bg-white/80 dark:bg-gray-800/80 px-4 py-1 rounded-full shadow text-gray-800 dark:text-white"
                  >
                    {carouselImages[currentImage].caption}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
            {/* Carousel Controls */}
            <div className="flex justify-center items-center mt-4 space-x-4">
              <button
                onClick={prevImage}
                className={classyBlueButton + " !rounded-full !px-3 !py-2"}
                aria-label="Previous image"
              >
                ‹
              </button>
              <div className="flex space-x-2">
                {carouselImages.map((_, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i === currentImage ? 'bg-blue-600 scale-125' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextImage}
                className={classyBlueButton + " !rounded-full !px-3 !py-2"}
                aria-label="Next image"
              >
                ›
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      {/* Stats Section (White background, blue font, glassmorphic, animated) */}
      <section
        className="relative py-20 border-t bg-white text-center max-w-7xl mx-auto w-full overflow-hidden"
        aria-label="JobPortal statistics"
      >
        {/* Animated SVG ellipse background for subtle depth */}
        <motion.svg
          className="absolute -top-32 left-1/2 -translate-x-1/2 z-0 pointer-events-none"
          width="900"
          height="280"
          viewBox="0 0 900 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ x: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: 0.10 }}
        >
          <ellipse cx="450" cy="140" rx="430" ry="120" fill="url(#grad)" />
          <defs>
            <radialGradient id="grad" cx="50%" cy="50%" r="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#eaf4fb" stopOpacity="0" />
            </radialGradient>
          </defs>
        </motion.svg>
        {/* Noise overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: "url('https://grainy-gradients.vercel.app/noise.svg') repeat", opacity: 0.04 }} aria-hidden="true" />
        <div className="relative z-10 flex flex-col md:flex-row justify-around items-center gap-12">
          {[
            {
              icon: <FaUsers className="text-blue-600 text-5xl" aria-label="Active Job Seekers" />,
              value: 50000,
              label: 'Active Job Seekers',
              suffix: '+'
            },
            {
              icon: <FaBriefcase className="text-blue-600 text-5xl" aria-label="Job Openings" />,
              value: 100000,
              label: 'Job Openings',
              suffix: '+'
            },
            {
              icon: <FaChartLine className="text-blue-600 text-5xl" aria-label="Placement Success" />,
              value: 98,
              label: 'Placement Success',
              suffix: '%'
            },
          ].map((stat, index) => {
            const ref = useRef(null);
            const [inView, setInView] = useState(false);
            useEffect(() => {
              const observer = new window.IntersectionObserver(
                ([entry]) => setInView(entry.isIntersecting),
                { threshold: 0.2 }
              );
              if (ref.current) observer.observe(ref.current);
              return () => observer.disconnect();
            }, []);
            // Glassmorphic animated shimmer
            const Shimmer = () => (
              <svg className="absolute left-0 top-0 w-full h-full pointer-events-none" style={{ opacity: 0.16 }}>
                <defs>
                  <linearGradient id="shimmer" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
                    <stop offset="50%" stopColor="#2563eb" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#shimmer)" className="animate-shimmer" />
                <style>
                  {`
                    .animate-shimmer { animation: shimmer-move 2.5s linear infinite; }
                    @keyframes shimmer-move { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%);} }
                  `}
                </style>
              </svg>
            );
            return (
              <motion.div
                key={index}
                ref={ref}
                tabIndex={0}
                aria-label={stat.label}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.09, boxShadow: "0 12px 48px rgba(37,84,199,0.10)" }}
                whileFocus={{ scale: 1.09, boxShadow: "0 12px 48px rgba(37,84,199,0.14)" }}
                whileTap={{ scale: 0.97 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.15, type: "spring", stiffness: 70, damping: 18 }}
                className="relative flex flex-col items-center bg-white/80 backdrop-blur-2xl border border-blue-200 rounded-3xl px-14 py-16 shadow-2xl min-w-[270px] min-h-[250px] transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400/40 group"
              >
                <div className="absolute inset-0 rounded-3xl pointer-events-none bg-white/30" />
                <Shimmer />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.22, rotate: [0, 12, -12, 0] }}
                    whileFocus={{ scale: 1.18, rotate: [0, 10, -10, 0] }}
                    transition={{ type: "spring", stiffness: 250, damping: 10 }}
                    className="mb-2"
                    aria-label={stat.label + " icon"}
                    tabIndex={-1}
                  >
                    {stat.icon}
                  </motion.div>
                  <p className="text-5xl font-extrabold text-blue-700 drop-shadow-lg tracking-tight">
                    {inView ? <CountUp end={stat.value} duration={2} separator="," /> : "0"}
                    {stat.suffix}
                  </p>
                  <p className="text-blue-700 font-bold text-lg uppercase tracking-wider">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Choose Your Path Section (ENHANCED) */}
      <section
        ref={choosePathRef}
        className="bg-gray-100 dark:bg-gray-800 py-20 px-4 text-center max-w-7xl mx-auto w-full rounded-3xl"
      >
        <motion.h2
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-5xl font-bold text-blue-800 dark:text-blue-400 mb-4 font-display"
        >
          <Typewriter
            options={{
              strings: ['Choose Your Path'],
              autoStart: true,
              loop: true,
              delay: 75,
              deleteSpeed: 50,
            }}
          />
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-2xl text-gray-700 dark:text-gray-300 font-medium mb-12"
        >
          Whether you're looking for your next opportunity or searching for top talent, we've got you covered.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* Job Seekers Card */}
          <motion.div
            initial="hiddenLeft"
            whileInView="visible"
            variants={cardSlideVariants}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03, boxShadow: "0 8px 32px #2563eb44" }}
            whileTap={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl p-8 shadow-xl border border-blue-100/20 dark:border-gray-700 hover:shadow-2xl transition duration-300 transform-gpu group flex flex-col gap-2 cursor-pointer"
          >
            {[
              <img
                key="img"
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
                alt="job seeker"
                loading="lazy"
                className="rounded-lg h-48 w-full object-cover mb-4 border border-blue-200/20 group-hover:scale-105 transition-transform duration-300"
              />,
              <motion.h3
                key="h3"
                custom={1}
                variants={flyInStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-2xl font-semibold text-gray-800 dark:text-blue-200 mb-2 transition-all duration-200"
              >
                For Job Seekers
              </motion.h3>,
              <motion.p
                key="p"
                custom={2}
                variants={flyInStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-gray-600 dark:text-gray-400 mb-4"
              >
                Discover thousands of job opportunities. Build your profile, showcase your skills, and land your dream job.
              </motion.p>,
              <motion.ul
                key="ul"
                custom={3}
                variants={flyInStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-left list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 mb-4"
              >
                <li>Easy application process</li>
                <li>Track your applications</li>
                <li>Get personalized recommendations</li>
              </motion.ul>,
              <Link to="/j" key="btn">
                <motion.button
                  custom={4}
                  variants={flyInStagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.07, boxShadow: "0 4px 24px #2563eb" }}
                  whileTap={{ scale: 0.97 }}
                  className={classyBlueButton + " w-full"}
                >
                  Explore Opportunities
                </motion.button>
              </Link>
            ]}
          </motion.div>
          {/* Employers Card */}
          <motion.div
            initial="hiddenRight"
            whileInView="visible"
            variants={cardSlideVariants}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03, boxShadow: "0 8px 32px #05966944" }}
            whileTap={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl p-8 shadow-xl border border-green-100/20 dark:border-gray-700 hover:shadow-2xl transition duration-300 transform-gpu group flex flex-col gap-2 cursor-pointer"
          >
            {[
              <img
                key="img"
                src="https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b2ZmaWNlfGVufDB8fDB8fHww"
                alt="employer office"
                loading="lazy"
                className="rounded-lg h-48 w-full object-cover mb-4 border border-green-200/20 group-hover:scale-105 transition-transform duration-300"
              />,
              <motion.h3
                key="h3"
                custom={1}
                variants={flyInStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-2xl font-semibold text-gray-800 dark:text-green-200 mb-2 transition-all duration-200"
              >
                For Employers
              </motion.h3>,
              <motion.p
                key="p"
                custom={2}
                variants={flyInStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-gray-600 dark:text-gray-400 mb-4"
              >
                Post jobs, manage candidates, and find top talent to grow your team and business.
              </motion.p>,
              <motion.ul
                key="ul"
                custom={3}
                variants={flyInStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-left list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 mb-4"
              >
                <li>Post jobs easily</li>
                <li>Browse qualified applicants</li>
                <li>Manage hiring efficiently</li>
              </motion.ul>,
              <Link to="/e" key="btn">
                <motion.button
                  custom={4}
                  variants={flyInStagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.07, boxShadow: "0 4px 24px #059669" }}
                  whileTap={{ scale: 0.97 }}
                  className={classyGreenButton + " w-full"}
                >
                  Start Hiring
                </motion.button>
              </Link>
            ]}
          </motion.div>
        </div>
      </section>

      {/* Footer (ZOOM-IN ANIMATION) */}
      <motion.footer
        ref={footerRef}
        initial={{ scale: 1, opacity: 1 }}
        animate={footerControls}
        className="bg-gray-800 text-white px-6 py-10 text-sm mt-auto"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
            <h4 className="text-gray-300 font-semibold mb-2">Corporate Office</h4>
            <p>Info Edge (India) Limited</p>
            <p>B - 8, Sector - 132</p>
            <p>Noida - 201304</p>
            <p>India</p>
            <p className="mt-2">Phone: +91-120-4841100, +91-120-3082000</p>
            <p>Fax: +91-120-3082095</p>
            <p>
              Email:{' '}
              <a href="mailto:jobportal@gmail.com" className="underline hover:text-blue-400">
                jobportal@gmail.com
              </a>
            </p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
            <h4 className="text-gray-300 font-semibold mb-2">Registered Office</h4>
            <p>GF-12A, 94 Meghdoot Building</p>
            <p>Nehru Place</p>
            <p>New Delhi - 110019</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
            <h4 className="text-gray-300 font-semibold mb-2">Other Office</h4>
            <p>Info Edge (India) Limited</p>
            <p>A-88, Sector - 2</p>
            <p>Noida - 201301</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="text-center">
            <h4 className="text-gray-300 font-semibold mb-2">Follow us on</h4>
            <div className="flex justify-center space-x-6 text-xl">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
            </div>
            <p className="text-gray-400 mt-6">&copy; {new Date().getFullYear()} JobPortal. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}