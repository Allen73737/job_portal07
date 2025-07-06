import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dialog, DialogContent } from '@mui/material';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return navigate("/");

    axios.get(`http://localhost:5000/api/seeker/profile?email=${email}`)
      .then(res => {
        setUser(res.data);
        if (res.data.resume && res.data.resume.data) {
          const byteArray = new Uint8Array(res.data.resume.data.data);
          const blob = new Blob([byteArray], { type: res.data.resume.contentType });
          const url = URL.createObjectURL(blob);
          setResumeUrl(url);
        }
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  if (!user) {
    return <div className="text-center text-gray-500 mt-20 text-lg">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7ff] via-[#dcefff] to-[#e0f7ff] px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-lg border border-blue-100 rounded-3xl shadow-xl p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-28 h-28 bg-blue-600 text-white text-4xl font-semibold rounded-full flex items-center justify-center shadow-md">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold text-blue-700">{user.name}</h2>
            <p className="text-gray-700 text-sm">{user.email}</p>
            <p className="text-gray-700 text-sm">Age: {user.age}</p>
            <p className="text-gray-700 text-sm">{user.location}</p>
            {user.linkedin && (
              <a
                href={user.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                LinkedIn Profile
              </a>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-blue-700 mb-1">About Me</h3>
          <p className="text-gray-800 text-sm leading-relaxed">{user.bio || "No bio available."}</p>
        </div>

        {/* Resume View Trigger */}
        {resumeUrl && (
          <div
            onClick={() => setOpen(true)}
            className="mt-6 text-sm text-blue-700 cursor-pointer hover:text-blue-900 transition font-medium"
          >
            View Resume
          </div>
        )}

        {/* Resume Modal */}
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
          <DialogContent className="p-0">
            <iframe
              src={resumeUrl}
              title="Resume"
              width="100%"
              height="600px"
              style={{ border: 'none' }}
            />
          </DialogContent>
        </Dialog>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
          <Link to="/editprofile">
            <button className="w-full sm:w-auto px-5 py-2 font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition">
              Edit Profile
            </button>
          </Link>
          <Link to="/job">
            <button className="w-full sm:w-auto px-5 py-2 font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
