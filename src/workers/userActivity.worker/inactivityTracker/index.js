const { query: Hasura } = require('../../../utils/hasura');
const insertActivity = require('../../../utils/insertUserActivity/');
const { getLastAppOpenedTimestamp } = require('./queries/queries');
const config = require('../../../config/config');

const userInactivityTracker = async () => {
  try {
    const { batchSize } = config;
    let offset = 0;
    let lastAppOpenedLogs = [];

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    while (true) {
      const getLastAppOpenedTimestampResponse = await Hasura(getLastAppOpenedTimestamp, { offset });
      const batchLogs = getLastAppOpenedTimestampResponse.result.data.user_actions;

      if (batchLogs.length === 0) {
        break;
      }

      lastAppOpenedLogs = lastAppOpenedLogs.concat(batchLogs);
      offset += 1000;
    }

    const batches = [];
    for (let i = 0; i < lastAppOpenedLogs.length; i += batchSize) {
      batches.push(lastAppOpenedLogs.slice(i, i + batchSize));
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
