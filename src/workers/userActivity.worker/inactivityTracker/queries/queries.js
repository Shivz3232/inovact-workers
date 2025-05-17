const getLastAppOpenedTimestamp = `query getUsers($offset: Int, $limit: Int) {
    user_actions(
      where: { last_app_opened_timestamp: { _is_null: false } }
      offset: $offset
      limit: $limit
    ) {
      user_id
      last_app_opened_timestamp
    }
  }`;

module.exports = { getLastAppOpenedTimestamp };
