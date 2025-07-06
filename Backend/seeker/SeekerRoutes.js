// routes/seekerRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const Seeker = require('../models/Seeker');

// POST /api/seeker/register
router.post('/register', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, password, age, location, linkedin, bio } = req.body;

    // Simple validation
    if (!name || !email || !password || !req.file) {
      return res.status(400).json({ error: 'All fields including resume are required' });
    }

    // Check if user already exists
    const existing = await Seeker.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newSeeker = new Seeker({
      name,
      email,
      password, // 👉 You should hash this in production
      age,
      location,
      linkedin,
      bio,
      resume: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      }
    });

    await newSeeker.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/seeker/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const seeker = await Seeker.findOne({ email });
    if (!seeker || seeker.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;