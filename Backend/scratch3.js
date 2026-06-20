const mongoose = require('mongoose');
const Job = require('./jobmodel');
const AppliedJob = require('./appliedJobModel');

mongoose.connect("mongodb+srv://jobapp:jobapp123@cluster0.yemeiyr.mongodb.net/jobdb?retryWrites=true&w=majority&appName=Cluster0")
.then(async () => {
  const email = 'google@gmail.com';
  const jobs = await Job.find({ postedBy: email }).sort({ createdAt: -1 });
  console.log("Jobs found for google@gmail.com:", jobs.length);
  const jobIds = jobs.map(j => j._id);
  const applications = await AppliedJob.find({ jobId: { $in: jobIds } });
  console.log("Applications found:", applications.length);
  mongoose.connection.close();
});
