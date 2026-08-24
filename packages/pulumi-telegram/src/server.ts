import { main } from '@pulumi/pulumi/provider/server'
import type {
  Provider,
  CreateResult,
  ReadResult,
  DiffResult,
} from '@pulumi/pulumi/provider/provider'

const API = 'https://api.telegram.org'

const schema = JSON.stringify({
  name: 'telegram',
  version: '0.1.0',
  resources: {
    'telegram:index:Bot': {
      description:
        'Telegram bot registration (token from @BotFather). Create only validates token and optional webhook — does not create a bot in Telegram.',
      properties: {
        botToken: { type: 'string', secret: true, description: 'Bot token from @BotFather' },
        webhookUrl: { type: 'string', description: 'HTTPS URL for setWebhook (optional)' },
        botId: { type: 'string', description: 'Numeric user id of the bot' },
        username: { type: 'string', description: 'Bot username without @' },
        firstName: { type: 'string', description: 'Bot display name' },
      },
      required: ['botToken', 'botId', 'username', 'firstName'],
      inputProperties: {
        botToken: { type: 'string', secret: true },
        webhookUrl: { type: 'string' },
      },
      requiredInputs: ['botToken'],
    },
  },
})

function resourceType(urn: string): string {
  return urn.split('::')[2]?.split(':').pop() ?? ''
}

async function telegramFetch(
  token: string,
  method: string,
  body?: object
): Promise<{ ok: boolean; result?: unknown; description?: string }> {
  const res = await fetch(`${API}/bot${token}/${method}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return (await res.json()) as { ok: boolean; result?: unknown; description?: string }
}

async function getMe(token: string): Promise<{ id: number; username: string; first_name: string }> {
  const j = await telegramFetch(token, 'getMe')
  if (!j.ok || !j.result || typeof j.result !== 'object') {
    throw new Error(`Telegram getMe failed: ${j.description ?? 'unknown'}`)
  }
  const r = j.result as { id: number; username: string; first_name: string }
  if (typeof r.id !== 'number') throw new Error('Telegram getMe: invalid response')
  return r
}

const provider: Provider = {
  version: '0.1.0',
  schema,

  async create(urn, inputs): Promise<CreateResult> {
    if (resourceType(urn) !== 'Bot') throw new Error(`Unknown resource in URN: ${urn}`)

    const token = inputs.botToken as string
    const me = await getMe(token)
    const webhookUrl = (inputs.webhookUrl as string | undefined)?.trim() ?? ''

    if (webhookUrl) {
      const wh = await telegramFetch(token, 'setWebhook', { url: webhookUrl })
      if (!wh.ok) throw new Error(`Telegram setWebhook failed: ${wh.description ?? 'unknown'}`)
    }

    const id = String(me.id)
    return {
      id,
      outs: {
        botToken: token,
        webhookUrl: webhookUrl,
        botId: id,
        username: me.username ?? '',
        firstName: me.first_name ?? '',
      },
    }
  },

  async read(id, urn, props): Promise<ReadResult> {
    if (resourceType(urn) !== 'Bot') return { id }

    const token = (props?.botToken as string | undefined) ?? ''
    if (!token) return { id }

    const me = await getMe(token)
    return {
      id: String(me.id),
      props: {
        botToken: token,
        webhookUrl: (props?.webhookUrl as string | undefined) ?? '',
        botId: String(me.id),
        username: me.username ?? '',
        firstName: me.first_name ?? '',
      },
    }
  },

  async diff(_id, urn, olds, news): Promise<DiffResult> {
    if (resourceType(urn) !== 'Bot') return {}

    const replaces: string[] = []
    if (olds.botToken !== news.botToken) replaces.push('botToken')
    if ((olds.webhookUrl ?? '') !== (news.webhookUrl ?? '')) replaces.push('webhookUrl')

    return {
      changes: replaces.length > 0,
      replaces,
    }
  },

  async delete(id, urn, props): Promise<void> {
    void id
    if (resourceType(urn) !== 'Bot') return

    const token = props.botToken as string
    const hadWebhook = Boolean((props.webhookUrl as string | undefined)?.trim())
    if (hadWebhook) {
      const j = await telegramFetch(token, 'deleteWebhook')
      if (!j.ok) throw new Error(`Telegram deleteWebhook failed: ${j.description ?? 'unknown'}`)
    }
  },
}

main(provider, process.argv.slice(2))
