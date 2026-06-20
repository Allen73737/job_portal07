const axios = require('axios');

axios.get('http://localhost:5005/api/employer/dashboard-data?email=google@gmail.com')
  .then(res => {
    console.log("Success!");
    console.log("Jobs:", res.data.jobs?.length);
    console.log("Apps:", res.data.applications?.length);
  })
  .catch(err => {
    console.log("Failed:", err.response ? err.response.data : err.message);
  });
