import { buildCreateAgentBody, buildCreateRunBody } from '../api'

describe('Cursor Cloud Agents request bodies', () => {
  it('builds POST /v1/agents with repos, autoCreatePR, and mcpServers', () => {
    const body = buildCreateAgentBody({
      name: 'growth',
      promptText: 'Follow .agents/growth.md',
      repositoryUrl: 'https://github.com/sargonpiraev/anidex',
      startingRef: 'main',
      autoCreatePR: true,
      skipReviewerRequest: false,
      mcpServers: [{ name: 'bigquery', type: 'stdio', command: 'npx' }],
    })
    expect(body).toEqual({
      name: 'growth',
      prompt: { text: 'Follow .agents/growth.md' },
      repos: [{ url: 'https://github.com/sargonpiraev/anidex', startingRef: 'main' }],
      autoCreatePR: true,
      skipReviewerRequest: false,
      mcpServers: [{ name: 'bigquery', type: 'stdio', command: 'npx' }],
    })
  })

  it('builds POST /v1/agents/{id}/runs follow-up prompt', () => {
    expect(buildCreateRunBody({ promptText: 'snapshot' })).toEqual({
      prompt: { text: 'snapshot' },
    })
  })
})
