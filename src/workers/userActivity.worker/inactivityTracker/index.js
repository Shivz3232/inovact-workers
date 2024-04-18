const { query: Hasura } = require('../../../utils/hasura');
const insertActivity = require('../../../utils/insertUserActivity/');
const { getLastAppOpenedTimestamp } = require('./queries/queries');
const BATCH_SIZE = 500;

const userInactivityTracker = async () => {
  try {
    const getLastAppOpenedTimestampResponse = await Hasura(getLastAppOpenedTimestamp);
    const lastAppOpenedLogs = getLastAppOpenedTimestampResponse.result.data.user_actions;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const batches = [];
    for (let i = 0; i < lastAppOpenedLogs.length; i += BATCH_SIZE) {
      batches.push(lastAppOpenedLogs.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      await processBatch(batch, todayStart, todayEnd, today);
    }
  } catch (error) {
    console.error('Error checking app opened and updating consecutive days:', error);
  }
};

const processBatch = async (batch, todayStart, todayEnd, today) => {
  for (const lastAppOpenedLog of batch) {
    const { user_id, last_app_opened_timestamp } = lastAppOpenedLog;

    if (last_app_opened_timestamp === null) continue;
    const lastAppOpenedDate = new Date(last_app_opened_timestamp);

    const appOpenedToday = lastAppOpenedDate >= todayStart && lastAppOpenedDate <= todayEnd;

    if (appOpenedToday) {
      insertActivity('daily-login', 'positive', user_id, lastAppOpenedDate);
    } else {
      const timeDiff = today - lastAppOpenedDate;
      const consecutiveInactiveDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      if (consecutiveInactiveDays % 5 === 0) {
        insertActivity('inactive-five-days', 'negative', user_id, null);
      }
    }
  }
};

module.exports = { userInactivityTracker };
