const AWS = require('aws-sdk');
const config = require('../../config/config');
const { query: Hasura } = require('../hasura');
const { getActivityIdQuery } = require('./queries/queries');
const sqs = new AWS.SQS({ region: config.region });

//cache to store activity IDs
const activityIdCache = new Map();

// Function to fetch activity ID from the cache or Hasura
const getActivityId = async (identifier) => {
  // Check if the activity ID exists in the cache
  if (activityIdCache.has(identifier)) {
    return activityIdCache.get(identifier);
  }

  // If not in the cache, query Hasura
  const activityIdResponse = await Hasura(getActivityIdQuery, { identifier });
  const activityId = activityIdResponse.result.data.activities[0].id;

  // Store the activity ID in the cache
  activityIdCache.set(identifier, activityId);

  return activityId;
};

const insertUserActivity = async (identifier, direction, userId, entityIds) => {
  const activityId = await getActivityId(identifier);
  const result = await new Promise((resolve, reject) => {
    const params = {
      MessageBody: JSON.stringify({ activityId, direction, userId, entityIds }),
      QueueUrl: config.activitiesQueueUrl,
      MessageGroupId: 'activity',
    };
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
  return result;
};

// Clear the cache after 22 hours
setInterval(() => {
  activityIdCache.clear();
}, 22 * 60 * 60 * 1000);

module.exports = insertUserActivity;
