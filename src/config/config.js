const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'staging', 'test').default('development'),
    HASURA_ADMIN_SECRET: Joi.string().required(),
    HASURA_API: Joi.string().required(),
    REGION: Joi.string().default('ap-south-1'),
    ACTIVITIES_QUEUE_URL: Joi.string(),
    CLOUD_MAP_HASURA_SERVICE_ID: Joi.string()
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  hasuraAdminSecret: envVars.HASURA_ADMIN_SECRET,
  hasuraApi: envVars.HASURA_API,
  region: envVars.REGION,
  activitiesQueueUrl: envVars.ACTIVITIES_QUEUE_URL,
  cloudMapHasuraServiceId: envVars.CLOUD_MAP_HASURA_SERVICE_ID,
};
