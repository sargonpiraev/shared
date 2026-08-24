import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from '../internal/child-opts.js'
import {
  createHttpFunctionEtl,
  type HttpFunctionEtlChildAliases,
} from '../internal/http-function-etl.js'
import { repoHasMobapp } from '../internal/repo-has-app.js'

export { repoHasMobapp }

/** Previous URN type — ComponentResource aliases only (stack continuity). */
const MOBAPP_TYPE_LEGACY = 'sargonpiraev:apps:MobappAnalytics' as const

/** URN type token — governance `test:pulumi` asserts this ComponentResource is registered. */
export const MOBAPP_TYPE = 'sargonpiraev:apps:Mobapp' as const

export type MobappAscSecretRefs = {
  issuerIdSecret: string
  keyIdSecret: string
  privateKeySecret: string
  vendorNumberSecret: string
}

export type MobappArgs = {
  gcpProjectId: pulumi.Input<string>
  location: pulumi.Input<string>
  region: pulumi.Input<string>
  /** Usually `product_appstore`. */
  datasetId: pulumi.Input<string>
  appId: pulumi.Input<string>
  bundleId: pulumi.Input<string>
  appName: pulumi.Input<string>
  /** Product label for dataset labels (e.g. hbbt). */
  productLabel: string
  loaderAccountId: string
  gcpServiceAccountKeyB64: pulumi.Input<string>
  /** Deploy zip/dir from meta `dwhapp/functions/appstore-connect`. */
  sourceArchive: pulumi.asset.Asset | pulumi.asset.Archive
  sourceBucketName: pulumi.Input<string>
  sourceObjectName?: pulumi.Input<string>
  /** Secret Manager secret ids (must exist, or set createSecrets). */
  secrets: MobappAscSecretRefs
  /** When true, create Secret Manager secrets with the given ids (versions seeded outside). */
  createSecrets?: boolean
  functionName?: pulumi.Input<string>
  entryPoint?: pulumi.Input<string>
  schedulerJobName?: pulumi.Input<string>
  schedulerAccountId?: string
  deployerSaEmail?: pulumi.Input<string>
  salesLookbackDays?: pulumi.Input<string>
  datasetDescription?: pulumi.Input<string>
  analyticsReaderEmail?: pulumi.Input<string>
  adoptExisting?: boolean
  datasetImportId?: string
  /** Preserve Gen1 CF/Scheduler child names when adopting from a prior stack. */
  etlChildAliases?: HttpFunctionEtlChildAliases
}

/**
 * `apps/mobapp` product analytics:
 * BigQuery `product_appstore` dataset + tables + ASC Gen1 CF ETL + daily Scheduler.
 *
 * Play Store path is intentionally omitted for now.
 * Function source stays in the consuming stack — pass `sourceArchive`.
 */
export class Mobapp extends pulumi.ComponentResource {
  public readonly dataset: gcp.bigquery.Dataset
  public readonly salesTable: gcp.bigquery.Table
  public readonly analyticsTable: gcp.bigquery.Table
  public readonly loadLogTable: gcp.bigquery.Table
  public readonly loaderSa: gcp.serviceaccount.Account
  public readonly functionUrl: pulumi.Output<string>
  public readonly scheduleJobName: pulumi.Output<string>
  public readonly datasetId: pulumi.Output<string>
  public readonly appId: pulumi.Output<string>

  constructor(name: string, args: MobappArgs, opts?: pulumi.ComponentResourceOptions) {
    super(
      MOBAPP_TYPE,
      name,
      args,
      pulumi.mergeOptions(opts, {
        aliases: [{ type: MOBAPP_TYPE_LEGACY }],
      })
    )

    const adopt = args.adoptExisting === true
    const functionName = args.functionName ?? 'appstore-connect-etl'
    const entryPoint = args.entryPoint ?? 'loadAppStoreConnect'
    const schedulerJobName = args.schedulerJobName ?? 'appstore-connect-daily'
    const schedulerAccountId = args.schedulerAccountId ?? 'asc-etl-sched'
    const deployerSaEmail = args.deployerSaEmail ?? 'goproj@sargonpiraev.iam.gserviceaccount.com'
    const sourceObjectName = args.sourceObjectName ?? 'appstore-connect-etl-source.zip'
    const salesLookbackDays = args.salesLookbackDays ?? '14'

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

    const secretManagerApi = new gcp.projects.Service(
      `${name}-secretmanager-api`,
      {
        project: args.gcpProjectId,
        service: 'secretmanager.googleapis.com',
        disableOnDestroy: false,
      },
      childOpts(this, undefined, { provider: gcpProvider })
    )

    this.dataset = new gcp.bigquery.Dataset(
      `${name}-dataset`,
      {
        project: args.gcpProjectId,
        datasetId: args.datasetId,
        location: args.location,
        description:
          args.datasetDescription ?? `App Store Connect sales + analytics (${args.productLabel})`,
        labels: {
          domain: 'product',
          source: 'appstore',
          product: args.productLabel,
        },
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
        ...(adopt
          ? {
              protect: true,
              ...(args.datasetImportId ? { import: args.datasetImportId } : {}),
            }
          : {}),
      })
    )

    const tableAdoptOpts = adopt ? { protect: true, ignoreChanges: ['schema'] as string[] } : {}

    this.salesTable = new gcp.bigquery.Table(
      `${name}-sales-table`,
      {
        project: args.gcpProjectId,
        datasetId: this.dataset.datasetId,
        tableId: 'sales_summary_daily',
        description: 'ASC Sales and Trends SUMMARY / DAILY (units + proceeds)',
        timePartitioning: { type: 'DAY', field: 'report_date' },
        schema: JSON.stringify([
          { name: 'report_date', type: 'DATE', mode: 'REQUIRED' },
          { name: 'begin_date', type: 'DATE', mode: 'NULLABLE' },
          { name: 'end_date', type: 'DATE', mode: 'NULLABLE' },
          { name: 'sku', type: 'STRING', mode: 'NULLABLE' },
          { name: 'title', type: 'STRING', mode: 'NULLABLE' },
          { name: 'apple_identifier', type: 'STRING', mode: 'NULLABLE' },
          { name: 'product_type_identifier', type: 'STRING', mode: 'NULLABLE' },
          { name: 'units', type: 'INTEGER', mode: 'NULLABLE' },
          { name: 'developer_proceeds', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'customer_price', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'customer_currency', type: 'STRING', mode: 'NULLABLE' },
          { name: 'currency_of_proceeds', type: 'STRING', mode: 'NULLABLE' },
          { name: 'country_code', type: 'STRING', mode: 'NULLABLE' },
          { name: 'device', type: 'STRING', mode: 'NULLABLE' },
          { name: 'version', type: 'STRING', mode: 'NULLABLE' },
          { name: 'subscription', type: 'STRING', mode: 'NULLABLE' },
          { name: 'period', type: 'STRING', mode: 'NULLABLE' },
          { name: 'category', type: 'STRING', mode: 'NULLABLE' },
          { name: 'raw', type: 'STRING', mode: 'NULLABLE' },
          { name: 'loaded_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
        ]),
        deletionProtection: false,
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: [this.dataset],
        ...tableAdoptOpts,
      })
    )

    this.analyticsTable = new gcp.bigquery.Table(
      `${name}-analytics-table`,
      {
        project: args.gcpProjectId,
        datasetId: this.dataset.datasetId,
        tableId: 'analytics_daily',
        description:
          'ASC Analytics Reports (DAILY) — engagement impressions/page views, downloads, sessions, installs',
        timePartitioning: { type: 'DAY', field: 'event_date' },
        clusterings: ['report_name', 'metric_key'],
        schema: JSON.stringify([
          { name: 'report_name', type: 'STRING', mode: 'REQUIRED' },
          { name: 'report_category', type: 'STRING', mode: 'NULLABLE' },
          { name: 'processing_date', type: 'DATE', mode: 'NULLABLE' },
          { name: 'granularity', type: 'STRING', mode: 'NULLABLE' },
          { name: 'event_date', type: 'DATE', mode: 'REQUIRED' },
          { name: 'app_apple_identifier', type: 'STRING', mode: 'NULLABLE' },
          { name: 'app_name', type: 'STRING', mode: 'NULLABLE' },
          { name: 'metric_key', type: 'STRING', mode: 'NULLABLE' },
          { name: 'counts', type: 'INTEGER', mode: 'NULLABLE' },
          { name: 'unique_counts', type: 'INTEGER', mode: 'NULLABLE' },
          { name: 'dimensions_json', type: 'STRING', mode: 'NULLABLE' },
          { name: 'raw_json', type: 'STRING', mode: 'NULLABLE' },
          { name: 'loaded_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
        ]),
        deletionProtection: false,
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: [this.dataset],
        ...tableAdoptOpts,
      })
    )

    this.loadLogTable = new gcp.bigquery.Table(
      `${name}-load-log`,
      {
        project: args.gcpProjectId,
        datasetId: this.dataset.datasetId,
        tableId: 'load_log',
        description: 'ASC ETL run log',
        schema: JSON.stringify([
          { name: 'run_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
          { name: 'app_id', type: 'STRING', mode: 'NULLABLE' },
          { name: 'bundle_id', type: 'STRING', mode: 'NULLABLE' },
          { name: 'sales_rows', type: 'INTEGER', mode: 'NULLABLE' },
          { name: 'analytics_rows', type: 'INTEGER', mode: 'NULLABLE' },
          {
            name: 'available_analytics_reports',
            type: 'STRING',
            mode: 'NULLABLE',
          },
          {
            name: 'missing_analytics_reports',
            type: 'STRING',
            mode: 'NULLABLE',
          },
          { name: 'gaps_json', type: 'STRING', mode: 'NULLABLE' },
          { name: 'status', type: 'STRING', mode: 'NULLABLE' },
          { name: 'error', type: 'STRING', mode: 'NULLABLE' },
        ]),
        deletionProtection: false,
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: [this.dataset],
        ...tableAdoptOpts,
      })
    )

    if (args.analyticsReaderEmail !== undefined) {
      new gcp.bigquery.DatasetIamMember(
        `${name}-reader-viewer`,
        {
          project: args.gcpProjectId,
          datasetId: this.dataset.datasetId,
          role: 'roles/bigquery.dataViewer',
          member: pulumi.interpolate`serviceAccount:${args.analyticsReaderEmail}`,
        },
        childOpts(this, undefined, {
          provider: gcpProvider,
          dependsOn: [this.dataset],
        })
      )
    }

    this.loaderSa = new gcp.serviceaccount.Account(
      `${name}-loader`,
      {
        accountId: args.loaderAccountId,
        displayName: `App Store Connect ETL (${args.productLabel})`,
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
        datasetId: this.dataset.datasetId,
        role: 'roles/bigquery.dataEditor',
        member: pulumi.interpolate`serviceAccount:${this.loaderSa.email}`,
      },
      childOpts(this, undefined, {
        provider: gcpProvider,
        dependsOn: [this.dataset],
      })
    )

    const secretDefs = [
      { key: 'ASC_ISSUER_ID', id: args.secrets.issuerIdSecret, slug: 'issuer' },
      { key: 'ASC_KEY_ID', id: args.secrets.keyIdSecret, slug: 'key' },
      {
        key: 'ASC_PRIVATE_KEY',
        id: args.secrets.privateKeySecret,
        slug: 'private-key',
      },
      {
        key: 'ASC_VENDOR_NUMBER',
        id: args.secrets.vendorNumberSecret,
        slug: 'vendor',
      },
    ] as const

    for (const def of secretDefs) {
      if (args.createSecrets === true) {
        const secret = new gcp.secretmanager.Secret(
          `${name}-secret-${def.slug}`,
          {
            secretId: def.id,
            project: args.gcpProjectId,
            replication: { auto: {} },
            labels: { product: args.productLabel, source: 'appstore' },
          },
          childOpts(this, undefined, {
            provider: gcpProvider,
            dependsOn: [secretManagerApi],
          })
        )
        new gcp.secretmanager.SecretIamMember(
          `${name}-secret-${def.slug}-accessor`,
          {
            project: args.gcpProjectId,
            secretId: secret.secretId,
            role: 'roles/secretmanager.secretAccessor',
            member: pulumi.interpolate`serviceAccount:${this.loaderSa.email}`,
          },
          childOpts(this, undefined, {
            provider: gcpProvider,
            dependsOn: [secret, this.loaderSa],
          })
        )
      } else {
        new gcp.secretmanager.SecretIamMember(
          `${name}-secret-${def.slug}-accessor`,
          {
            project: args.gcpProjectId,
            secretId: def.id,
            role: 'roles/secretmanager.secretAccessor',
            member: pulumi.interpolate`serviceAccount:${this.loaderSa.email}`,
          },
          childOpts(this, undefined, {
            provider: gcpProvider,
            dependsOn: [secretManagerApi, this.loaderSa],
          })
        )
      }
    }

    const environmentVariables = pulumi
      .all([
        args.gcpProjectId,
        args.datasetId,
        args.location,
        args.appId,
        args.bundleId,
        args.appName,
        salesLookbackDays,
      ])
      .apply(([projectId, datasetId, location, appId, bundleId, appName, lookback]) => ({
        GOOGLE_CLOUD_PROJECT: projectId,
        GCP_BQ_DATASET_APPSTORE: datasetId,
        GCP_BQ_LOCATION: location,
        ASC_APP_ID: appId,
        ASC_BUNDLE_ID: bundleId,
        ASC_APP_NAME: appName,
        ASC_SALES_LOOKBACK_DAYS: lookback,
      }))

    const secretEnvironmentVariables = pulumi.output(args.gcpProjectId).apply((projectId) => [
      {
        key: 'ASC_ISSUER_ID',
        projectId,
        secret: args.secrets.issuerIdSecret,
        version: 'latest',
      },
      {
        key: 'ASC_KEY_ID',
        projectId,
        secret: args.secrets.keyIdSecret,
        version: 'latest',
      },
      {
        key: 'ASC_PRIVATE_KEY',
        projectId,
        secret: args.secrets.privateKeySecret,
        version: 'latest',
      },
      {
        key: 'ASC_VENDOR_NUMBER',
        projectId,
        secret: args.secrets.vendorNumberSecret,
        version: 'latest',
      },
    ])

    const etl = createHttpFunctionEtl({
      name: `${name}-etl`,
      projectId: args.gcpProjectId,
      location: args.location,
      region: args.region,
      provider: gcpProvider,
      parent: this,
      functionName,
      description: pulumi.interpolate`Pull App Store Connect into ${args.datasetId}`,
      entryPoint,
      availableMemoryMb: 512,
      timeoutSeconds: 540,
      serviceAccountEmail: this.loaderSa.email,
      environmentVariables,
      secretEnvironmentVariables,
      sourceArchive: args.sourceArchive,
      sourceObjectName,
      sourceBucketName: args.sourceBucketName,
      schedulerJobName,
      schedulerAccountId,
      schedulerDescription: `Daily App Store Connect ETL (${args.productLabel})`,
      attemptDeadline: '180s',
      deployerSaEmail,
      schedulerApi,
      dependsOn: [
        this.salesTable,
        this.analyticsTable,
        this.loadLogTable,
        this.loaderSa,
        secretManagerApi,
      ],
      ignoreSecretEnvDiff: true,
      childAliases: args.etlChildAliases,
    })

    this.functionUrl = etl.functionUrl
    this.scheduleJobName = etl.scheduleJob.name
    this.datasetId = this.dataset.datasetId
    this.appId = pulumi.output(args.appId)

    this.registerOutputs({
      datasetId: this.datasetId,
      functionUrl: this.functionUrl,
      scheduleJobName: this.scheduleJobName,
      appId: this.appId,
      loaderSaEmail: this.loaderSa.email,
    })
  }
}
