import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Helper for Google Calendar link
function getGoogleCalendarLink({ title, date, time, link, message }) {
  if (!date || !time) return "#";
  const start = new Date(`${date}T${time}`).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(new Date(`${date}T${time}`).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const details = encodeURIComponent([message, link].filter(Boolean).join('\n'));
  return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(title + " Interview")}&dates=${start}/${end}&details=${details}`;
}

function InterviewModal({ open, onClose, details }) {
  if (!open || !details) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-10 min-w-[360px] max-w-lg md:max-w-xl w-full"
      >
        <h3 className="text-2xl font-bold mb-6 text-indigo-700 tracking-wide">
          Interview Details
        </h3>
        <div className="space-y-4 text-gray-800 text-base leading-relaxed">
          <div className="flex justify-between border-b border-indigo-100 pb-2">
            <span className="font-semibold">Date:</span>
            <span>{details.interviewDate || "N/A"}</span>
          </div>
          <div className="flex justify-between border-b border-indigo-100 pb-2">
            <span className="font-semibold">Time:</span>
            <span>{details.interviewTime || "N/A"}</span>
          </div>
          <div className="flex justify-between border-b border-indigo-100 pb-2">
            <span className="font-semibold">Mode:</span>
            <span>{details.mode || "N/A"}</span>
          </div>
          {details.link && (
            <div className="flex justify-between border-b border-indigo-100 pb-2">
              <span className="font-semibold">Link:</span>
              <a
                href={details.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-words max-w-[280px]"
                title={details.link}
              >
                {details.link}
              </a>
            </div>
          )}
          {details.message && (
            <div className="flex justify-between">
              <span className="font-semibold">Message:</span>
              <p className="italic max-w-[280px] break-words text-gray-700">{details.message}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-8">
          <a
            href={getGoogleCalendarLink({
              title: "Interview",
              date: details.interviewDate,
              time: details.interviewTime,
              link: details.link,
              message: details.message
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 border border-blue-400 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 text-center transition duration-300"
          >
            Add to Google Calendar
          </a>
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-blue-400 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition duration-300"
            aria-label="Close interview details"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AppliedJobs() {
  const [jobs, setJobs] = useState([]);
  const [modalDetails, setModalDetails] = useState(null);
  const [sortBy, setSortBy] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      alert("You must be logged in!");
      navigate('/');
      return;
    }

    axios.get(`http://localhost:5000/api/applied-jobs?email=${email}`)
      .then((res) => {
        const jobs = res.data;
        setJobs(jobs);

        axios.get(`http://localhost:5000/api/interviews?email=${email}`)
          .then((interviewRes) => {
            const interviews = interviewRes.data;

            const merged = jobs.map(job => {
              const interview = interviews.find(inv => inv.jobId?._id === job._id);
              return interview ? { ...job, interviewDetails: interview } : job;
            });

            setJobs(merged);
          })
          .catch(err => console.error("Failed to fetch interviews", err));
      })
      .catch((err) => console.error("Failed to fetch applied jobs", err));
  }, [navigate]);

  const handleDownloadResume = (resume) => {
    if (!resume || !resume.data) return;
    const blob = new Blob([Uint8Array.from(resume.data.data)], { type: resume.contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resume.fileName || "resume.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSalary = (salary) => {
    if (!salary) return "Competitive";
    return salary.includes("₹") ? salary : `₹${salary}`;
  };

  const handleWithdraw = (jobId) => {
    const email = localStorage.getItem("email");
    if (!email) return alert("Not logged in");

    if (window.confirm("Are you sure you want to withdraw your application for this job?")) {
      axios.delete("http://localhost:5000/api/withdraw-application", {
        data: { jobId, email },
      })
        .then(() => {
          setJobs(jobs.filter(job => job._id !== jobId));
        })
        .catch((err) => {
          console.error("Failed to withdraw application", err);
          alert("Could not withdraw application. Try again later.");
        });
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    const sortKey = sortBy || "appliedAt";
    if (sortKey === "interview") {
      if (a.status === "interview scheduled" && b.status !== "interview scheduled") return -1;
      if (b.status === "interview scheduled" && a.status !== "interview scheduled") return 1;
      return 0;
    }
    if (sortKey === "appliedAt") {
      return new Date(b.appliedAt) - new Date(a.appliedAt);
    }
    if (sortKey === "company") {
      return (a.company || "").localeCompare(b.company || "");
    }
    return 0;
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f5ff] via-[#dbe9ff] to-[#f0f5ff] px-10 py-14 font-sans text-gray-900">
      {/* Header and Toolbar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-blue-700 tracking-tight drop-shadow-sm">
            Your Applied Jobs
          </h2>
          <div className="text-blue-700 font-semibold mt-2">
            Total Applications: {jobs.length}
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {/* Sort Dropdown - Premium style, label as placeholder */}
          <div className="relative">
            <select
              id="sort-select"
              className="appearance-none w-56 border border-blue-300 rounded-lg px-4 py-3 text-blue-700 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm pr-10 transition-all duration-200 hover:border-blue-400"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="" disabled>
                Sort by...
              </option>
              <option value="appliedAt">Applied Date (Newest)</option>
              <option value="interview">Interview Scheduled</option>
              <option value="company">Company Name (A-Z)</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 text-lg">
              ▼
            </span>
          </div>
          {/* Back to Dashboard Button */}
          <button
            onClick={() => navigate('/job')}
            aria-label="Back to Dashboard"
            className="flex items-center gap-2 px-6 py-2 rounded-full border border-blue-400 bg-white text-blue-600 font-semibold shadow-md hover:bg-blue-600 hover:text-white hover:border-blue-600 transition duration-200 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
      {/* Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence>
        {sortedJobs.length === 0 ? (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-500 col-span-full text-lg font-medium"
          >
            You haven’t applied to any jobs yet.
          </motion.p>
        ) : (
          sortedJobs.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.025, boxShadow: "0 10px 32px 0 rgba(80,120,220,0.13)" }}
              transition={{ duration: 0.5, delay: index * 0.08, type: "spring", stiffness: 100, damping: 16 }}
              className="bg-white shadow-lg rounded-3xl p-8 border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-shadow duration-300 flex flex-col"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-2 truncate">{job.title}</h3>
              <p className="text-gray-700 font-semibold mb-1">{job.company}</p>
              <p className="text-sm text-gray-500 mb-3">{job.location}</p>
              <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">{job.description}</p>
              <p className="text-blue-700 font-bold text-lg mb-4">{formatSalary(job.salary)}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {job.resume && (
                  <button
                    className="bg-white text-blue-500 font-semibold border border-blue-200 px-3 py-1 rounded-xl shadow hover:text-blue-700 hover:border-blue-400 transition duration-300"
                    onClick={() => handleDownloadResume(job.resume)}
                  >
                    Download Resume
                  </button>
                )}
                {job.companyWebsite && (
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-blue-500 font-semibold border border-blue-200 px-3 py-1 rounded-xl shadow hover:text-blue-700 hover:border-blue-400 transition duration-300"
                  >
                    Company Website
                  </a>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>
                  Applied At:{" "}
                  {job.appliedAt
                    ? new Date(job.appliedAt).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </span>
                <button
                  className="text-red-500 font-semibold hover:underline"
                  onClick={() => handleWithdraw(job._id)}
                >
                  Withdraw
                </button>
              </div>
              <div className="mt-auto">
                <div className="mb-4 text-sm font-semibold">
                  Status: {job.status === "interview scheduled" ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full shadow-inner inline-block">Interview Scheduled</span>
                  ) : job.status === "rejected" ? (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full shadow-inner inline-block">Rejected</span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full shadow-inner inline-block capitalize">{job.status || "Waiting"}</span>
                  )}
                </div>
                {job.status === "interview scheduled" && job.interviewDetails && (
                  <div className="flex flex-col gap-2">
                    <button
                      className="w-full flex justify-center items-center bg-white text-blue-500 font-semibold border border-blue-200 px-4 py-2 rounded-xl shadow hover:text-blue-700 hover:border-blue-400 transition duration-300"
                      onClick={() => setModalDetails(job.interviewDetails)}
                      aria-label={`Show interview details for ${job.title}`}
                    >
                      Show Interview Details
                    </button>
                    <a
                      href={getGoogleCalendarLink({
                        title: job.title,
                        date: job.interviewDetails.interviewDate,
                        time: job.interviewDetails.interviewTime,
                        link: job.interviewDetails.link,
                        message: job.interviewDetails.message
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex justify-center items-center bg-white text-blue-500 font-semibold border border-blue-200 px-4 py-2 rounded-xl shadow hover:text-blue-700 hover:border-blue-400 transition duration-300"
                    >
                      Add Interview to Google Calendar
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        <InterviewModal
          open={!!modalDetails}
          details={modalDetails}
          onClose={() => setModalDetails(null)}
        />
      </AnimatePresence>
    </div>
  );
}
