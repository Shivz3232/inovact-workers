const AWS = require('aws-sdk');

const config = require('../../config/config');
const { getActivityIdQuery } = require('./queries/queries');

const sqs = new AWS.SQS({
  region: config.region,
});

const insertUserActivity = async (identifier, direction, userId, entityIds) => {
  const activityId = await getActivityIdQuery(identifier);

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

  console.log(activityId, direction, userId, entityIds);

  return result;
};

module.exports = insertUserActivity;
