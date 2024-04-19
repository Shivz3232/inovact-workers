const getLastAppOpenedTimestamp = `
  query getUsers($offset: Int) {
    user_actions(
      order_by: { last_app_opened_timestamp: asc_nulls_last }
      offset: $offset
      limit: 1000
    ) {
      user_id
      last_app_opened_timestamp
    }
  }
`;

module.exports = { getLastAppOpenedTimestamp };