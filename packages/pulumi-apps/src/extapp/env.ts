import { z } from 'zod'

/**
 * Pulumi/SaaS keys for `Extapp`.
 * CWS item id/slug are stack code, not env. Listing ETL is scrape — no CWS API token.
 */
export const extappEnvSchema = z.object({
  GCP_SERVICE_ACCOUNT_KEY: z.string().min(1),
})

export type ExtappEnv = z.infer<typeof extappEnvSchema>

/** Fail-fast after `loadWorkspaceEnv`. Extra keys are stripped. */
export function parseExtappEnv(source: NodeJS.ProcessEnv = process.env): ExtappEnv {
  return extappEnvSchema.parse(source)
}
