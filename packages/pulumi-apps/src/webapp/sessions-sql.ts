export function sessionsSql(args: { projectId: string; datasetId: string }): string {
  return `SELECT
  PARSE_DATE('%Y%m%d', MIN(event_date)) AS data_date,
  CONCAT(user_pseudo_id, '.', CAST(ga_session_id AS STRING)) AS id,
  user_pseudo_id,
  ga_session_id,
  ARRAY_AGG(
    STRUCT(
      event_timestamp,
      event_name,
      event_params
    )
    ORDER BY event_timestamp ASC
  ) AS events
FROM (
  SELECT
    event_date,
    event_timestamp,
    event_name,
    event_params,
    user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id
  FROM \`${args.projectId}.${args.datasetId}.events_*\`
)
WHERE ga_session_id IS NOT NULL
GROUP BY user_pseudo_id, ga_session_id`
}
