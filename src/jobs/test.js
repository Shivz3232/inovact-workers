const cron = require('node-cron');
const logger = require('../config/logger');

const testJob = cron.schedule(
  '*/5 * * * * *',
  () => {
    logger.info('Running user inactivity tracker cron job...');
    logger.info("Hello World!");
  },
  {
    timezone: 'Asia/Kolkata',
  }
);

testJob.on('error', (err) => {
  logger.error('Error in user inactivity tracker cron job:', err);
});

module.exports = testJob;
