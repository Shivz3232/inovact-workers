const cron = require("node-cron");
const logger = require("../config/logger");
const {
  userInactivityTracker,
} = require("../workers/userActivity.worker/inactivityTracker/index");

const userInactivityTrackerJob = cron.schedule(
  "36 21 * * *",
  () => {
    logger.info("Running user inactivity tracker cron job...");
    userInactivityTracker();
  },
  {
    timezone: "Asia/Kolkata",
  }
);

userInactivityTrackerJob.on("error", (err) => {
  logger.error("Error in user inactivity tracker cron job:", err);
});

module.exports = userInactivityTrackerJob;
