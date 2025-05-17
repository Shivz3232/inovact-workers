const cron = require('node-cron');
const logger = require('../config/logger');
const { threeDaysToDeadlineReminder } = require('../workers/applications.worker/threeDaysToDeadlineReminder');

const jobsClosingInThreeDaysNotifier = cron.schedule(
  // '0 23 * * *',
  '* * * * *',
  () => {
    logger.info('Running job closing in three days notifier cron job...');
    threeDaysToDeadlineReminder();
  },
  {
    timezone: 'Asia/Kolkata',
  }
);

jobsClosingInThreeDaysNotifier.on('error', (err) => {
  logger.error('Error in jobs closing in three days notifier cron job:', err);
});

module.exports = jobsClosingInThreeDaysNotifier;
