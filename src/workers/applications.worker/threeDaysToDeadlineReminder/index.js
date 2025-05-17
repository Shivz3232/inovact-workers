const enqueueEmailNotification = require("../../../utils/enqueueEmailNotification");
const { query: Hasura } = require("../../../utils/hasura");
const { fetchJobsWithinDeadlineQuery } = require("./queries/queries")

const threeDaysToDeadlineReminder = async () => {
  try {
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const jobs = await Hasura(fetchJobsWithinDeadlineQuery, {
      timestamp: threeDaysLater.toISOString(),
    });

    jobs.result.data.recruitment_jobs.forEach((job) => {
      const applicationIds = job.applications.map((application) => {
        return application.applicant.user.cognito_sub;
      });

      enqueueEmailNotification(20, job.id, null, applicationIds);
    }); 
  } catch (error) {
    console.error('Error notifying applications with 3 days pending', error);
  }
}

module.exports = { threeDaysToDeadlineReminder }
