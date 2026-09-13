import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from '../internal/child-opts.js'

const IGNORE_EXPORT_TABLE = [
  'schema',
  'timePartitioning',
  'clustering',
  'labels',
  'description',
  'friendlyName',
  'expirationTime',
] as const

export function importGscExportTable(
  parent: pulumi.Resource,
  resourceName: string,
  args: {
    gcpProjectId: string
    datasetId: string
    tableId: string
    provider: gcp.Provider
    dependsOn: pulumi.Resource[]
  }
): gcp.bigquery.Table {
  return new gcp.bigquery.Table(
    resourceName,
    {
      project: args.gcpProjectId,
      datasetId: args.datasetId,
      tableId: args.tableId,
      deletionProtection: false,
    },
    childOpts(parent, undefined, {
      provider: args.provider,
      protect: true,
      import: `projects/${args.gcpProjectId}/datasets/${args.datasetId}/tables/${args.tableId}`,
      ignoreChanges: [...IGNORE_EXPORT_TABLE],
      dependsOn: args.dependsOn,
    })
  )
}
