import * as pulumi from '@pulumi/pulumi'

export class ExpoProject extends pulumi.CustomResource {
  public readonly projectId: pulumi.Output<string>
  public readonly name: pulumi.Output<string>
  public readonly slug: pulumi.Output<string>
  public readonly accountName: pulumi.Output<string>
  public readonly projectUrl: pulumi.Output<string>

  constructor(
    name: string,
    args: {
      token: pulumi.Input<string>
      accountName: pulumi.Input<string>
      name: pulumi.Input<string>
      slug: pulumi.Input<string>
    },
    opts?: pulumi.CustomResourceOptions
  ) {
    super(
      'expo:index:Project',
      name,
      {
        token: args.token,
        accountName: args.accountName,
        name: args.name,
        slug: args.slug,
        projectId: undefined,
        projectUrl: undefined,
      },
      {
        ...opts,
        version: '0.1.0',
        additionalSecretOutputs: ['token'],
      }
    )

    this.projectId = this.id
    this.name = pulumi.output(args.name)
    this.slug = pulumi.output(args.slug)
    this.accountName = pulumi.output(args.accountName)
    this.projectUrl = pulumi.interpolate`https://expo.dev/accounts/${args.accountName}/projects/${args.slug}`
  }
}
