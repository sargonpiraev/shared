import { createRequire } from 'node:module'
import { main } from '@pulumi/pulumi/provider/server'
import type {
  Provider,
  CreateResult,
  ReadResult,
  DiffResult,
} from '@pulumi/pulumi/provider/provider'
import { pickSingleGa4AccountId } from './account.js'
import { listedBigQueryLinks } from './listed-bigquery-links.js'

const require = createRequire(import.meta.url)

const schema = JSON.stringify({
  name: 'ga4',
  version: '0.1.0',
  resources: {
    'ga4:index:Property': {
      description: 'A Google Analytics 4 property (Admin API).',
      properties: {
        propertyId: {
          type: 'string',
          description: 'Numeric property id (without properties/ prefix).',
        },
        propertyName: {
          type: 'string',
          description: 'Resource name properties/{id}.',
        },
        displayName: { type: 'string' },
        measurementId: {
          type: 'string',
          description: 'Web stream measurement id (G-…), when resolvable.',
        },
        serviceAccountKeyB64: { type: 'string', secret: true },
        createTime: { type: 'string' },
      },
      required: [
        'propertyId',
        'propertyName',
        'displayName',
        'measurementId',
        'serviceAccountKeyB64',
        'createTime',
      ],
      inputProperties: {
        propertyId: { type: 'string' },
        serviceAccountKeyB64: { type: 'string', secret: true },
        importExisting: { type: 'boolean' },
        accountId: { type: 'string' },
        displayName: { type: 'string' },
        timeZone: { type: 'string' },
        currencyCode: { type: 'string' },
        measurementId: { type: 'string' },
        defaultUri: {
          type: 'string',
          description: 'https://… URL for WEB_DATA_STREAM on create',
        },
      },
      requiredInputs: ['serviceAccountKeyB64'],
    },
    'ga4:index:BigQueryLink': {
      description: 'GA4 → BigQuery native export link (Analytics Admin API v1alpha).',
      properties: {
        linkName: {
          type: 'string',
          description: 'properties/{id}/bigQueryLinks/{linkId}',
        },
        propertyId: { type: 'string' },
        gcpProject: {
          type: 'string',
          description: 'Linked GCP project resource name (projects/…).',
        },
        datasetLocation: { type: 'string' },
        serviceAccountKeyB64: { type: 'string', secret: true },
        createTime: { type: 'string' },
      },
      required: [
        'linkName',
        'propertyId',
        'gcpProject',
        'datasetLocation',
        'serviceAccountKeyB64',
        'createTime',
      ],
      inputProperties: {
        propertyId: { type: 'string' },
        gcpProjectId: { type: 'string' },
        datasetLocation: { type: 'string' },
        serviceAccountKeyB64: { type: 'string', secret: true },
        importExisting: { type: 'boolean' },
        dailyExportEnabled: { type: 'boolean' },
        streamingExportEnabled: { type: 'boolean' },
        freshDailyExportEnabled: { type: 'boolean' },
      },
      requiredInputs: ['propertyId', 'gcpProjectId', 'datasetLocation', 'serviceAccountKeyB64'],
    },
  },
})

function resourceType(urn: string): string {
  return urn.split('::')[2]?.split(':').pop() ?? ''
}

function normalizePropertyId(raw: string): string {
  if (raw == null || raw === '') {
    throw new Error('GA4 property id is missing (got empty/undefined)')
  }
  const trimmed = raw.trim()
  return trimmed.startsWith('properties/') ? trimmed.slice('properties/'.length) : trimmed
}

function propertyName(propertyId: string): string {
  return `properties/${normalizePropertyId(propertyId)}`
}

function normalizeAccountParent(raw: string): string {
  const trimmed = raw.trim()
  return trimmed.startsWith('accounts/') ? trimmed : `accounts/${trimmed}`
}

function buildAnalyticsAdmin(serviceAccountKeyB64: string) {
  const { analyticsadmin } = require('@googleapis/analyticsadmin')
  const { JWT } = require('google-auth-library')
  const keyJson = JSON.parse(Buffer.from(serviceAccountKeyB64, 'base64').toString('utf-8'))
  const auth = new JWT({
    email: keyJson.client_email,
    key: keyJson.private_key,
    scopes: [
      'https://www.googleapis.com/auth/analytics.edit',
      'https://www.googleapis.com/auth/cloud-platform',
    ],
  })
  // BigQuery links live on v1alpha only (not in v1beta).
  return analyticsadmin({ version: 'v1alpha', auth })
}

async function resolveMeasurementId(
  admin: ReturnType<typeof buildAnalyticsAdmin>,
  propertyId: string,
  preferred?: string
): Promise<string> {
  const res = await admin.properties.dataStreams.list({
    parent: propertyName(propertyId),
  })
  const streams = res.data.dataStreams ?? []
  const webStreams = streams.filter((s: { type?: string | null }) => s.type === 'WEB_DATA_STREAM')
  if (preferred) {
    const match = webStreams.find(
      (s: { webStreamData?: { measurementId?: string | null } | null }) =>
        s.webStreamData?.measurementId === preferred
    )
    if (match?.webStreamData?.measurementId) {
      return match.webStreamData.measurementId
    }
  }
  return webStreams[0]?.webStreamData?.measurementId ?? preferred ?? ''
}

function projectResourceName(gcpProjectId: string): string {
  const trimmed = gcpProjectId.trim()
  return trimmed.startsWith('projects/') ? trimmed : `projects/${trimmed}`
}

function projectMatches(linkedProject: string | null | undefined, wanted: string): boolean {
  if (!linkedProject) return false
  const a = linkedProject.replace(/^projects\//, '')
  const b = wanted.replace(/^projects\//, '')
  return a === b
}

const provider: Provider = {
  version: '0.1.0',
  schema,

  async create(urn, inputs): Promise<CreateResult> {
    const type = resourceType(urn)

    if (type === 'Property') {
      const admin = buildAnalyticsAdmin(inputs.serviceAccountKeyB64 as string)
      const preferredMeasurement = inputs.measurementId as string | undefined

      if (inputs.importExisting) {
        if (!inputs.propertyId) {
          throw new Error('ga4:index:Property importExisting requires propertyId')
        }
        const id = normalizePropertyId(inputs.propertyId as string)
        const res = await admin.properties.get({ name: propertyName(id) })
        if (!res.data.name) {
          throw new Error(
            `GA4 property "${id}" not found or not accessible by this Service Account.`
          )
        }
        const measurementId = await resolveMeasurementId(admin, id, preferredMeasurement)
        return {
          id,
          outs: {
            propertyId: id,
            propertyName: res.data.name,
            displayName: res.data.displayName ?? '',
            measurementId,
            serviceAccountKeyB64: inputs.serviceAccountKeyB64,
            createTime: res.data.createTime ?? new Date().toISOString(),
          },
        }
      }

      const accountId =
        (inputs.accountId as string | undefined) ??
        pickSingleGa4AccountId((await admin.accounts.list()).data.accounts ?? [])
      const displayName = inputs.displayName as string | undefined
      const timeZone = inputs.timeZone as string | undefined
      if (!displayName || !timeZone) {
        throw new Error(
          'ga4:index:Property create requires displayName and timeZone (or set importExisting with propertyId)'
        )
      }

      const created = await admin.properties.create({
        requestBody: {
          parent: normalizeAccountParent(accountId),
          displayName,
          timeZone,
          currencyCode: (inputs.currencyCode as string | undefined) ?? 'USD',
        },
      })
      const name = created.data.name
      if (!name) {
        throw new Error('GA4 properties.create returned no name')
      }
      const id = normalizePropertyId(name)
      const defaultUri = inputs.defaultUri as string | undefined
      if (defaultUri) {
        await admin.properties.dataStreams.create({
          parent: propertyName(id),
          requestBody: {
            type: 'WEB_DATA_STREAM',
            displayName: displayName,
            webStreamData: { defaultUri },
          },
        })
      }
      const measurementId = await resolveMeasurementId(admin, id, preferredMeasurement)
      return {
        id,
        outs: {
          propertyId: id,
          propertyName: name,
          displayName: created.data.displayName ?? displayName,
          measurementId,
          serviceAccountKeyB64: inputs.serviceAccountKeyB64,
          createTime: created.data.createTime ?? new Date().toISOString(),
        },
      }
    }

    if (type === 'BigQueryLink') {
      const admin = buildAnalyticsAdmin(inputs.serviceAccountKeyB64 as string)
      const id = normalizePropertyId(inputs.propertyId as string)
      const parent = propertyName(id)
      const gcpProjectId = inputs.gcpProjectId as string
      const datasetLocation = inputs.datasetLocation as string
      const wantedProject = projectResourceName(gcpProjectId)

      const listed = await admin.properties.bigQueryLinks.list({ parent })
      const links = listedBigQueryLinks(listed.data)
      const existing =
        links.find(
          (link) =>
            projectMatches(link.project, wantedProject) ||
            projectMatches(link.project, gcpProjectId)
        ) ??
        // One BQ link per property; API returns project *number* while we pass project *id*.
        (links.length === 1 ? links[0] : undefined)

      // Idempotent: reuse an existing property→project link (console or prior apply).
      if (existing?.name) {
        return {
          id: existing.name,
          outs: {
            linkName: existing.name,
            propertyId: id,
            gcpProject: existing.project ?? wantedProject,
            datasetLocation: existing.datasetLocation ?? datasetLocation,
            serviceAccountKeyB64: inputs.serviceAccountKeyB64,
            createTime: existing.createTime ?? new Date().toISOString(),
          },
        }
      }

      if (inputs.importExisting) {
        throw new Error(
          `GA4 BigQuery link for property "${id}" → project "${gcpProjectId}" not found.`
        )
      }

      const created = await admin.properties.bigQueryLinks.create({
        parent,
        requestBody: {
          project: wantedProject,
          datasetLocation,
          dailyExportEnabled: (inputs.dailyExportEnabled as boolean | undefined) ?? true,
          streamingExportEnabled: (inputs.streamingExportEnabled as boolean | undefined) ?? false,
          freshDailyExportEnabled: (inputs.freshDailyExportEnabled as boolean | undefined) ?? false,
        },
      })
      if (!created.data.name) {
        throw new Error('GA4 bigQueryLinks.create returned no name')
      }
      return {
        id: created.data.name,
        outs: {
          linkName: created.data.name,
          propertyId: id,
          gcpProject: created.data.project ?? wantedProject,
          datasetLocation: created.data.datasetLocation ?? datasetLocation,
          serviceAccountKeyB64: inputs.serviceAccountKeyB64,
          createTime: created.data.createTime ?? new Date().toISOString(),
        },
      }
    }

    throw new Error(`Unknown resource type in URN: ${urn}`)
  },

  async read(id, urn, props): Promise<ReadResult> {
    const type = resourceType(urn)
    const keyB64 = (props?.serviceAccountKeyB64 as string | undefined) ?? ''
    if (!keyB64) return { id }

    if (type === 'Property') {
      const admin = buildAnalyticsAdmin(keyB64)
      const propertyId = normalizePropertyId(id)
      const res = await admin.properties.get({
        name: propertyName(propertyId),
      })
      if (!res.data.name) return { id: '' }
      const measurementId = await resolveMeasurementId(
        admin,
        propertyId,
        props?.measurementId as string | undefined
      )
      return {
        id: propertyId,
        props: {
          propertyId,
          propertyName: res.data.name,
          displayName: res.data.displayName ?? '',
          measurementId,
          serviceAccountKeyB64: keyB64,
          createTime:
            res.data.createTime ??
            (props?.createTime as string | undefined) ??
            new Date().toISOString(),
        },
      }
    }

    if (type === 'BigQueryLink') {
      const admin = buildAnalyticsAdmin(keyB64)
      const res = await admin.properties.bigQueryLinks.get({ name: id })
      if (!res.data.name) return { id: '' }
      const propertyId = (props?.propertyId as string | undefined) ?? id.split('/')[1] ?? ''
      return {
        id,
        props: {
          linkName: res.data.name,
          propertyId,
          gcpProject: res.data.project ?? '',
          datasetLocation: res.data.datasetLocation ?? '',
          serviceAccountKeyB64: keyB64,
          createTime:
            res.data.createTime ??
            (props?.createTime as string | undefined) ??
            new Date().toISOString(),
        },
      }
    }

    return { id }
  },

  async diff(_id, urn, olds, news): Promise<DiffResult> {
    const type = resourceType(urn)
    if (type === 'Property') {
      const replaces: string[] = []
      if (
        olds.propertyId &&
        news.propertyId &&
        normalizePropertyId(olds.propertyId as string) !==
          normalizePropertyId(news.propertyId as string)
      ) {
        replaces.push('propertyId')
      }
      return { changes: replaces.length > 0, replaces }
    }
    if (type === 'BigQueryLink') {
      const replaces: string[] = []
      if (
        normalizePropertyId(String(olds.propertyId ?? '')) !==
        normalizePropertyId(String(news.propertyId ?? ''))
      ) {
        replaces.push('propertyId')
      }
      if (String(olds.gcpProjectId ?? '') !== String(news.gcpProjectId ?? '')) {
        replaces.push('gcpProjectId')
      }
      if (String(olds.datasetLocation ?? '') !== String(news.datasetLocation ?? '')) {
        replaces.push('datasetLocation')
      }
      return { changes: replaces.length > 0, replaces }
    }
    return {}
  },

  async delete(id, urn, props): Promise<void> {
    const type = resourceType(urn)
    const admin = buildAnalyticsAdmin(props.serviceAccountKeyB64 as string)

    if (type === 'Property') {
      // Soft-delete (archive) — Admin API delete moves property to trash.
      await admin.properties.delete({ name: propertyName(id) })
      return
    }

    if (type === 'BigQueryLink') {
      await admin.properties.bigQueryLinks.delete({ name: id })
    }
  },
}

main(provider, process.argv.slice(2))
