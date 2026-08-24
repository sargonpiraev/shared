export function pickSingleGa4AccountId(accounts: Array<{ name?: string | null }>): string {
  if (accounts.length !== 1) {
    throw new Error(
      `GA4 create expects exactly one Analytics account accessible by this key, got ${accounts.length}`
    )
  }
  const name = accounts[0]?.name
  if (!name) {
    throw new Error('GA4 accounts.list returned an account with no name')
  }
  return name.startsWith('accounts/') ? name.slice('accounts/'.length) : name
}
