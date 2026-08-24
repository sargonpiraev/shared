import { describe, expect, it } from '@jest/globals'
import { pickSingleGa4AccountId } from './account.js'

describe('pickSingleGa4AccountId', () => {
  it('returns numeric id from the only account', () => {
    expect(pickSingleGa4AccountId([{ name: 'accounts/359486877' }])).toBe('359486877')
  })

  it('throws when zero or many accounts', () => {
    expect(() => pickSingleGa4AccountId([])).toThrow('exactly one Analytics account')
    expect(() => pickSingleGa4AccountId([{ name: 'accounts/1' }, { name: 'accounts/2' }])).toThrow(
      'exactly one Analytics account'
    )
  })
})
