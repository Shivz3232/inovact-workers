const enqueueEmailNotification = require("../../../utils/enqueueEmailNotification");
const { query: Hasura } = require("../../utils/hasura");
const { fetchJobsWithinDeadlineQuery } = require("./queries/queries")

const threeDaysToDeadlineReminder = async () => {
  const threeDaysLater = new Date()
  threeDaysLater.setDate(threeDaysLater.getDate + 3)
  
  const jobs = await Hasura(fetchJobsWithinDeadlineQuery, {
    timestamp: threeDaysLater
  })

  jobs.result.data.recruitment_jobs.forEach(job => {
    const applicationIds = job.applications.map((application) => {
      return application.applicant.user.cognito_sub;
    });

    enqueueEmailNotification(19, job.id, null, applicationIds)
  })
}

module.exports = { threeDaysToDeadlineReminder }
