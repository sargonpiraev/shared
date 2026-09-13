import * as pulumi from '@pulumi/pulumi'
import { Ga4BigQueryLink } from '@sargonpiraev/pulumi-ga4'
import { childOpts } from '../internal/child-opts.js'
import type { WebappChildAliases } from './types.js'

export function createGa4BigQueryLink(
  parent: pulumi.Resource,
  componentName: string,
  aliases: WebappChildAliases,
  args: ConstructorParameters<typeof Ga4BigQueryLink>[1],
  extra?: pulumi.ResourceOptions
): Ga4BigQueryLink {
  return new Ga4BigQueryLink(
    `${componentName}-ga4-bq-link`,
    args,
    childOpts(parent, aliases.ga4BigQueryLink, {
      ...extra,
      ignoreChanges: [
        'importExisting',
        ...((extra as pulumi.CustomResourceOptions | undefined)?.ignoreChanges ?? []),
      ],
    })
  )
}
