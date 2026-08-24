import * as pulumi from '@pulumi/pulumi'

/** Preserve stack-root child names when wrapping into a ComponentResource. */
export function childOpts(
  parent: pulumi.Resource,
  previousName: string | undefined,
  extra?: pulumi.ResourceOptions
): pulumi.ResourceOptions {
  const aliases = previousName
    ? [{ name: previousName, parent: pulumi.rootStackResource }]
    : undefined
  return {
    parent,
    ...(aliases ? { aliases } : {}),
    ...extra,
  }
}
