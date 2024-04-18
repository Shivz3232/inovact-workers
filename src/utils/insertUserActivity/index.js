const AWS = require('aws-sdk');

const config = require('../../config/config');
const { query: Hasura } = require('../hasura');
const { getActivityIdQuery } = require('./queries/queries');

const sqs = new AWS.SQS({
  region: config.region,
});

const insertUserActivity = async (identifier, direction, userId, entityIds) => {
  const activityIdResponse = await Hasura(getActivityIdQuery, { identifier });
  const activityId = activityIdResponse.result.data.activities[0].id;

  const result = await new Promise((resolve, reject) => {
    const params = {
      MessageBody: JSON.stringify({
        activityId,
        direction,
        userId,
        entityIds,
      }),
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

module.exports = insertUserActivity;
