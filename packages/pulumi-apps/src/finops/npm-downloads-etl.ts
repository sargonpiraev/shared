import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from '../internal/child-opts.js'
import {
  createHttpFunctionEtl,
  type HttpFunctionEtlChildAliases,
} from '../internal/http-function-etl.js'

/** URN type token — governance `test:pulumi` asserts this ComponentResource is registered. */
export const NPM_DOWNLOADS_ETL_TYPE = 'sargonpiraev:apps:NpmDownloadsEtl' as const

export type NpmDownloadsEtlChildAliases = {
  gcpProvider?: string
  bigqueryApi?: string
  schedulerApi?: string
  dataset?: string
  table?: string
  readerViewer?: string
  loader?: string
  loaderDeployerActas?: string
  loaderJobUser?: string
  loaderDataEditor?: string
  etl?: HttpFunctionEtlChildAliases
}

export type NpmDownloadsEtlArgs = {
  gcpProjectId: pulumi.Input<string>
  location: pulumi.Input<string>
  region: pulumi.Input<string>
  datasetId?: pulumi.Input<string>
  tableId?: pulumi.Input<string>
  loaderAccountId: string
  gcpServiceAccountKeyB64: pulumi.Input<string>
  sourceArchive: pulumi.asset.Asset | pulumi.asset.Archive
  sourceBucketName: pulumi.Input<string>
  sourceObjectName?: pulumi.Input<string>
  analyticsReaderEmail?: pulumi.Input<string>
  functionName?: pulumi.Input<string>
  entryPoint?: pulumi.Input<string>
  schedulerJobName?: pulumi.Input<string>
  schedulerAccountId?: string
  deployerSaEmail?: pulumi.Input<string>
  downloadsPeriod?: pulumi.Input<string>
  /** Previous stack-root names when wrapping meta dwhapp into this component. */
  childAliases?: NpmDownloadsEtlChildAliases
}

/**
 * Resource-triggered (not app-type): npm downloads → BigQuery `product_npm`.
 * Pattern from meta `pulumi/dwhapp/npm-downloads-etl.ts`.
 */
export class NpmDownloadsEtl extends pulumi.ComponentResource {
  public readonly dataset: gcp.bigquery.Dataset
  public readonly table: gcp.bigquery.Table
  public readonly loaderSa: gcp.serviceaccount.Account
  public readonly functionUrl: pulumi.Output<string>
  public readonly datasetId: pulumi.Output<string>
  public readonly tableId: pulumi.Output<string>
  public readonly loaderSaEmail: pulumi.Output<string>
  public readonly scheduleJobName: pulumi.Output<string>

  constructor(name: string, args: NpmDownloadsEtlArgs, opts?: pulumi.ComponentResourceOptions) {
    super(NPM_DOWNLOADS_ETL_TYPE, name, args, opts)

    const aliases = args.childAliases ?? {}
    const datasetId = args.datasetId ?? 'product_npm'
    const tableId = args.tableId ?? 'package_downloads_daily'
    const functionName = args.functionName ?? 'npm-downloads-etl'
    const entryPoint = args.entryPoint ?? 'loadNpmDownloads'
    const schedulerJobName = args.schedulerJobName ?? 'npm-downloads-daily'
    const schedulerAccountId = args.schedulerAccountId ?? 'npm-dl-sched'
    const deployerSaEmail = args.deployerSaEmail ?? 'goproj@sargonpiraev.iam.gserviceaccount.com'
    const sourceObjectName = args.sourceObjectName ?? 'npm-downloads-etl-source.zip'
    const downloadsPeriod = args.downloadsPeriod ?? 'last-month'

    const credentials = pulumi
      .output(args.gcpServiceAccountKeyB64)
      .apply((b64) => Buffer.from(b64, 'base64').toString('utf-8'))

    const gcpProvider = new gcp.Provider(
      `${name}-gcp`,
      { project: args.gcpProjectId, credentials },
      childOpts(this, aliases.gcpProvider)
    )

    const bigqueryApi = new gcp.projects.Service(
      `${name}-bigquery-api`,
      {
        project: args.gcpProjectId,
        service: 'bigquery.googleapis.com',
        disableOnDestroy: false,
      },
      childOpts(this, aliases.bigqueryApi, { provider: gcpProvider })
    )

    const schedulerApi = new gcp.projects.Service(
      `${name}-scheduler-api`,
      {
        project: args.gcpProjectId,
        service: 'cloudscheduler.googleapis.com',
        disableOnDestroy: false,
      },
      childOpts(this, aliases.schedulerApi, { provider: gcpProvider })
    )

    this.dataset = new gcp.bigquery.Dataset(
      `${name}-dataset`,
      {
        project: args.gcpProjectId,
        datasetId,
        location: args.location,
        description: 'npm download stats for @sargonpiraev/* (product domain)',
        labels: { domain: 'product', source: 'npm' },
      },
      childOpts(this, aliases.dataset, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
      })
    )

    this.table = new gcp.bigquery.Table(
      `${name}-table`,
      {
        project: args.gcpProjectId,
        datasetId: this.dataset.datasetId,
        tableId,
        description: 'Daily npm download counts per package',
        timePartitioning: { type: 'DAY', field: 'date' },
        clusterings: ['package'],
        schema: JSON.stringify([
          { name: 'package', type: 'STRING', mode: 'REQUIRED' },
          { name: 'date', type: 'DATE', mode: 'REQUIRED' },
          { name: 'downloads', type: 'INTEGER', mode: 'REQUIRED' },
          { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
        ]),
        deletionProtection: false,
      },
      childOpts(this, aliases.table, {
        provider: gcpProvider,
        dependsOn: [this.dataset],
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
        childOpts(this, aliases.readerViewer, {
          provider: gcpProvider,
          dependsOn: [this.dataset],
        })
      )
    }

    this.loaderSa = new gcp.serviceaccount.Account(
      `${name}-loader`,
      {
        accountId: args.loaderAccountId,
        displayName: 'npm downloads → BigQuery loader',
        project: args.gcpProjectId,
      },
      childOpts(this, aliases.loader, { provider: gcpProvider })
    )

    new gcp.serviceaccount.IAMMember(
      `${name}-loader-deployer-actas`,
      {
        serviceAccountId: this.loaderSa.name,
        role: 'roles/iam.serviceAccountUser',
        member: pulumi.interpolate`serviceAccount:${deployerSaEmail}`,
      },
      childOpts(this, aliases.loaderDeployerActas, {
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
      childOpts(this, aliases.loaderJobUser, {
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
      childOpts(this, aliases.loaderDataEditor, {
        provider: gcpProvider,
        dependsOn: [this.dataset],
      })
    )

    const environmentVariables = pulumi
      .all([args.gcpProjectId, datasetId, tableId, args.location, downloadsPeriod])
      .apply(([projectId, ds, table, location, period]) => ({
        GCP_PROJECT: projectId,
        BQ_DATASET: ds,
        BQ_TABLE: table,
        BQ_LOCATION: location,
        NPM_DOWNLOADS_PERIOD: period,
      }))

    const etl = createHttpFunctionEtl({
      name: `${name}-etl`,
      projectId: args.gcpProjectId,
      location: args.location,
      region: args.region,
      provider: gcpProvider,
      parent: this,
      functionName,
      description: 'Fetch npm daily download stats into BigQuery product_npm',
      entryPoint,
      serviceAccountEmail: this.loaderSa.email,
      environmentVariables,
      sourceArchive: args.sourceArchive,
      sourceObjectName,
      sourceBucketName: args.sourceBucketName,
      schedulerJobName,
      schedulerAccountId,
      schedulerDescription: 'Daily npm downloads ETL',
      deployerSaEmail,
      schedulerApi,
      dependsOn: [this.table, this.loaderSa],
      childAliases: aliases.etl,
    })

    this.functionUrl = etl.functionUrl
    this.datasetId = this.dataset.datasetId
    this.tableId = this.table.tableId
    this.loaderSaEmail = this.loaderSa.email
    this.scheduleJobName = etl.scheduleJob.name

    this.registerOutputs({
      datasetId: this.datasetId,
      tableId: this.tableId,
      functionUrl: this.functionUrl,
      loaderSaEmail: this.loaderSaEmail,
      scheduleJobName: this.scheduleJobName,
    })
  }
}
