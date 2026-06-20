import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaBirthdayCake, FaMapMarkerAlt, FaLinkedin, FaUpload, FaArrowLeft, FaSave, FaCamera, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function EditProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    location: '',
    linkedin: '',
    bio: '',
  });
  
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [originalPhoto, setOriginalPhoto] = useState(null);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const userEmail = localStorage.getItem("email");

  useEffect(() => {
    if (!userEmail) {
      navigate("/");
      return;
    }
    
    axios.get(`${import.meta.env.VITE_API_URL}/api/seeker/profile?email=${userEmail}`)
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
          if (res.data.profilePhoto && res.data.profilePhoto.data) {
            setOriginalPhoto(`data:${res.data.profilePhoto.contentType};base64,${res.data.profilePhoto.data}`);
          }
        }
        setIsLoading(false);
      })
      .catch(() => {
        showNotification('Failed to load profile', 'error');
        setIsLoading(false);
      });
  }, [userEmail, navigate]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        showNotification("Only PDF files are allowed for resumes", "error");
        return;
      }
      setResumeFile(file);
      setResumeName(file.name);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification("Please upload a valid image file", "error");
        return;
      }
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("email", profile.email);
    formData.append("name", profile.name);
    formData.append("age", profile.age);
    formData.append("location", profile.location);
    formData.append("linkedin", profile.linkedin);
    formData.append("bio", profile.bio);
    if (resumeFile) formData.append("resume", resumeFile);
    if (photoFile) formData.append("profilePhoto", photoFile);

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/seeker/profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showNotification('Profile updated successfully!', 'success');
      setTimeout(() => navigate('/profile'), 1500);
    } catch {
      showNotification('Failed to update profile', 'error');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-primary-500" />
      </div>
    );
  }

  const currentPhoto = photoPreview || originalPhoto;

  return (
    <div className="relative min-h-screen font-sans bg-slate-50 dark:bg-[#020617] pt-28 pb-20 px-4 sm:px-8 overflow-hidden selection:bg-primary-500/30">
      
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ willChange: 'transform' }}
          className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-500/10 dark:bg-primary-600/10 blur-[120px]"
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.2, 1] }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} style={{ willChange: 'transform' }}
          className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-8"
        >
          <button 
            onClick={() => navigate('/profile')}
            className="w-12 h-12 flex items-center justify-center bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <FaArrowLeft className="text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Edit Profile</h1>
        </motion.div>

        {/* Main Form Panel */}
        <motion.form 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, type: 'spring', stiffness: 80 }}
          onSubmit={handleUpdate}
          encType="multipart/form-data"
          className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-indigo-500" />

          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center mb-10 relative">
            <div className="relative group cursor-pointer" onClick={() => photoInputRef.current?.click()}>
              <div className="absolute inset-0 bg-primary-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              
              <div className="relative w-40 h-40 rounded-[2.5rem] flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                {currentPhoto ? (
                  <img src={currentPhoto} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <span className="text-6xl font-black text-slate-300 dark:text-slate-600">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : <FaUser />}
                  </span>
                )}
                
                <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FaCamera className="text-3xl text-white mb-2" />
                  <span className="text-white font-bold text-sm">Change Photo</span>
                </div>
              </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={photoInputRef}
              onChange={handlePhotoChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1">Full Name</label>
              <div className="relative flex items-center bg-white dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                <div className="pl-4 pr-2 text-slate-400"><FaUser /></div>
                <input 
                  type="text" name="name" value={profile.name} onChange={handleChange} required
                  className="w-full h-14 bg-transparent border-none outline-none text-slate-900 dark:text-white font-medium pr-4"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email (Disabled) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
              <div className="relative flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 opacity-70 cursor-not-allowed">
                <div className="pl-4 pr-2 text-slate-400"><FaEnvelope /></div>
                <input 
                  type="email" name="email" value={profile.email} disabled
                  className="w-full h-14 bg-transparent border-none outline-none text-slate-900 dark:text-white font-medium pr-4 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Age */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1">Age</label>
              <div className="relative flex items-center bg-white dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                <div className="pl-4 pr-2 text-slate-400"><FaBirthdayCake /></div>
                <input 
                  type="number" name="age" value={profile.age} onChange={handleChange}
                  className="w-full h-14 bg-transparent border-none outline-none text-slate-900 dark:text-white font-medium pr-4"
                  placeholder="25"
                />
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1">Location</label>
              <div className="relative flex items-center bg-white dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                <div className="pl-4 pr-2 text-slate-400"><FaMapMarkerAlt /></div>
                <input 
                  type="text" name="location" value={profile.location} onChange={handleChange}
                  className="w-full h-14 bg-transparent border-none outline-none text-slate-900 dark:text-white font-medium pr-4"
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1">LinkedIn Profile</label>
              <div className="relative flex items-center bg-white dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:border-[#0A66C2] focus-within:ring-2 focus-within:ring-[#0A66C2]/20 transition-all">
                <div className="pl-4 pr-2 text-slate-400"><FaLinkedin /></div>
                <input 
                  type="url" name="linkedin" value={profile.linkedin} onChange={handleChange}
                  className="w-full h-14 bg-transparent border-none outline-none text-slate-900 dark:text-white font-medium pr-4"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1">Short Bio</label>
              <textarea 
                name="bio" rows="4" value={profile.bio} onChange={handleChange}
                className="w-full bg-white dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-900 dark:text-white font-medium p-4 resize-none"
                placeholder="Tell employers about your skills, experience, and what makes you unique..."
              />
            </div>

            {/* Resume Upload */}
            <div className="flex flex-col gap-2 md:col-span-2 mt-4">
              <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1">Update Resume (PDF only)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-3xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 cursor-pointer transition-all group"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-primary-500 group-hover:scale-110 transition-transform shadow-sm">
                  <FaUpload size={24} />
                </div>
                <span className="text-slate-900 dark:text-white font-bold text-lg mb-1">Click or drag to upload resume</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm mb-4">Max file size 5MB</span>
                {resumeName && (
                  <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl flex items-center gap-2 border border-emerald-200 dark:border-emerald-500/20">
                    <FaCheckCircle /> {resumeName}
                  </div>
                )}
                <input 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleResumeChange}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-slate-200 dark:border-slate-800 mt-4">
            <button 
              type="button"
              onClick={() => navigate('/profile')}
              disabled={isSubmitting}
              className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-xl"
            >
              {isSubmitting ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save Changes</>}
            </button>
          </div>
        </motion.form>
      </div>

      {/* Floating Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              notification.type === 'success' 
                ? 'bg-emerald-500/90 border-emerald-400/50 text-white' 
                : 'bg-rose-500/90 border-rose-400/50 text-white'
            }`}
          >
            {notification.type === 'success' ? <FaCheckCircle size={20} /> : <FaExclamationCircle size={20} />}
            <span className="font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
