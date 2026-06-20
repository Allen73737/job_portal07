const mongoose = require('mongoose');
const Job = require('./jobmodel');

mongoose.connect("mongodb+srv://jobapp:jobapp123@cluster0.yemeiyr.mongodb.net/jobdb?retryWrites=true&w=majority&appName=Cluster0")
.then(async () => {
  const jobs = await Job.find({});
  const employers = [...new Set(jobs.map(j => j.postedBy))];
  console.log("Distinct postedBy emails in Jobs:", employers);
  mongoose.connection.close();
});
