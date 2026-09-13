import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from '../internal/child-opts.js'
import { sessionsSql } from './sessions-sql.js'

export const GA4_SESSIONS_VIEW_ID = 'sessions'

export function createGa4SessionsView(
  parent: pulumi.Resource,
  args: {
    gcpProjectId: pulumi.Input<string>
    datasetId: pulumi.Input<string>
    provider: gcp.Provider
    dependsOn: pulumi.Resource[]
  }
): gcp.bigquery.Table {
  const query = pulumi
    .all([args.gcpProjectId, args.datasetId])
    .apply(([project, datasetId]) =>
      sessionsSql({
        projectId: project,
        datasetId,
      })
    )

  return new gcp.bigquery.Table(
    'analytics.sessions',
    {
      project: args.gcpProjectId,
      datasetId: args.datasetId,
      tableId: GA4_SESSIONS_VIEW_ID,
      deletionProtection: false,
      description: 'GA4 session stream (events_* grouped by user_pseudo_id + ga_session_id).',
      view: {
        query,
        useLegacySql: false,
      },
    },
    childOpts(parent, undefined, {
      provider: args.provider,
      dependsOn: args.dependsOn,
    })
  )
}
