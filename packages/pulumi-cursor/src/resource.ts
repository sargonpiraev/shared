import * as pulumi from '@pulumi/pulumi'
import type { CursorMcpServer } from './api.js'

export class Provider extends pulumi.ProviderResource {
  constructor(name: string, args: { apiKey: pulumi.Input<string> }, opts?: pulumi.ResourceOptions) {
    super('cursor', name, { apiKey: pulumi.secret(args.apiKey) }, opts)
  }
}

export class Agent extends pulumi.CustomResource {
  public readonly agentId!: pulumi.Output<string>
  public readonly agentName!: pulumi.Output<string>
  public readonly status!: pulumi.Output<string>
  public readonly url!: pulumi.Output<string>
  public readonly createdAt!: pulumi.Output<string>
  public readonly updatedAt!: pulumi.Output<string>

  constructor(
    name: string,
    args: {
      apiKey: pulumi.Input<string>
      name: pulumi.Input<string>
      promptText: pulumi.Input<string>
      repositoryUrl: pulumi.Input<string>
      startingRef: pulumi.Input<string>
      autoCreatePR: pulumi.Input<boolean>
      skipReviewerRequest?: pulumi.Input<boolean>
      mcpServers: pulumi.Input<CursorMcpServer[]>
    },
    opts?: pulumi.CustomResourceOptions
  ) {
    const mcpServersJson = pulumi.secret(
      pulumi.output(args.mcpServers).apply((servers) => JSON.stringify(servers))
    )

    super(
      'cursor:index:Agent',
      name,
      {
        apiKey: pulumi.secret(args.apiKey),
        name: args.name,
        promptText: args.promptText,
        repositoryUrl: args.repositoryUrl,
        startingRef: args.startingRef,
        autoCreatePR: args.autoCreatePR,
        skipReviewerRequest: args.skipReviewerRequest ?? false,
        mcpServersJson,
        agentId: undefined,
        agentName: undefined,
        status: undefined,
        url: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      },
      opts
    )
  }
}
