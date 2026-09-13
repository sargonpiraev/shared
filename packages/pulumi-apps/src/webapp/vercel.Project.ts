import * as vercel from '@pulumiverse/vercel'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from '../internal/child-opts.js'
import type { WebappChildAliases, WebappVercelArgs } from './types.js'

export function createVercelProject(
  parent: pulumi.Resource,
  componentName: string,
  aliases: WebappChildAliases,
  args: WebappVercelArgs
): { provider: vercel.Provider; project: vercel.Project } {
  const provider = new vercel.Provider(
    `${componentName}-vercel`,
    { apiToken: args.apiToken },
    childOpts(parent, aliases.vercelProvider)
  )
  const project = new vercel.Project(
    `${componentName}-vercel-project`,
    {
      name: args.name,
      framework: args.framework ?? 'nextjs',
      rootDirectory: args.rootDirectory,
      gitRepository: {
        type: 'github',
        repo: args.gitRepository,
      },
    },
    childOpts(parent, aliases.vercelProject, {
      provider,
      ignoreChanges: args.ignoreChanges,
      ...(args.importId ? { import: args.importId } : {}),
    })
  )
  return { provider, project }
}
