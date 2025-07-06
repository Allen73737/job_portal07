import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEye, FaCheck, FaTimes, FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- Icons for extra fields ---
const LocationIcon = () => (
  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M12 2.25c3.728 0 6.75 3.022 6.75 6.75 0 4.5-6.75 12.75-6.75 12.75S5.25 13.5 5.25 9A6.75 6.75 0 0112 2.25z" />
    <circle cx="12" cy="9" r="2.25" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M8 7.5V3m8 4.5V3m-9 8.25h10.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75A1.5 1.5 0 0019.5 5.25h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z" />
  </svg>
);

const ExperienceIcon = () => (
  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M3 10.5V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v4.5M3 10.5v7.5A2.25 2.25 0 005.25 20.25h13.5A2.25 2.25 0 0021 18v-7.5M3 10.5h18" />
  </svg>
);

// --- ToastBar and ConfirmDialog (shared) ---
function ToastBar({ message, type = "success", onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg z-50 text-black font-semibold text-base bg-white border ${type === "success" ? "border-indigo-400" : "border-rose-400"} animate-toast-in`} style={{ minWidth: 240 }}>
      {type === "success" ? <FaCheck className="text-indigo-500" /> : <FaTimes className="text-rose-500" />}
      {message}
    </div>
  );
}

function ConfirmDialog({ open, title, description, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center animate-dialog">
        <h2 className="text-xl font-bold mb-3 text-gray-900">{title}</h2>
        <p className="text-gray-700 mb-6">{description}</p>
        <div className="flex justify-center gap-4">
          <button onClick={onCancel} className="px-5 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition">Cancel</button>
          <button onClick={onConfirm} className="px-5 py-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-black font-bold shadow transition">Confirm</button>
        </div>
      </div>
    </div>
  );
}

// --- Interview Modal (from first code) ---
function InterviewFormModal({ open, applicant, onSubmit, onClose }) {
  const [formData, setFormData] = useState({ date: '', time: '', mode: '', link: '', notes: '' });
  useEffect(() => {
    if (open) setFormData({ date: '', time: '', mode: '', link: '', notes: '' });
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Schedule Interview for {applicant?.name}</h2>
        <div className="space-y-4">
          <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full border p-2 rounded-md" />
          <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full border p-2 rounded-md" />
          <input type="text" placeholder="Mode (Online / In-Person)" value={formData.mode} onChange={e => setFormData({ ...formData, mode: e.target.value })} className="w-full border p-2 rounded-md" />
          <input type="text" placeholder="Link (optional)" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className="w-full border p-2 rounded-md" />
          <textarea placeholder="Notes (optional)" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full border p-2 rounded-md" rows={3} />
          <div className="flex justify-end gap-4 pt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={() => onSubmit(formData)} className="bg-white text-blue-700 border border-blue-500 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-lg font-semibold"
>Submit</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- Main Component ---
export default function ApplicantListPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [dialog, setDialog] = useState({ open: false, action: null, applicant: null });
  const [interviewModal, setInterviewModal] = useState({ open: false, applicant: null });

  useEffect(() => { fetchApplicants(); }, []);

  // --- Fetch applicants and interviews, merge data ---
  const fetchApplicants = async () => {
    try {
      const [appRes, interviewRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/applicant?jobId=${jobId}`),
        axios.get(`http://localhost:5000/api/interviews/job/${jobId}`)
      ]);
      const interviewMap = {};
      interviewRes.data.forEach(int => {
        interviewMap[int.seekerEmail] = {
          date: int.interviewDate,
          time: int.interviewTime,
          mode: int.mode,
          link: int.link,
          notes: int.message
        };
      });
      const merged = appRes.data.map(app => ({
        ...app,
        interviewDetails: interviewMap[app.email] || null
      }));
      setApplicants(merged);
    } catch (err) {
      console.error("Error loading applicants", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Accept/Reject/Interview logic ---
  const handleAccept = (applicant) => setInterviewModal({ open: true, applicant });
  const submitInterview = async (data) => {
    const applicant = interviewModal.applicant;
    setInterviewModal({ open: false, applicant: null });
    try {
      await axios.post("http://localhost:5000/api/interviews", {
        jobId,
        seekerEmail: applicant.email,
        interviewDate: data.date,
        interviewTime: data.time,
        mode: data.mode,
        link: data.link,
        message: data.notes
      });
      await axios.put("http://localhost:5000/api/applicant/status", {
        jobId,
        email: applicant.email,
        status: "interview scheduled"
      });
      setToast({ open: true, message: `Interview scheduled with ${applicant.name}`, type: 'success' });
      fetchApplicants();
    } catch (err) {
      setToast({ open: true, message: "Failed to schedule interview", type: 'error' });
    }
  };
  const handleReject = (applicant) => setDialog({ open: true, action: "reject", applicant });
  const closeDialog = () => setDialog({ open: false, action: null, applicant: null });
  const confirmAction = async () => {
    const { applicant } = dialog;
    closeDialog();
    try {
      await axios.delete("http://localhost:5000/api/applicant", {
        params: { jobId, email: applicant.email }
      });
      await axios.put("http://localhost:5000/api/applicant/status", {
        jobId,
        email: applicant.email,
        status: "rejected"
      });
      setToast({ open: true, message: `Application rejected for ${applicant.name}`, type: 'error' });
      setApplicants(prev => prev.filter(a => a.email !== applicant.email));
    } catch (err) {
      setToast({ open: true, message: "Failed to reject applicant", type: 'error' });
    }
  };
  const closeToast = () => setToast({ ...toast, open: false });
  const openResume = (resume) => {
    if (resume && resume.data) {
      const blob = new Blob([Uint8Array.from(resume.data.data)], { type: resume.contentType });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 py-12 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col md:flex-row md:justify-between md:items-center mb-12 gap-4 px-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow">Applications</h1>
        <button onClick={() => navigate('/d')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black border border-gray-300 shadow hover:bg-gray-50 font-semibold text-base transition-all duration-200">
          <span className="text-xl">←</span>
          Back to Dashboard
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-24">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No applicants found.</h2>
          <p className="text-gray-500">Applicants will appear here once they apply for this job.</p>
        </div>
      ) : (
        <div className="w-full max-w-5xl grid gap-10">
          {applicants.map((app, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(80,100,180,0.17)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative bg-white border border-gray-200 rounded-3xl shadow-lg p-8 flex flex-col min-h-[340px] transition-all duration-300 group"
            >
              <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-indigo-300 to-blue-100 rounded-full opacity-80 group-hover:opacity-100 transition" />
              <div className="flex-1 pl-4 pr-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{app.name}</h2>
                <p className="text-gray-600 text-base mb-3">{app.bio}</p>
                <ul className="space-y-2 text-gray-700 text-base">
                  <li className="flex items-center gap-2"><FaEnvelope className="w-6 h-6 text-indigo-400" /> <span>{app.email}</span></li>
                  <li className="flex items-center gap-2"><LocationIcon /> <span>{app.location || "Not specified"}</span></li>
                  <li className="flex items-center gap-2"><CalendarIcon /> <span>Applied on: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "N/A"}</span></li>
                  {app.age && (
                    <li className="flex items-center gap-2"><span className="font-semibold">Age:</span> <span>{app.age}</span></li>
                  )}
                  {app.linkedin && (
                    <li className="flex items-center gap-2"><ExperienceIcon /><a href={app.linkedin} target="_blank" rel="noreferrer" className="text-indigo-600 underline hover:text-indigo-800 transition">LinkedIn Profile</a></li>
                  )}
                  {app.experience && (
                    <li className="flex items-center gap-2"><ExperienceIcon /> <span>Experience: {app.experience}</span></li>
                  )}
                </ul>
                {/* Interview details if scheduled */}
                {app.status === "interview scheduled" && app.interviewDetails && (
                  <div className="mt-4 bg-indigo-50 p-3 rounded-lg text-sm">
                    <p><strong>Date:</strong> {app.interviewDetails.date}</p>
                    <p><strong>Time:</strong> {app.interviewDetails.time}</p>
                    <p><strong>Mode:</strong> {app.interviewDetails.mode}</p>
                    {app.interviewDetails.link && (
                      <p>
                        <strong>Link:</strong>{" "}
                        <a
                          href={app.interviewDetails.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {app.interviewDetails.link}
                        </a>
                      </p>
                    )}
                    {app.interviewDetails.notes && <p><strong>Notes:</strong> {app.interviewDetails.notes}</p>}
                  </div>
                )}
                <div className="flex flex-row gap-4 mt-8">
                  {app.status === "interview scheduled" ? (
                    <div className="px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-lg shadow">Interview Scheduled</div>
                  ) : app.status === "rejected" ? (
                    <div className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg shadow">Rejected</div>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.07, backgroundColor: "#c7d2fe", color: "#111827" }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        onClick={() => handleAccept(app)}
                        className="inline-flex items-center gap-2 bg-indigo-100 text-black border border-indigo-400 px-6 py-2 rounded-lg shadow hover:bg-indigo-200 font-bold transition-all"
                      >
                        <FaCheck className="text-indigo-700" /> Accept
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.07, backgroundColor: "#fee2e2", color: "#b91c1c" }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        onClick={() => handleReject(app)}
                        className="inline-flex items-center gap-2 bg-white text-black border border-rose-500 px-6 py-2 rounded-lg shadow hover:bg-rose-50 font-bold transition-all"
                      >
                        <FaTimes className="text-rose-500" /> Reject
                      </motion.button>
                    </>
                  )}
                  {app.resume && (
                    <motion.button
                      onClick={() => openResume(app.resume)}
                      whileHover={{ scale: 1.07 }}
                      className="inline-flex items-center gap-2 bg-white text-indigo-700 border border-indigo-300 px-6 py-2 rounded-lg shadow hover:bg-indigo-50 font-bold transition-all"
                    >
                      <FaEye /> View Resume
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {toast.open && (<ToastBar message={toast.message} type={toast.type} onClose={closeToast} />)}
      <ConfirmDialog
        open={dialog.open}
        title="Reject Applicant?"
        description={`Are you sure you want to reject ${dialog.applicant?.name}'s application?`}
        onConfirm={confirmAction}
        onCancel={closeDialog}
      />
      <InterviewFormModal
        open={interviewModal.open}
        applicant={interviewModal.applicant}
        onSubmit={submitInterview}
        onClose={() => setInterviewModal({ open: false, applicant: null })}
      />
    </div>
  );
}
