const mongoose = require('mongoose');
const Job = require('./jobmodel');
require('dotenv').config();

mongoose.connect("mongodb+srv://allensoloyfy:e7A6Wk7f7xR9cIih@cluster0.k5oov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const jobs = await Job.find({});
  console.log("Total jobs:", jobs.length);
  const employers = [...new Set(jobs.map(j => j.postedBy))];
  console.log("Distinct postedBy:", employers);
  mongoose.connection.close();
});
