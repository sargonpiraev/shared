export const CURSOR_API = 'https://api.cursor.com'

export type CursorMcpServer = {
  name: string
  type?: 'stdio' | 'http' | 'sse'
  command?: string
  args?: string[]
  env?: Record<string, string>
  url?: string
  headers?: Record<string, string>
}

export type CreateAgentBody = {
  name: string
  prompt: { text: string }
  repos: Array<{ url: string; startingRef: string }>
  autoCreatePR: boolean
  skipReviewerRequest: boolean
  mcpServers: CursorMcpServer[]
}

export function buildCreateAgentBody(input: {
  name: string
  promptText: string
  repositoryUrl: string
  startingRef: string
  autoCreatePR: boolean
  skipReviewerRequest: boolean
  mcpServers: CursorMcpServer[]
}): CreateAgentBody {
  return {
    name: input.name,
    prompt: { text: input.promptText },
    repos: [{ url: input.repositoryUrl, startingRef: input.startingRef }],
    autoCreatePR: input.autoCreatePR,
    skipReviewerRequest: input.skipReviewerRequest,
    mcpServers: input.mcpServers,
  }
}

export function buildCreateRunBody(input: { promptText: string }): { prompt: { text: string } } {
  return { prompt: { text: input.promptText } }
}

export async function cursorFetch(
  apiKey: string,
  method: string,
  path: string,
  body?: unknown
): Promise<{ status: number; json: unknown }> {
  const res = await fetch(`${CURSOR_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (text.length === 0) return { status: res.status, json: {} }
  const json = JSON.parse(text) as unknown
  return { status: res.status, json }
}
