import { describe, expect, it } from '@jest/globals'
import { GA4_SESSIONS_VIEW_ID } from './gcp.bigquery.Table__analytics_$propertyId__sessions.js'
import { sessionsSql } from './sessions-sql.js'

describe('sessionsSql', () => {
  it('aggregates events_* into a session stream', () => {
    const sql = sessionsSql({
      projectId: 'sargonpiraev',
      datasetId: 'analytics_530300959',
    })
    expect(sql).toContain('events_*')
    expect(sql).toContain('ga_session_id')
    expect(sql).toContain('ARRAY_AGG')
    expect(GA4_SESSIONS_VIEW_ID).toBe('sessions')
  })
})
