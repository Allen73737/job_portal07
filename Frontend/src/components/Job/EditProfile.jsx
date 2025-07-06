import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("email");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/seeker/profile?email=${userEmail}`)
      .then((res) => {
        if (res.data) setProfile(res.data);
      })
      .catch(() => {
        setSnackbar({ open: true, message: 'Failed to load profile', severity: 'error' });
      });
  }, [userEmail]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", profile.email);
    formData.append("name", profile.name);
    formData.append("age", profile.age);
    formData.append("location", profile.location);
    formData.append("linkedin", profile.linkedin);
    formData.append("bio", profile.bio);
    if (resumeFile) formData.append("resume", resumeFile);

    try {
      await axios.put('http://localhost:5000/api/seeker/profile', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setSnackbar({ open: true, message: 'Update failed', severity: 'error' });
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-100 font-sans px-4">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <h2 className="text-center text-2xl font-semibold text-blue-800 mb-5">Edit Profile</h2>

        <form onSubmit={handleUpdate} encType="multipart/form-data" className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={profile.name}
              onChange={handleChange}
              className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={profile.email}
              disabled
              className="w-1/2 px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex gap-3">
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={profile.age}
              onChange={handleChange}
              className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={profile.location}
              onChange={handleChange}
              className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <input
            type="text"
            name="linkedin"
            placeholder="LinkedIn Profile"
            value={profile.linkedin}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          <textarea
            name="bio"
            placeholder="Short Bio"
            rows={2}
            value={profile.bio}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          ></textarea>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Upload Resume (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full text-sm file:mr-4 file:py-1 file:px-3 file:border-0 file:rounded-md file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white hover:bg-blue-700 text-blue-600 font-semibold py-2 rounded-md transition"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full mt-1 text-blue-600 hover:underline text-sm"
          >
            ← Back to Profile
          </button>
        </form>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
