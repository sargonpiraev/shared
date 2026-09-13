import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from '../internal/child-opts.js'

export function importAnalyticsDataset(
  parent: pulumi.Resource,
  args: {
    gcpProjectId: string
    datasetId: string
    location: pulumi.Input<string>
    provider: gcp.Provider
    dependsOn: pulumi.Resource[]
  }
): gcp.bigquery.Dataset {
  return new gcp.bigquery.Dataset(
    'analytics.dataset',
    {
      project: args.gcpProjectId,
      datasetId: args.datasetId,
      location: args.location,
    },
    childOpts(parent, undefined, {
      provider: args.provider,
      protect: true,
      import: `projects/${args.gcpProjectId}/datasets/${args.datasetId}`,
      ignoreChanges: ['accesses', 'description', 'labels', 'friendlyName'],
      dependsOn: args.dependsOn,
    })
  )
}
