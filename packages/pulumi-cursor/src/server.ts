import { main } from '@pulumi/pulumi/provider/server.js'
import type {
  Provider,
  CreateResult,
  ReadResult,
  DiffResult,
  UpdateResult,
} from '@pulumi/pulumi/provider/provider.js'
import { buildCreateAgentBody, cursorFetch, type CursorMcpServer } from './api.js'

const schema = JSON.stringify({
  name: 'cursor',
  version: '0.1.0',
  config: {
    variables: {
      apiKey: {
        type: 'string',
        secret: true,
        description: 'Cursor Cloud Agents API key (Bearer). Vault: CURSOR_API_KEY.',
      },
    },
    required: ['apiKey'],
  },
  resources: {
    'cursor:index:Agent': {
      description:
        'Durable Cursor Cloud Agent (POST /v1/agents). Runs are ephemeral — use POST /v1/agents/{id}/runs.',
      properties: {
        apiKey: { type: 'string', secret: true },
        name: { type: 'string' },
        promptText: { type: 'string' },
        repositoryUrl: { type: 'string' },
        startingRef: { type: 'string' },
        autoCreatePR: { type: 'boolean' },
        skipReviewerRequest: { type: 'boolean' },
        mcpServersJson: { type: 'string', secret: true },
        agentId: { type: 'string' },
        agentName: { type: 'string' },
        status: { type: 'string' },
        url: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
      required: [
        'apiKey',
        'name',
        'promptText',
        'repositoryUrl',
        'startingRef',
        'autoCreatePR',
        'mcpServersJson',
        'agentId',
        'agentName',
        'status',
        'url',
        'createdAt',
        'updatedAt',
      ],
      inputProperties: {
        apiKey: { type: 'string', secret: true },
        name: { type: 'string' },
        promptText: { type: 'string' },
        repositoryUrl: { type: 'string' },
        startingRef: { type: 'string' },
        autoCreatePR: { type: 'boolean' },
        skipReviewerRequest: { type: 'boolean' },
        mcpServersJson: { type: 'string', secret: true },
      },
      requiredInputs: [
        'apiKey',
        'name',
        'promptText',
        'repositoryUrl',
        'startingRef',
        'autoCreatePR',
        'mcpServersJson',
      ],
    },
  },
})

function resourceType(urn: string): string {
  return urn.split('::')[2]?.split(':').pop() ?? ''
}

function unwrapString(value: unknown, field: string): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const rec = value as Record<string, unknown>
    if (typeof rec.value === 'string') return rec.value
    if (typeof rec.plaintext === 'string') return rec.plaintext
  }
  throw new Error(`${field} must be a string, got ${typeof value}`)
}

function apiKeyFrom(props: Record<string, unknown> | undefined): string {
  return unwrapString(props?.apiKey, 'apiKey')
}

type AgentApi = {
  id: string
  name?: string
  status: string
  url: string
  createdAt: string
  updatedAt: string
}

function parseAgent(json: unknown): AgentApi {
  const root = json as { agent?: AgentApi } & AgentApi
  const agent = root.agent ?? root
  return {
    id: agent.id,
    name: agent.name,
    status: agent.status,
    url: agent.url,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  }
}

function mcpServersFromInputs(inputs: Record<string, unknown>): CursorMcpServer[] {
  const raw = inputs.mcpServersJson
  if (Array.isArray(raw)) return raw as CursorMcpServer[]
  if (typeof raw === 'string') return JSON.parse(raw) as CursorMcpServer[]
  if (raw && typeof raw === 'object' && 'value' in (raw as object)) {
    return mcpServersFromInputs({ mcpServersJson: (raw as { value: unknown }).value })
  }
  throw new Error(`mcpServersJson must be a JSON string or array, got ${typeof raw}`)
}

function outsFromAgent(inputs: Record<string, unknown>, agent: AgentApi): Record<string, unknown> {
  return {
    name: inputs.name,
    promptText: inputs.promptText,
    repositoryUrl: inputs.repositoryUrl,
    startingRef: inputs.startingRef,
    autoCreatePR: inputs.autoCreatePR,
    skipReviewerRequest: inputs.skipReviewerRequest ?? false,
    apiKey: inputs.apiKey,
    mcpServersJson: inputs.mcpServersJson,
    agentId: agent.id,
    agentName: agent.name ?? (inputs.name as string),
    status: agent.status,
    url: agent.url,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  }
}

const provider: Provider = {
  version: '0.1.0',
  schema,

  async create(urn, inputs): Promise<CreateResult> {
    if (resourceType(urn) !== 'Agent') throw new Error(`Unknown resource type in URN: ${urn}`)
    const key = apiKeyFrom(inputs)
    const body = buildCreateAgentBody({
      name: inputs.name as string,
      promptText: inputs.promptText as string,
      repositoryUrl: inputs.repositoryUrl as string,
      startingRef: inputs.startingRef as string,
      autoCreatePR: inputs.autoCreatePR as boolean,
      skipReviewerRequest: (inputs.skipReviewerRequest as boolean | undefined) ?? false,
      mcpServers: mcpServersFromInputs(inputs),
    })
    const { status, json } = await cursorFetch(key, 'POST', '/v1/agents', body)
    if (status !== 201) {
      throw new Error(`Cursor POST /v1/agents ${status}: ${JSON.stringify(json).slice(0, 800)}`)
    }
    const agent = parseAgent(json)
    if (!agent.id) {
      throw new Error(
        `Cursor POST /v1/agents missing agent.id: ${JSON.stringify(json).slice(0, 800)}`
      )
    }
    return { id: agent.id, outs: outsFromAgent(inputs, agent) }
  },

  async read(id, urn, props): Promise<ReadResult> {
    if (resourceType(urn) !== 'Agent') return { id }
    const key = apiKeyFrom(props)
    if (!key) {
      return { id, props: props ?? {} }
    }
    const { status, json } = await cursorFetch(key, 'GET', `/v1/agents/${id}`)
    if (status === 404) return { id: '' }
    if (status !== 200) {
      throw new Error(
        `Cursor GET /v1/agents/${id} ${status}: ${JSON.stringify(json).slice(0, 800)}`
      )
    }
    const agent = parseAgent(json)
    return { id, props: outsFromAgent(props ?? {}, agent) }
  },

  async diff(_id, urn, olds, news): Promise<DiffResult> {
    if (resourceType(urn) !== 'Agent') return {}
    const replaces: string[] = []
    if (olds.repositoryUrl !== news.repositoryUrl) replaces.push('repositoryUrl')
    if (olds.startingRef !== news.startingRef) replaces.push('startingRef')
    const changed =
      replaces.length > 0 ||
      olds.name !== news.name ||
      olds.promptText !== news.promptText ||
      olds.autoCreatePR !== news.autoCreatePR ||
      olds.skipReviewerRequest !== news.skipReviewerRequest ||
      olds.mcpServersJson !== news.mcpServersJson
    return { changes: changed, replaces }
  },

  async update(id, urn, _olds, news): Promise<UpdateResult> {
    if (resourceType(urn) !== 'Agent') throw new Error(`Unknown resource type in URN: ${urn}`)
    const key = apiKeyFrom(news)
    const { status, json } = await cursorFetch(key, 'GET', `/v1/agents/${id}`)
    if (status !== 200) {
      throw new Error(
        `Cursor GET /v1/agents/${id} ${status}: ${JSON.stringify(json).slice(0, 800)}`
      )
    }
    const agent = parseAgent(json)
    return { outs: outsFromAgent(news, agent) }
  },

  async delete(id, urn, props): Promise<void> {
    if (resourceType(urn) !== 'Agent') return
    const key = apiKeyFrom(props)
    const { status, json } = await cursorFetch(key, 'DELETE', `/v1/agents/${id}`)
    if (status !== 200 && status !== 404) {
      throw new Error(
        `Cursor DELETE /v1/agents/${id} ${status}: ${JSON.stringify(json).slice(0, 800)}`
      )
    }
  },
}

main(provider, process.argv.slice(2))
