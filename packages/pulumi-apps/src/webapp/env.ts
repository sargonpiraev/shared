import { z } from 'zod'

/** Pulumi/SaaS keys for `Webapp`. Not Next runtime (`POSTGRES_URL`, `NEXT_PUBLIC_*`). */
export const webappEnvSchema = z.object({
  GOOGLE_SERVICE_ACCOUNT_KEY: z.string().min(1),
  GCP_SERVICE_ACCOUNT_KEY: z.string().min(1),
  VERCEL_API_TOKEN: z.string().min(1),
})

export type WebappEnv = z.infer<typeof webappEnvSchema>

/**
 * Fail-fast after `loadWorkspaceEnv` (vault is not on `process.env` at ESM import).
 * Extra keys (`PATH`, `PULUMI_*`) are stripped.
 */
export function parseWebappEnv(source: NodeJS.ProcessEnv = process.env): WebappEnv {
  return webappEnvSchema.parse(source)
}
