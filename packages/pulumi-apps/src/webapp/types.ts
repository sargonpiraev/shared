import * as pulumi from '@pulumi/pulumi'

export type WebappChildAliases = {
  gcpProvider?: string
  dataset?: string
  gscProperty?: string
  ga4Property?: string
  ga4BigQueryLink?: string
  vercelProvider?: string
  vercelProject?: string
}

export type WebappVercelArgs = {
  apiToken: pulumi.Input<string>
  name: pulumi.Input<string>
  gitRepository: pulumi.Input<string>
  framework?: pulumi.Input<string>
  rootDirectory?: pulumi.Input<string>
  ignoreChanges?: string[]
  importId?: string
}
