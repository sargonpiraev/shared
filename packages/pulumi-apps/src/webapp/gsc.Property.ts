import * as pulumi from '@pulumi/pulumi'
import { GscProperty } from '@sargonpiraev/pulumi-gsc'
import { childOpts } from '../internal/child-opts.js'
import type { WebappChildAliases } from './types.js'

export function createGscProperty(
  parent: pulumi.Resource,
  componentName: string,
  aliases: WebappChildAliases,
  args: {
    siteUrl: pulumi.Input<string>
    serviceAccountKeyB64: pulumi.Input<string>
    importExisting: boolean
  }
): GscProperty {
  return new GscProperty(
    `${componentName}-gsc-property`,
    {
      siteUrl: args.siteUrl,
      serviceAccountKeyB64: args.serviceAccountKeyB64,
      importExisting: args.importExisting,
    },
    childOpts(parent, aliases.gscProperty)
  )
}
