const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Seeker = require("./Seeker");
const Employer = require("./employermodel");
require("./db");

async function migratePasswords() {
  try {
    console.log("Starting password migration...");
    
    // Migrate Seekers
    const seekers = await Seeker.find();
    let seekerCount = 0;
    for (const seeker of seekers) {
      if (seeker.password && !seeker.password.startsWith("$2a$") && !seeker.password.startsWith("$2b$")) {
        const salt = await bcrypt.genSalt(10);
        seeker.password = await bcrypt.hash(seeker.password, salt);
        await seeker.save();
        seekerCount++;
      }
    }
    console.log(`Migrated ${seekerCount} Seeker accounts.`);

    // Migrate Employers
    const employers = await Employer.find();
    let employerCount = 0;
    for (const employer of employers) {
      if (employer.password && !employer.password.startsWith("$2a$") && !employer.password.startsWith("$2b$")) {
        const salt = await bcrypt.genSalt(10);
        employer.password = await bcrypt.hash(employer.password, salt);
        await employer.save();
        employerCount++;
      }
    }
    console.log(`Migrated ${employerCount} Employer accounts.`);

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

// Wait for DB connection to establish before running
mongoose.connection.once('open', () => {
    migratePasswords();
});
