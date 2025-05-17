const cron = require('node-cron');
const logger = require('../config/logger');
const { oneDayToDeadlineReminder } = require('../workers/applications.worker/oneDayToDeadlineReminder');

const jobsClosingInOneDayNotifier = cron.schedule(
  '0 23 * * *',
  () => {
    logger.info('Running jobs closing in one day notifier cron job...');
    oneDayToDeadlineReminder();
  },
  {
    timezone: 'Asia/Kolkata',
  }
);

jobsClosingInOneDayNotifier.on('error', (err) => {
  logger.error('Error in jobs closing in one day notifier cron job:', err);
});

module.exports = jobsClosingInOneDayNotifier;
