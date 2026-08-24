import * as pulumi from '@pulumi/pulumi'

export class GscProperty extends pulumi.CustomResource {
  public readonly siteUrl!: pulumi.Output<string>
  public readonly permissionLevel!: pulumi.Output<string>
  public readonly registeredAt!: pulumi.Output<string>

  constructor(
    name: string,
    args: {
      siteUrl: pulumi.Input<string>
      serviceAccountKeyB64: pulumi.Input<string>
      importExisting?: boolean
    },
    opts?: pulumi.CustomResourceOptions
  ) {
    super(
      'gsc:index:Property',
      name,
      {
        siteUrl: args.siteUrl,
        serviceAccountKeyB64: args.serviceAccountKeyB64,
        importExisting: args.importExisting ?? false,
        permissionLevel: undefined,
        registeredAt: undefined,
      },
      opts
    )
  }
}
