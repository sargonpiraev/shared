import * as pulumi from '@pulumi/pulumi'
import { Ga4Property } from '@sargonpiraev/pulumi-ga4'
import { childOpts } from '../internal/child-opts.js'
import type { WebappChildAliases } from './types.js'

export function createGa4Property(
  parent: pulumi.Resource,
  componentName: string,
  aliases: WebappChildAliases,
  args: ConstructorParameters<typeof Ga4Property>[1],
  extra?: pulumi.ResourceOptions
): Ga4Property {
  return new Ga4Property(
    `${componentName}-ga4-property`,
    args,
    childOpts(parent, aliases.ga4Property, extra)
  )
}
