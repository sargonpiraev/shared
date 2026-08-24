import * as pulumi from '@pulumi/pulumi'

export class TelegramBot extends pulumi.CustomResource {
  public readonly botId!: pulumi.Output<string>
  public readonly username!: pulumi.Output<string>
  public readonly firstName!: pulumi.Output<string>

  constructor(
    name: string,
    args: {
      botToken: pulumi.Input<string>
      webhookUrl?: pulumi.Input<string>
    },
    opts?: pulumi.CustomResourceOptions
  ) {
    super(
      'telegram:index:Bot',
      name,
      {
        botToken: args.botToken,
        webhookUrl: args.webhookUrl ?? '',
        botId: undefined,
        username: undefined,
        firstName: undefined,
      },
      {
        ...opts,
        additionalSecretOutputs: ['botToken'],
      }
    )
  }
}
