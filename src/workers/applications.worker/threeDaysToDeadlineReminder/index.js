const enqueueEmailNotification = require('../../../utils/enqueueEmailNotification');
const { query: Hasura } = require('../../../utils/hasura');
const { fetchJobsWithinDeadlineQuery } = require('./queries/queries');

const threeDaysToDeadlineReminder = async () => {
  try {
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const jobs = await Hasura(fetchJobsWithinDeadlineQuery, {
      timestamp: threeDaysLater.toISOString(),
    });

    jobs.result.data.recruitment_jobs.forEach((job) => {
      const applicationIds = job.applications.filter((application) => application.assignment_file.length === 0).map((application) => application.applicant.user.cognito_sub);

      if (applicationIds.length > 0) {
        enqueueEmailNotification(20, job.id, null, applicationIds);
        notify(34, job.id, null, applicationIds);
      }
    });
  } catch (error) {
    console.error('Error notifying applications with 3 days pending', error);
  }
};

module.exports = { threeDaysToDeadlineReminder };
