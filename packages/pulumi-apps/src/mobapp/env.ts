import { z } from 'zod'

/**
 * Pulumi/SaaS keys for `Mobapp`.
 * ASC issuer/key live in Secret Manager (ids in stack code), not constructor env.
 */
export const mobappEnvSchema = z.object({
  GCP_SERVICE_ACCOUNT_KEY: z.string().min(1),
})

export type MobappEnv = z.infer<typeof mobappEnvSchema>

/** Fail-fast after `loadWorkspaceEnv`. Extra keys are stripped. */
export function parseMobappEnv(source: NodeJS.ProcessEnv = process.env): MobappEnv {
  return mobappEnvSchema.parse(source)
}
