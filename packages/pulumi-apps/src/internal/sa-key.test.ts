import { describe, expect, it } from '@jest/globals'
import { gcpProjectIdFromServiceAccountKeyB64 } from './sa-key.js'

describe('gcpProjectIdFromServiceAccountKeyB64', () => {
  it('reads project_id from the key JSON', () => {
    const b64 = Buffer.from(JSON.stringify({ project_id: 'sargonpiraev' })).toString('base64')
    expect(gcpProjectIdFromServiceAccountKeyB64(b64)).toBe('sargonpiraev')
  })

  it('throws when project_id is missing', () => {
    const b64 = Buffer.from('{}').toString('base64')
    expect(() => gcpProjectIdFromServiceAccountKeyB64(b64)).toThrow('no project_id')
  })
})
