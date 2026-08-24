import fs from 'node:fs'
import path from 'node:path'
import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import * as vercel from '@pulumiverse/vercel'
import { Ga4BigQueryLink, Ga4Property } from '@sargonpiraev/pulumi-ga4'
import { GscProperty } from '@sargonpiraev/pulumi-gsc'
import { childOpts } from '../internal/child-opts.js'
import { repoHasWebapp } from '../internal/repo-has-app.js'
import { gcpProjectIdFromServiceAccountKeyB64 } from '../internal/sa-key.js'

export { repoHasWebapp }

/** Previous URN type — ComponentResource aliases only (stack continuity). */
const WEBAPP_TYPE_LEGACY = 'sargonpiraev:webapp-analytics:WebappAnalytics' as const

/** URN type token — governance `test:pulumi` asserts this ComponentResource is registered. */
export const WEBAPP_TYPE = 'sargonpiraev:apps:Webapp' as const

export type WebappChildAliases = {
  gcpProvider?: string
  bigqueryApi?: string
  bigqueryStorageApi?: string
  gscExportJobUser?: string
  gscExportDataEditor?: string
  dataset?: string
  gscProperty?: string
  ga4Property?: string
  ga4BigQueryLink?: string
  vercelProvider?: string
  vercelProject?: string
}

/** Vercel project inside the Webapp cluster (not a sibling at stack root). */
export type WebappVercelArgs = {
  apiToken: pulumi.Input<string>
  name: pulumi.Input<string>
  /** GitHub `owner/repo`. */
  gitRepository: pulumi.Input<string>
  framework?: pulumi.Input<string>
  rootDirectory?: pulumi.Input<string>
  ignoreChanges?: string[]
  /** Existing Vercel project id (`prj_…`) when adopting. */
  importId?: string
}

export type WebappArgs = {
  /**
   * GCP project for warehouse datasets.
   * Omit to derive from `gcpServiceAccountKeyB64` (`project_id` in the key JSON).
   */
  gcpProjectId?: pulumi.Input<string>
  datasetId: pulumi.Input<string>
  location: pulumi.Input<string>
  gscSiteUrl: pulumi.Input<string>
  /** Base64 SA key for `@sargonpiraev/pulumi-gsc` (Search Console API). */
  gscServiceAccountKeyB64: pulumi.Input<string>
  /** Base64 SA key for `@pulumi/gcp` (BQ dataset + export IAM). */
  gcpServiceAccountKeyB64: pulumi.Input<string>
  datasetDescription?: pulumi.Input<string>
  datasetLabels?: pulumi.Input<{ [key: string]: string }>
  /**
   * Adopt existing live resources (import + protect + optional stack-root aliases).
   * Use when moving ownership from meta or flattening into this component.
   */
  adoptExisting?: boolean
  /** Pulumi import id for the dataset, e.g. `projects/sargonpiraev/datasets/searchconsole_anidex`. */
  datasetImportId?: string
  /**
   * Previous Pulumi names when children lived at stack root (preserves state on first component wrap).
   */
  childAliases?: WebappChildAliases
  /**
   * Parent Google Analytics account. Omit to use the only account this SA can
   * list (`accounts.list` — fail if zero or many).
   */
  ga4AccountId?: pulumi.Input<string>
  /** Display name for the new GA4 property. Defaults from `gscSiteUrl`. */
  ga4DisplayName?: pulumi.Input<string>
  /** IANA time zone for the new GA4 property. Default `Europe/Moscow`. */
  ga4TimeZone?: pulumi.Input<string>
  /** ISO 4217 currency when creating. Default `USD`. */
  ga4CurrencyCode?: pulumi.Input<string>
  /** GA4 measurement id (`G-…`) — stream hint when adopting; otherwise resolved after create. */
  ga4MeasurementId?: pulumi.Input<string>
  /**
   * Adopt an existing GA4 property instead of creating.
   * Requires `ga4PropertyId`. Independent of `adoptExisting` (that flag is GSC/dataset).
   */
  ga4ImportExisting?: boolean
  /** Existing GA4 property id — only when `ga4ImportExisting` is true. */
  ga4PropertyId?: pulumi.Input<string>
  /**
   * Base64 SA key for `@sargonpiraev/pulumi-ga4` (Analytics Admin API).
   * Defaults to `gscServiceAccountKeyB64` when omitted.
   */
  ga4ServiceAccountKeyB64?: pulumi.Input<string>
  /**
   * Create/import the native GA4→BigQuery export link.
   * Defaults to true (automated — unlike GSC bulk export, which is console-driven).
   */
  ga4LinkBigQuery?: boolean
  /**
   * Force import-only for an existing GA4→BQ link.
   * Default false: provider creates the link (idempotent if one already exists).
   * Does **not** follow `adoptExisting` (that flag is for GSC/dataset adoption).
   */
  ga4ImportBigQueryLink?: boolean
  /** Vercel project — required for `apps/webapp`. */
  vercel: WebappVercelArgs
}

/**
 * `apps/webapp` / public `docapp` product analytics:
 * GSC property + BigQuery bulk-export dataset + IAM for Google's Search Console export SA,
 * plus **created** GA4 property (web stream) + native BigQuery export link via `@sargonpiraev/pulumi-ga4`,
 * plus the Vercel project.
 *
 * **No** custom Cloud Function for GSC/GA — native exports only.
 */
export class Webapp extends pulumi.ComponentResource {
  public readonly gscProperty: GscProperty
  public readonly dataset: gcp.bigquery.Dataset
  public readonly gscSiteUrl: pulumi.Output<string>
  public readonly datasetId: pulumi.Output<string>
  public readonly datasetLocation: pulumi.Output<string | undefined>
  public readonly ga4Property: Ga4Property
  public readonly ga4BigQueryLink?: Ga4BigQueryLink
  public readonly ga4MeasurementId: pulumi.Output<string>
  public readonly ga4PropertyId: pulumi.Output<string>
  public readonly vercelProject: vercel.Project
  public readonly vercelProjectId: pulumi.Output<string>

  constructor(name: string, args: WebappArgs, opts?: pulumi.ComponentResourceOptions) {
    super(
      WEBAPP_TYPE,
      name,
      args,
      pulumi.mergeOptions(opts, {
        aliases: [{ type: WEBAPP_TYPE_LEGACY }],
      })
    )

    const adopt = args.adoptExisting === true
    const aliases = args.childAliases ?? {}

    const vercelProvider = new vercel.Provider(
      `${name}-vercel`,
      { apiToken: args.vercel.apiToken },
      childOpts(this, aliases.vercelProvider)
    )

    this.vercelProject = new vercel.Project(
      `${name}-vercel-project`,
      {
        name: args.vercel.name,
        framework: args.vercel.framework ?? 'nextjs',
        rootDirectory: args.vercel.rootDirectory,
        gitRepository: {
          type: 'github',
          repo: args.vercel.gitRepository,
        },
      },
      childOpts(this, aliases.vercelProject, {
        provider: vercelProvider,
        ignoreChanges: args.vercel.ignoreChanges,
        ...(args.vercel.importId ? { import: args.vercel.importId } : {}),
      })
    )
    this.vercelProjectId = this.vercelProject.id

    const gcpProjectId =
      args.gcpProjectId ??
      pulumi.output(args.gcpServiceAccountKeyB64).apply(gcpProjectIdFromServiceAccountKeyB64)

    const credentials = pulumi
      .output(args.gcpServiceAccountKeyB64)
      .apply((b64) => Buffer.from(b64, 'base64').toString('utf-8'))

    const gcpProvider = new gcp.Provider(
      `${name}-gcp`,
      {
        project: gcpProjectId,
        credentials,
      },
      childOpts(this, aliases.gcpProvider)
    )

    const bigqueryApi = new gcp.projects.Service(
      `${name}-bigquery-api`,
      {
        project: gcpProjectId,
        service: 'bigquery.googleapis.com',
        disableOnDestroy: false,
      },
      childOpts(this, aliases.bigqueryApi, { provider: gcpProvider })
    )

    const bigqueryStorageApi = new gcp.projects.Service(
      `${name}-bigquerystorage-api`,
      {
        project: gcpProjectId,
        service: 'bigquerystorage.googleapis.com',
        disableOnDestroy: false,
      },
      childOpts(this, aliases.bigqueryStorageApi, { provider: gcpProvider })
    )

    const gscExportPrincipal =
      'serviceAccount:search-console-data-export@system.gserviceaccount.com'

    new gcp.projects.IAMMember(
      `${name}-gsc-export-job-user`,
      {
        project: gcpProjectId,
        role: 'roles/bigquery.jobUser',
        member: gscExportPrincipal,
      },
      childOpts(this, aliases.gscExportJobUser, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
        ...(adopt ? { protect: true } : {}),
      })
    )

    new gcp.projects.IAMMember(
      `${name}-gsc-export-data-editor`,
      {
        project: gcpProjectId,
        role: 'roles/bigquery.dataEditor',
        member: gscExportPrincipal,
      },
      childOpts(this, aliases.gscExportDataEditor, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
        ...(adopt ? { protect: true } : {}),
      })
    )

    const datasetImportId =
      args.datasetImportId ??
      (adopt
        ? pulumi
            .all([gcpProjectId, pulumi.output(args.datasetId)])
            .apply(([project, datasetId]) => `projects/${project}/datasets/${datasetId}`)
        : undefined)

    this.dataset = new gcp.bigquery.Dataset(
      `${name}-dataset`,
      {
        project: gcpProjectId,
        datasetId: args.datasetId,
        location: args.location,
        description: args.datasetDescription,
        labels: args.datasetLabels,
      },
      childOpts(this, aliases.dataset, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi, bigqueryStorageApi],
        ...(adopt
          ? {
              protect: true,
              ...(datasetImportId ? { import: datasetImportId } : {}),
              ignoreChanges: ['accesses'],
            }
          : {}),
      })
    )

    this.gscProperty = new GscProperty(
      `${name}-gsc-property`,
      {
        siteUrl: args.gscSiteUrl,
        serviceAccountKeyB64: args.gscServiceAccountKeyB64,
        importExisting: adopt,
      },
      childOpts(this, aliases.gscProperty)
    )

    this.gscSiteUrl = pulumi.output(args.gscSiteUrl)
    this.datasetId = this.dataset.datasetId
    this.datasetLocation = this.dataset.location

    const ga4Key = args.ga4ServiceAccountKeyB64 ?? args.gscServiceAccountKeyB64
    const linkBigQuery = args.ga4LinkBigQuery !== false
    const importBqLink = args.ga4ImportBigQueryLink === true
    const importGa4 = args.ga4ImportExisting === true
    const ga4DisplayName =
      args.ga4DisplayName ?? pulumi.output(args.gscSiteUrl).apply(gscNameFromSiteUrl)
    const ga4DefaultUri = pulumi.output(args.gscSiteUrl).apply(siteUrlToDefaultUri)

    this.ga4Property = new Ga4Property(
      `${name}-ga4-property`,
      {
        serviceAccountKeyB64: ga4Key,
        importExisting: importGa4,
        propertyId: args.ga4PropertyId,
        accountId: args.ga4AccountId,
        displayName: ga4DisplayName,
        timeZone: args.ga4TimeZone ?? 'Europe/Moscow',
        currencyCode: args.ga4CurrencyCode,
        measurementId: args.ga4MeasurementId,
        defaultUri: ga4DefaultUri,
      },
      childOpts(this, aliases.ga4Property, {
        ...(adopt && importGa4 ? { protect: true } : {}),
      })
    )
    this.ga4PropertyId = this.ga4Property.id
    this.ga4MeasurementId = pulumi
      .all([this.ga4Property.measurementId, args.ga4MeasurementId ?? ''])
      .apply(([resolved, hint]) => resolved || hint || '')

    if (linkBigQuery) {
      this.ga4BigQueryLink = new Ga4BigQueryLink(
        `${name}-ga4-bq-link`,
        {
          propertyId: this.ga4Property.id,
          gcpProjectId,
          datasetLocation: args.location,
          serviceAccountKeyB64: ga4Key,
          importExisting: importBqLink,
          dailyExportEnabled: true,
        },
        childOpts(this, aliases.ga4BigQueryLink, {
          dependsOn: [this.ga4Property, bigqueryApi],
        })
      )
    }

    this.registerOutputs({
      gscSiteUrl: this.gscSiteUrl,
      datasetId: this.datasetId,
      datasetLocation: this.datasetLocation,
      ga4MeasurementId: this.ga4MeasurementId,
      ga4PropertyId: this.ga4PropertyId,
      vercelProjectId: this.vercelProjectId,
    })
  }
}

/** True when the repo has a public web contour (`apps/webapp`). */
export function assertRepoHasWebapp(repoRoot: string): void {
  if (!fs.existsSync(path.join(repoRoot, 'apps', 'webapp'))) {
    throw new Error(`apps/webapp required under ${repoRoot}`)
  }
}

function gscNameFromSiteUrl(siteUrl: string): string {
  if (siteUrl.startsWith('sc-domain:')) return siteUrl.slice('sc-domain:'.length)
  return siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function siteUrlToDefaultUri(siteUrl: string): string {
  if (siteUrl.startsWith('sc-domain:')) {
    return `https://${siteUrl.slice('sc-domain:'.length)}`
  }
  if (siteUrl.startsWith('http://') || siteUrl.startsWith('https://')) {
    return siteUrl.replace(/\/$/, '')
  }
  return `https://${siteUrl}`
}
