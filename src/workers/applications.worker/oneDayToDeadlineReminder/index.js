const enqueueEmailNotification = require('../../../utils/enqueueEmailNotification');
const { query: Hasura } = require('../../../utils/hasura');
const notify = require('../../../utils/notify');
const { fetchJobsWithinDeadlineQuery } = require('./queries/queries');

const oneDayToDeadlineReminder = async () => {
  try {
    const oneDayLater = new Date();
    oneDayLater.setDate(oneDayLater.getDate() + 1);

    const jobs = await Hasura(fetchJobsWithinDeadlineQuery, {
      timestamp: oneDayLater,
    });

    jobs.result.data.recruitment_jobs.forEach((job) => {
      const applicationIds = job.applications.filter((application) => application.assignment_file.length === 0).map((application) => application.applicant.user.cognito_sub);

      if (applicationIds.length > 0) {
        enqueueEmailNotification(19, job.id, null, applicationIds);
        notify(33, job.id, null, applicationIds);
      }
    });
  } catch (error) {
    console.error('Error notifying applications with 3 days pending', error);
  }
};

module.exports = { oneDayToDeadlineReminder };
