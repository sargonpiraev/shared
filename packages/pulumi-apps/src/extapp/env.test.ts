import { describe, expect, it } from '@jest/globals'
import { extappEnvSchema, parseExtappEnv } from './env.js'

const valid = { GCP_SERVICE_ACCOUNT_KEY: 'gcp-sa' }

describe('extappEnvSchema', () => {
  it('accepts GCP key and strips extras', () => {
    expect(extappEnvSchema.parse({ ...valid, PATH: '/bin' })).toEqual(valid)
  })

  it('rejects missing and empty GCP key', () => {
    expect(() => extappEnvSchema.parse({})).toThrow()
    expect(() => extappEnvSchema.parse({ GCP_SERVICE_ACCOUNT_KEY: '' })).toThrow()
  })
})

describe('parseExtappEnv', () => {
  it('parses a valid env object', () => {
    expect(parseExtappEnv(valid)).toEqual(valid)
  })
})
