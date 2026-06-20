// models/Seeker.js
const mongoose = require('mongoose');

const seekerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  location: String,
  linkedin: String,
  bio: String,
  resume: {
    data: Buffer,
    contentType: String,
    fileName: String
  },
  profilePhoto: {
    data: Buffer,
    contentType: String
  },
  aiMatches: [{
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    score: Number,
    reason: String,
    lastEvaluated: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Seeker', seekerSchema);