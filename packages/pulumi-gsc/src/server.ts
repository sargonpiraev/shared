import { createRequire } from 'node:module'
import { main } from '@pulumi/pulumi/provider/server.js'
import type {
  Provider,
  CreateResult,
  ReadResult,
  DiffResult,
} from '@pulumi/pulumi/provider/provider'

const require = createRequire(import.meta.url)

const schema = JSON.stringify({
  name: 'gsc',
  version: '0.1.0',
  resources: {
    'gsc:index:Property': {
      description: 'A Google Search Console property (site).',
      properties: {
        siteUrl: {
          type: 'string',
          description: 'The URL of the property (e.g. sc-domain:example.com).',
        },
        serviceAccountKeyB64: {
          type: 'string',
          secret: true,
          description: 'Base64-encoded Google Service Account JSON key.',
        },
        permissionLevel: {
          type: 'string',
          description: 'Permission level of the service account on this property.',
        },
        registeredAt: {
          type: 'string',
          description: 'ISO timestamp when the property was registered.',
        },
      },
      required: ['siteUrl', 'serviceAccountKeyB64', 'permissionLevel', 'registeredAt'],
      inputProperties: {
        siteUrl: { type: 'string' },
        serviceAccountKeyB64: { type: 'string', secret: true },
        importExisting: { type: 'boolean' },
      },
      requiredInputs: ['siteUrl', 'serviceAccountKeyB64'],
    },
  },
})

function resourceType(urn: string): string {
  // urn format: urn:pulumi:stack::project::gsc:index:Property::name
  return urn.split('::')[2]?.split(':').pop() ?? ''
}

function buildSearchConsole(serviceAccountKeyB64: string) {
  const { searchconsole } = require('@googleapis/searchconsole')
  const { JWT } = require('google-auth-library')
  const keyJson = JSON.parse(Buffer.from(serviceAccountKeyB64, 'base64').toString('utf-8'))
  const auth = new JWT({
    email: keyJson.client_email,
    key: keyJson.private_key,
    scopes: [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly',
    ],
  })
  return searchconsole({ version: 'v1', auth })
}

const provider: Provider = {
  version: '0.1.0',
  schema,

  async create(urn, inputs): Promise<CreateResult> {
    if (resourceType(urn) === 'Property') {
      const sc = buildSearchConsole(inputs.serviceAccountKeyB64 as string)

      if (inputs.importExisting) {
        const res = await sc.sites.get({ siteUrl: inputs.siteUrl })
        if (!res.data.siteUrl) {
          throw new Error(
            `GSC property "${inputs.siteUrl}" not found or not accessible by this Service Account.`
          )
        }
        return {
          id: inputs.siteUrl as string,
          outs: {
            siteUrl: res.data.siteUrl,
            serviceAccountKeyB64: inputs.serviceAccountKeyB64,
            permissionLevel: res.data.permissionLevel ?? 'unknown',
            registeredAt: new Date().toISOString(),
          },
        }
      }

      await sc.sites.add({ siteUrl: inputs.siteUrl })
      const res = await sc.sites.get({ siteUrl: inputs.siteUrl })
      return {
        id: inputs.siteUrl as string,
        outs: {
          siteUrl: inputs.siteUrl,
          serviceAccountKeyB64: inputs.serviceAccountKeyB64,
          permissionLevel: res.data.permissionLevel ?? 'unknown',
          registeredAt: new Date().toISOString(),
        },
      }
    }
    throw new Error(`Unknown resource type in URN: ${urn}`)
  },

  async read(id, urn, props): Promise<ReadResult> {
    if (resourceType(urn) === 'Property') {
      const keyB64 = (props?.serviceAccountKeyB64 as string | undefined) ?? ''
      if (!keyB64) return { id }
      const sc = buildSearchConsole(keyB64)
      const res = await sc.sites.get({ siteUrl: id })
      if (!res.data.siteUrl) return { id: '' }
      return {
        id,
        props: {
          siteUrl: res.data.siteUrl,
          serviceAccountKeyB64: keyB64,
          permissionLevel: res.data.permissionLevel ?? 'unknown',
          registeredAt: (props?.registeredAt as string | undefined) ?? new Date().toISOString(),
        },
      }
    }
    return { id }
  },

  async diff(_id, urn, olds, news): Promise<DiffResult> {
    if (resourceType(urn) === 'Property') {
      const replaces: string[] = []
      if (olds.siteUrl !== news.siteUrl) replaces.push('siteUrl')
      return { changes: replaces.length > 0, replaces }
    }
    return {}
  },

  async delete(id, urn, props): Promise<void> {
    if (resourceType(urn) === 'Property') {
      const sc = buildSearchConsole(props.serviceAccountKeyB64 as string)
      await sc.sites.delete({ siteUrl: id })
    }
  },
}

main(provider, process.argv.slice(2))
