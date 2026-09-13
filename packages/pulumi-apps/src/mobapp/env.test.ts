import { describe, expect, it } from '@jest/globals'
import { mobappEnvSchema, parseMobappEnv } from './env.js'

const valid = { GCP_SERVICE_ACCOUNT_KEY: 'gcp-sa' }

describe('mobappEnvSchema', () => {
  it('accepts GCP key and strips extras', () => {
    expect(mobappEnvSchema.parse({ ...valid, ASC_ISSUER_ID: 'not-pack-env' })).toEqual(valid)
  })

  it('rejects missing and empty GCP key', () => {
    expect(() => mobappEnvSchema.parse({})).toThrow()
    expect(() => mobappEnvSchema.parse({ GCP_SERVICE_ACCOUNT_KEY: '' })).toThrow()
  })
})

describe('parseMobappEnv', () => {
  it('parses a valid env object', () => {
    expect(parseMobappEnv(valid)).toEqual(valid)
  })
})
