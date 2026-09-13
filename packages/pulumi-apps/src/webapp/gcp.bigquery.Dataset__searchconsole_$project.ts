import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from '../internal/child-opts.js'
import type { WebappChildAliases } from './types.js'

export function createSearchconsoleDataset(
  parent: pulumi.Resource,
  componentName: string,
  aliases: WebappChildAliases,
  args: {
    gcpProjectId: pulumi.Input<string>
    datasetId: pulumi.Input<string>
    location: pulumi.Input<string>
    description?: pulumi.Input<string>
    labels?: pulumi.Input<{ [key: string]: string }>
    provider: gcp.Provider
    adopt: boolean
    datasetImportId?: string
  }
): gcp.bigquery.Dataset {
  const importId = args.datasetImportId

  return new gcp.bigquery.Dataset(
    `${componentName}-dataset`,
    {
      project: args.gcpProjectId,
      datasetId: args.datasetId,
      location: args.location,
      description: args.description,
      labels: args.labels,
    },
    childOpts(parent, aliases.dataset, {
      provider: args.provider,
      ...(args.adopt
        ? {
            protect: true,
            ...(importId ? { import: importId } : {}),
            ignoreChanges: ['accesses'],
          }
        : {}),
    })
  )
}
