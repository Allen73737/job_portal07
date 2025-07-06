import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaSignOutAlt, FaUserCircle, FaSearch } from 'react-icons/fa';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

export default function JobSeekerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState(0);
  const navigate = useNavigate();

  // Fetch jobs and applied jobs
  useEffect(() => {
    axios.get('http://localhost:5000/api/jobs')
      .then((res) => setJobs(res.data))
      .catch((err) => console.error(err));

    const userEmail = localStorage.getItem("email");
    if (userEmail) {
      axios.get(`http://localhost:5000/api/applied-jobs?email=${userEmail}`)
        .then((res) => setAppliedJobIds(res.data.map(j => j._id)))
        .catch((err) => console.error(err));
    }
  }, []);

  // Get unique companies for filter
  const companyOptions = useMemo(() => {
    const companies = jobs.map(j => j.company);
    return [...new Set(companies)];
  }, [jobs]);

  // Get max salary for slider
  const maxSalary = useMemo(() => {
    let max = 0;
    jobs.forEach(job => {
      // Extract numeric salary, assuming format like "$50000" or "₹5,00,000"
      const match = String(job.salary).replace(/[^0-9]/g, '');
      if (match) {
        max = Math.max(max, parseInt(match, 10));
      }
    });
    return max || 100000;
  }, [jobs]);

  // Filtered jobs based on search and filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Title search
      const matchesTitle = job.title.toLowerCase().includes(search.toLowerCase());
      // Company filter
      const matchesCompany = companyFilter ? job.company === companyFilter : true;
      // Salary filter
      const numericSalary = parseInt(String(job.salary).replace(/[^0-9]/g, ''), 10) || 0;
      const matchesSalary = salaryFilter ? numericSalary >= salaryFilter : true;
      return matchesTitle && matchesCompany && matchesSalary;
    });
  }, [jobs, search, companyFilter, salaryFilter]);

  const handleApply = (jobId) => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) return alert("You must be logged in!");

    axios.post("http://localhost:5000/api/apply", { jobId, userEmail })
      .then(() => {
        setAppliedJobIds(prev => [...prev, jobId]);
        setSnackbar({ open: true, message: 'Successfully Applied!', severity: 'success' });
      })
      .catch((err) => {
        if (err.response?.status === 409) {
          setSnackbar({ open: true, message: 'Already Applied!', severity: 'info' });
        } else {
          setSnackbar({ open: true, message: 'Something went wrong!', severity: 'error' });
        }
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0eafc] via-[#cfdef3] to-[#e0eafc] font-sans text-gray-800">
      {/* NAVBAR */}
      <div className="flex flex-wrap items-center justify-between px-6 py-5 bg-white/60 backdrop-blur-md shadow-md border-b border-gray-200">
        <h1 className="text-base font-bold tracking-tight text-gray-800">
          JobSeeker<span className="text-blue-600">Dashboard</span>
        </h1>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md transition"
            onClick={() => navigate('/ap')}
          >
            Applied Jobs
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.15, rotate: 6 }}
            className="text-blue-700 hover:text-blue-800"
            onClick={() => navigate('/profile')}
            title="Profile"
          >
            <FaUserCircle size={26} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-base px-4 py-2 rounded-md transition"
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
          >
            <FaSignOutAlt /> Logout
          </motion.button>
        </div>
      </div>

      {/* STATS */}
      <div className="text-center py-8 px-4">
        <h2 className="text-2xl font-bold text-blue-700 mb-3">Motivational Quote</h2>
        <p className="text-lg text-blue-800 italic font-medium">
          "Success usually comes to those who are too busy to be looking for it." - Henry David Thoreau
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-lg shadow">
            <p className="text-4xl font-extrabold text-blue-700">{jobs.length}</p>
            <p className="text-gray-600 text-base">Available Jobs</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-lg shadow">
            <p className="text-4xl font-extrabold text-green-600">{appliedJobIds.length}</p>
            <p className="text-gray-600 text-base">Applications Sent</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-lg shadow">
            <p className="text-4xl font-extrabold text-purple-500">18</p>
            <p className="text-gray-600 text-base">Shortlisted Jobs</p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4 bg-white/70 backdrop-blur-md rounded-xl shadow p-4">
          {/* Search Bar */}
          <div className="flex-1 flex flex-row items-center gap-2">
            <FaSearch className="text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by job title..."
              className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Company Filter */}
          <div className="flex-1">
            <select
              className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base"
              value={companyFilter}
              onChange={e => setCompanyFilter(e.target.value)}
            >
              <option value="">All Companies</option>
              {companyOptions.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
          {/* Salary Filter */}
          <div className="flex-1 flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Minimum Salary</label>
            <input
              type="range"
              min={0}
              max={maxSalary}
              step={1000}
              value={salaryFilter}
              onChange={e => setSalaryFilter(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-blue-700 font-semibold mt-1 text-sm">
              {salaryFilter ? `₹${salaryFilter.toLocaleString()}` : "Any"}
            </span>
          </div>
          {/* Clear Filters Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md transition font-semibold"
            onClick={() => {
              setSearch('');
              setCompanyFilter('');
              setSalaryFilter(0);
            }}
          >
            Clear Filters
          </motion.button>
        </div>
      </div>

      {/* RECOMMENDED JOBS */}
      <div className="px-6 py-10">
        <h3 className="text-2xl font-bold mb-8">Recommended Jobs for You</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.length === 0 && (
            <div className="col-span-full text-center text-gray-500 text-lg py-10">
              No jobs found matching your criteria.
            </div>
          )}
          {filteredJobs.map((job, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 + index * 0.05, ease: 'easeOut' }}
              whileHover={{ scale: 1.03 }}
              className="bg-white/30 backdrop-blur-lg shadow-md border border-white/40 rounded-2xl p-8 transition-all duration-200 hover:shadow-xl"
              key={job._id}
            >
              <h4 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h4>
              <p className="text-base font-medium text-gray-600">{job.company}</p>
              <p className="text-base text-gray-500">{job.location}</p>
              <p className="text-base text-gray-700 my-2 line-clamp-2">{job.description}</p>
              <p className="text-green-600 font-semibold mb-2">{job.salary}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-full">{job.type}</span>
                <span className="text-sm text-gray-500">{new Date(job.postedAt).toLocaleDateString()}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.04 }}
                className={`mt-5 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-base py-2 rounded-md transition font-semibold
                ${appliedJobIds.includes(job._id) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                disabled={appliedJobIds.includes(job._id)}
                onClick={() => handleApply(job._id)}
              >
                {appliedJobIds.includes(job._id) ? "Applied" : "Apply Now"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}