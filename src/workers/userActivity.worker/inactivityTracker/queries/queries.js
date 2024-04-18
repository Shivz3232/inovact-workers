const getLastAppOpenedTimestamp = `query getUsers{
  user_actions(order_by: {
    last_app_opened_timestamp: asc_nulls_last
  }, limit:1){
    user_id,
    last_app_opened_timestamp
  }
}`;

module.exports = { getLastAppOpenedTimestamp };
