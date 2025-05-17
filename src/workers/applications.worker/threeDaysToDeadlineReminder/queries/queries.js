const fetchJobsWithinDeadlineQuery = `query FetchJobsWithinDeadline($timestamp: timestamp) {
  recruitment_jobs(where: {deadline: {_lte: $timestamp}, applications_aggregate: {count: {predicate: {_neq: 0}}}}) {
    id
    applications {
      applicant {
        user {
          cognito_sub
        }
      }
    }
  }
}`;

module.exports = {
  fetchJobsWithinDeadlineQuery,
};
