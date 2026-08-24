import { main } from '@pulumi/pulumi/provider/server'
import type {
  Provider,
  CreateResult,
  ReadResult,
  DiffResult,
  UpdateResult,
} from '@pulumi/pulumi/provider/provider'

const GRAPHQL_URL = 'https://api.expo.dev/graphql'

type ExpoApp = {
  id: string
  name: string
  slug: string
}

type ExpoAccount = {
  id: string
  name: string
}

const schema = JSON.stringify({
  name: 'expo',
  version: '0.1.0',
  resources: {
    'expo:index:Project': {
      description: 'Expo/EAS project in an Expo account.',
      properties: {
        token: { type: 'string', secret: true, description: 'Expo access token.' },
        accountName: { type: 'string', description: 'Expo account or organization name.' },
        name: { type: 'string', description: 'Expo app display name.' },
        slug: { type: 'string', description: 'Expo app slug.' },
        projectId: { type: 'string', description: 'Expo app/project id.' },
        projectUrl: { type: 'string', description: 'Expo dashboard URL for the project.' },
      },
      required: ['token', 'accountName', 'name', 'slug', 'projectId', 'projectUrl'],
      inputProperties: {
        token: { type: 'string', secret: true },
        accountName: { type: 'string' },
        name: { type: 'string' },
        slug: { type: 'string' },
      },
      requiredInputs: ['token', 'accountName', 'name', 'slug'],
    },
  },
})

function resourceType(urn: string): string {
  return urn.split('::')[2]?.split(':').pop() ?? ''
}

function projectUrl(accountName: string, slug: string): string {
  return `https://expo.dev/accounts/${accountName}/projects/${slug}`
}

function validateSlug(slug: string): void {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      'Expo project slug must be lowercase alphanumeric and may contain single dashes between segments.'
    )
  }
}

async function expoGraphql<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  const json = (await res.json()) as {
    data?: T
    errors?: Array<{ message?: string }>
  }

  if (!res.ok || json.errors?.length) {
    const message =
      json.errors
        ?.map((e) => e.message)
        .filter(Boolean)
        .join('; ') || res.statusText
    throw new Error(`Expo GraphQL failed: ${message}`)
  }

  if (json.data === undefined) {
    throw new Error('Expo GraphQL returned empty data.')
  }

  return json.data
}

async function getAccountByName(token: string, name: string): Promise<ExpoAccount> {
  const data = await expoGraphql<{
    account: { byName: ExpoAccount | null }
  }>(
    token,
    `
      query ($name: String!) {
        account {
          byName(accountName: $name) {
            id
            name
          }
        }
      }
    `,
    { name }
  )

  if (data.account.byName === null) {
    throw new Error(`Expo account "${name}" not found or not accessible by this token.`)
  }

  return data.account.byName
}

async function getAppById(token: string, id: string): Promise<ExpoApp | null> {
  const data = await expoGraphql<{
    appByAppId: ExpoApp | null
  }>(
    token,
    `
      query App($id: String!) {
        appByAppId(appId: $id) {
          id
          name
          slug
        }
      }
    `,
    { id }
  )

  return data.appByAppId
}

async function getAppByFullName(
  token: string,
  accountName: string,
  slug: string
): Promise<ExpoApp | null> {
  const fullName = `@${accountName}/${slug}`
  const data = await expoGraphql<{
    app: { byFullName: ExpoApp | null } | null
  }>(
    token,
    `
      query App($fullName: String!) {
        app {
          byFullName(fullName: $fullName) {
            id
            name
            slug
          }
        }
      }
    `,
    { fullName }
  )

  return data.app?.byFullName ?? null
}

async function createApp(
  token: string,
  accountId: string,
  name: string,
  slug: string
): Promise<ExpoApp> {
  const data = await expoGraphql<{
    app: { createApp: ExpoApp }
  }>(
    token,
    `
      mutation ($accountId: ID!, $name: String!, $slug: String!) {
        app {
          createApp(
            appInput: {
              accountId: $accountId,
              appInfo: { displayName: $name }
              projectName: $slug
            }
          ) {
            id
            name
            slug
          }
        }
      }
    `,
    { accountId, name, slug }
  )

  return data.app.createApp
}

async function updateAppName(token: string, id: string, name: string): Promise<ExpoApp> {
  const data = await expoGraphql<{
    app: { setAppInfo: ExpoApp }
  }>(
    token,
    `
      mutation ($id: ID!, $name: String!) {
        app {
          setAppInfo(appId: $id, appInfo: { displayName: $name }) {
            id
            name
            slug
          }
        }
      }
    `,
    { id, name }
  )

  return data.app.setAppInfo
}

function outputs(token: string, accountName: string, app: ExpoApp): Record<string, unknown> {
  return {
    token,
    accountName,
    name: app.name,
    slug: app.slug,
    projectId: app.id,
    projectUrl: projectUrl(accountName, app.slug),
  }
}

const provider: Provider = {
  version: '0.1.0',
  schema,

  async create(urn, inputs): Promise<CreateResult> {
    if (resourceType(urn) !== 'Project') throw new Error(`Unknown resource in URN: ${urn}`)

    const token = inputs.token as string
    const accountName = inputs.accountName as string
    const name = inputs.name as string
    const slug = inputs.slug as string
    validateSlug(slug)

    const existing = await getAppByFullName(token, accountName, slug)
    const app =
      existing ??
      (await createApp(token, (await getAccountByName(token, accountName)).id, name, slug))

    if (app.name !== name) {
      const updated = await updateAppName(token, app.id, name)
      return { id: updated.id, outs: outputs(token, accountName, updated) }
    }

    return { id: app.id, outs: outputs(token, accountName, app) }
  },

  async read(id, urn, props): Promise<ReadResult> {
    if (resourceType(urn) !== 'Project') return { id }

    const token = (props?.token as string | undefined) ?? ''
    const accountName = (props?.accountName as string | undefined) ?? ''
    if (!token || !accountName) return { id }

    const app = await getAppById(token, id)
    if (app === null) return { id: '' }

    return { id: app.id, props: outputs(token, accountName, app) }
  },

  async diff(_id, urn, olds, news): Promise<DiffResult> {
    if (resourceType(urn) !== 'Project') return {}

    const replaces: string[] = []
    if (olds.accountName !== news.accountName) replaces.push('accountName')
    if (olds.slug !== news.slug) replaces.push('slug')

    const changes = replaces.length > 0 || olds.name !== news.name
    return { changes, replaces }
  },

  async update(id, urn, _olds, news): Promise<UpdateResult> {
    if (resourceType(urn) !== 'Project') return {}

    const token = news.token as string
    const accountName = news.accountName as string
    const app = await updateAppName(token, id, news.name as string)
    return { outs: outputs(token, accountName, app) }
  },

  async delete(_id, urn): Promise<void> {
    if (resourceType(urn) !== 'Project') return
    // Expo project deletion requires elevated permissions and is intentionally left manual.
  },
}

main(provider, process.argv.slice(2))
