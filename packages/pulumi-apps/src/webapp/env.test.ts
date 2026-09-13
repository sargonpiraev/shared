import { describe, expect, it } from '@jest/globals'
import { parseWebappEnv, webappEnvSchema } from './env.js'

const valid = {
  GOOGLE_SERVICE_ACCOUNT_KEY: 'gsc-sa',
  GCP_SERVICE_ACCOUNT_KEY: 'gcp-sa',
  VERCEL_API_TOKEN: 'vercel-token',
}

describe('webappEnvSchema', () => {
  it('accepts required Pulumi keys and strips extras', () => {
    const parsed = webappEnvSchema.parse({ ...valid, PATH: '/usr/bin', PULUMI_LOG_LEVEL: 'info' })
    expect(parsed).toEqual(valid)
  })

  it('rejects missing keys', () => {
    expect(() => webappEnvSchema.parse({ GCP_SERVICE_ACCOUNT_KEY: 'gcp-sa' })).toThrow()
  })

  it('rejects empty strings', () => {
    expect(() => webappEnvSchema.parse({ ...valid, VERCEL_API_TOKEN: '' })).toThrow()
  })
})

describe('parseWebappEnv', () => {
  it('parses a valid env object', () => {
    expect(parseWebappEnv(valid)).toEqual(valid)
  })

  it('throws on invalid env without using live process.env', () => {
    expect(() => parseWebappEnv({})).toThrow()
  })
})
