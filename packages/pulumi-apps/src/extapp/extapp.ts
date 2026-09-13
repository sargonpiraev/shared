import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from '../internal/child-opts.js'
import { createHttpFunctionEtl } from '../internal/http-function-etl.js'
import { repoHasExtapp } from '../internal/repo-has-app.js'
import {
  CWS_DEV_CONSOLE_URL,
  cwsPublicListingUrl,
  requireCwsItemId,
  requireCwsItemSlug,
} from './cws-item.js'

export { repoHasExtapp }
export {
  CWS_DEV_CONSOLE_URL,
  cwsPublicListingUrl,
  requireCwsItemId,
  requireCwsItemSlug,
} from './cws-item.js'

/** Previous URN type — ComponentResource aliases only (stack continuity). */
const EXTAPP_TYPE_LEGACY = 'sargonpiraev:apps:ExtappAnalytics' as const

/** URN type token — governance `test:pulumi` asserts this ComponentResource is registered. */
export const EXTAPP_TYPE = 'sargonpiraev:apps:Extapp' as const

export type ExtappArgs = {
  gcpProjectId: pulumi.Input<string>
  location: pulumi.Input<string>
  region: pulumi.Input<string>
  /** Usually `cws`. */
  datasetId: pulumi.Input<string>
  /** Tables + CF env. Defaults to `datasetId`. Use to write into a provider dataset while still managing a legacy dataset id. */
  writeDatasetId?: pulumi.Input<string>
  /** When false, do not create the dataset (meta warehouse already owns it). */
  createDataset?: boolean
  /**
   * Chrome Web Store item id — stack code constant, not env.
   * Create the item in the Developer Dashboard first (API cannot create items).
   */
  cwsItemId: string
  cwsItemSlug: string
  /** Product label for dataset/tables (lowercase slug). */
  productLabel: string
  /** Loader SA account id (6–30 chars). */
  loaderAccountId: string
  /** Base64 SA key for `@pulumi/gcp`. */
  gcpServiceAccountKeyB64: pulumi.Input<string>
  /** Deploy dir or zip for the listing CF (meta `dwhapp/functions/cws-listing`). */
  sourceArchive: pulumi.asset.Asset | pulumi.asset.Archive
  sourceObjectName?: pulumi.Input<string>
  sourceBucketName: pulumi.Input<string>
  functionName?: pulumi.Input<string>
  entryPoint?: pulumi.Input<string>
  schedulerJobName?: pulumi.Input<string>
  schedulerAccountId?: string
  deployerSaEmail?: pulumi.Input<string>
  datasetDescription?: pulumi.Input<string>
  listingTableId?: pulumi.Input<string>
  adoptExisting?: boolean
  datasetImportId?: string
}

const LISTING_TABLE_SCHEMA = JSON.stringify([
  { name: 'snapshot_date', type: 'DATE', mode: 'REQUIRED' },
  { name: 'item_id', type: 'STRING', mode: 'REQUIRED' },
  { name: 'item_slug', type: 'STRING', mode: 'NULLABLE' },
  { name: 'users', type: 'INTEGER', mode: 'NULLABLE' },
  { name: 'rating', type: 'FLOAT', mode: 'NULLABLE' },
  { name: 'rating_count', type: 'INTEGER', mode: 'NULLABLE' },
  { name: 'version', type: 'STRING', mode: 'NULLABLE' },
  { name: 'listing_updated', type: 'STRING', mode: 'NULLABLE' },
  { name: 'size_label', type: 'STRING', mode: 'NULLABLE' },
  { name: 'offered_by', type: 'STRING', mode: 'NULLABLE' },
  { name: 'source', type: 'STRING', mode: 'REQUIRED' },
  { name: 'scraped_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
])

/**
 * `apps/extapp` product analytics:
 * BigQuery `cws` dataset + listing table + Gen1 CF ETL + daily Scheduler.
 *
 * `cwsItemId` / `cwsItemSlug` must be non-empty strings in stack code (not env).
 * Empty id fails before any listing ETL is created — create the item in
 * Chrome Web Store Developer Dashboard first (API cannot create items).
 *
 * Function source stays in the consuming stack (meta `pulumi/dwhapp/functions/cws-listing`
 * or a project copy) — pass `sourceArchive`.
 */
export class Extapp extends pulumi.ComponentResource {
  public readonly dataset?: gcp.bigquery.Dataset
  public readonly listingTable: gcp.bigquery.Table
  public readonly loaderSa: gcp.serviceaccount.Account
  public readonly functionUrl: pulumi.Output<string>
  public readonly scheduleJobName: pulumi.Output<string>
  public readonly datasetId: pulumi.Output<string>
  public readonly cwsItemId: pulumi.Output<string>
  public readonly cwsDevConsoleUrl: pulumi.Output<string>
  public readonly cwsListingUrl: pulumi.Output<string>

  constructor(name: string, args: ExtappArgs, opts?: pulumi.ComponentResourceOptions) {
    const cwsItemId = requireCwsItemId(args.cwsItemId)
    const cwsItemSlug = requireCwsItemSlug(args.cwsItemSlug)

    super(
      EXTAPP_TYPE,
      name,
      args,
      pulumi.mergeOptions(opts, {
        aliases: [{ type: EXTAPP_TYPE_LEGACY }],
      })
    )

    const adopt = args.adoptExisting === true
    const createDataset = args.createDataset !== false
    const functionName = args.functionName ?? 'cws-listing-etl'
    const entryPoint = args.entryPoint ?? 'loadCwsListingHttp'
    const schedulerJobName = args.schedulerJobName ?? 'cws-listing-daily'
    const schedulerAccountId = args.schedulerAccountId ?? 'cws-listing-sched'
    const deployerSaEmail = args.deployerSaEmail ?? 'goproj@sargonpiraev.iam.gserviceaccount.com'
    const sourceObjectName = args.sourceObjectName ?? 'cws-listing-etl-source.zip'
    const listingTableId = args.listingTableId ?? `${args.productLabel}_listing_daily`

    const credentials = pulumi
      .output(args.gcpServiceAccountKeyB64)
      .apply((b64) => Buffer.from(b64, 'base64').toString('utf-8'))

    const gcpProvider = new gcp.Provider(
      `${name}-gcp`,
      {
        project: args.gcpProjectId,
        credentials,
      },
      childOpts(this, undefined)
    )

    const bigqueryApi = new gcp.projects.Service(
      `${name}-bigquery-api`,
      {
        project: args.gcpProjectId,
        service: 'bigquery.googleapis.com',
        disableOnDestroy: false,
      },
      childOpts(this, undefined, { provider: gcpProvider })
    )

    const schedulerApi = new gcp.projects.Service(
      `${name}-scheduler-api`,
      {
        project: args.gcpProjectId,
        service: 'cloudscheduler.googleapis.com',
        disableOnDestroy: false,
      },
      childOpts(this, undefined, { provider: gcpProvider })
    )

    if (createDataset) {
      this.dataset = new gcp.bigquery.Dataset(
        `${name}-dataset`,
        {
          project: args.gcpProjectId,
          datasetId: args.datasetId,
          location: args.location,
          deletionPolicy: 'ABANDON',
          description:
            args.datasetDescription ?? `Chrome Web Store product analytics (${args.productLabel})`,
          labels: {
            domain: 'product',
            source: 'cws',
            product: args.productLabel,
          },
        },
        childOpts(this, undefined, {
          provider: gcpProvider,
          dependsOn: [bigqueryApi],
          retainOnDelete: true,
          ...(adopt
            ? {
                protect: true,
                ignoreChanges: ['labels', 'description'],
                ...(args.datasetImportId ? { import: args.datasetImportId } : {}),
              }
            : {}),
        })
      )
    }

    const resolvedDatasetId = this.dataset?.datasetId ?? pulumi.output(args.datasetId)
    const writeDatasetId = pulumi.output(args.writeDatasetId ?? args.datasetId)
    const writeDatasetIdInput = args.writeDatasetId ?? args.datasetId
    const listingTableImport =
      adopt &&
      typeof args.gcpProjectId === 'string' &&
      typeof writeDatasetIdInput === 'string' &&
      typeof listingTableId === 'string'
        ? `projects/${args.gcpProjectId}/datasets/${writeDatasetIdInput}/tables/${listingTableId}`
        : undefined

    this.listingTable = new gcp.bigquery.Table(
      `${name}-listing-table`,
      {
        project: args.gcpProjectId,
        datasetId: writeDatasetId,
        tableId: listingTableId,
        description: `Daily public CWS listing snapshot (${args.productLabel})`,
        schema: LISTING_TABLE_SCHEMA,
        deletionProtection: false,
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: this.dataset ? [this.dataset] : [bigqueryApi],
        retainOnDelete: true,
        ...(adopt
          ? {
              protect: true,
              ignoreChanges: ['schema'],
              ...(listingTableImport ? { import: listingTableImport } : {}),
            }
          : {}),
      })
    )

    this.loaderSa = new gcp.serviceaccount.Account(
      `${name}-loader`,
      {
        accountId: args.loaderAccountId,
        displayName: `CWS listing ETL (${args.productLabel})`,
        project: args.gcpProjectId,
      },
      childOpts(this, undefined, { provider: gcpProvider })
    )

    new gcp.serviceaccount.IAMMember(
      `${name}-loader-deployer-actas`,
      {
        serviceAccountId: this.loaderSa.name,
        role: 'roles/iam.serviceAccountUser',
        member: pulumi.interpolate`serviceAccount:${deployerSaEmail}`,
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: [this.loaderSa],
      })
    )

    new gcp.projects.IAMMember(
      `${name}-loader-job-user`,
      {
        project: args.gcpProjectId,
        role: 'roles/bigquery.jobUser',
        member: pulumi.interpolate`serviceAccount:${this.loaderSa.email}`,
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
      })
    )

    new gcp.bigquery.DatasetIamMember(
      `${name}-loader-data-editor`,
      {
        project: args.gcpProjectId,
        datasetId: writeDatasetId,
        role: 'roles/bigquery.dataEditor',
        member: pulumi.interpolate`serviceAccount:${this.loaderSa.email}`,
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: this.dataset ? [this.dataset] : [bigqueryApi],
      })
    )

    const environmentVariables = pulumi
      .all([args.gcpProjectId, writeDatasetId, args.location, cwsItemId, cwsItemSlug])
      .apply(([projectId, datasetId, location, itemId, itemSlug]) => ({
        GOOGLE_CLOUD_PROJECT: projectId,
        GCP_BQ_CWS_DATASET: datasetId,
        GCP_BQ_LOCATION: location,
        CWS_ITEM_ID: itemId,
        CWS_ITEM_SLUG: itemSlug,
        CWS_ENABLE_DASHBOARD: '0',
      }))

    const etl = createHttpFunctionEtl({
      name: `${name}-etl`,
      projectId: args.gcpProjectId,
      location: args.location,
      region: args.region,
      provider: gcpProvider,
      parent: this,
      functionName,
      description: pulumi.interpolate`Daily CWS public listing snapshot → ${writeDatasetId}`,
      entryPoint,
      availableMemoryMb: 256,
      timeoutSeconds: 120,
      serviceAccountEmail: this.loaderSa.email,
      environmentVariables,
      sourceArchive: args.sourceArchive,
      sourceObjectName,
      sourceBucketName: args.sourceBucketName,
      schedulerJobName,
      schedulerAccountId,
      schedulerDescription: `Daily CWS listing ETL (${args.productLabel})`,
      deployerSaEmail,
      schedulerApi,
      dependsOn: [this.listingTable, this.loaderSa, bigqueryApi],
    })

    this.functionUrl = etl.functionUrl
    this.scheduleJobName = etl.scheduleJob.name
    this.datasetId = resolvedDatasetId
    this.cwsItemId = pulumi.output(cwsItemId)
    this.cwsDevConsoleUrl = pulumi.output(CWS_DEV_CONSOLE_URL)
    this.cwsListingUrl = pulumi.output(cwsPublicListingUrl(cwsItemSlug, cwsItemId))

    this.registerOutputs({
      datasetId: this.datasetId,
      functionUrl: this.functionUrl,
      scheduleJobName: this.scheduleJobName,
      cwsItemId: this.cwsItemId,
      cwsDevConsoleUrl: this.cwsDevConsoleUrl,
      cwsListingUrl: this.cwsListingUrl,
      loaderSaEmail: this.loaderSa.email,
    })
  }
}
