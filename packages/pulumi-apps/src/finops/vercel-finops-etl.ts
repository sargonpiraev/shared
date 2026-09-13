import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from '../internal/child-opts.js'
import {
  createHttpFunctionEtl,
  type HttpFunctionEtlChildAliases,
} from '../internal/http-function-etl.js'

/** URN type token — governance `test:pulumi` asserts this ComponentResource is registered. */
export const VERCEL_FINOPS_ETL_TYPE = 'sargonpiraev:apps:VercelFinopsEtl' as const

export type VercelFinopsEtlChildAliases = {
  gcpProvider?: string
  bigqueryApi?: string
  schedulerApi?: string
  secretManagerApi?: string
  chargesTable?: string
  domainsTable?: string
  loader?: string
  loaderDeployerActas?: string
  loaderJobUser?: string
  loaderDataEditor?: string
  vercelToken?: string
  vercelTokenAccessor?: string
  etl?: HttpFunctionEtlChildAliases
}

export type VercelFinopsEtlArgs = {
  gcpProjectId: pulumi.Input<string>
  location: pulumi.Input<string>
  region: pulumi.Input<string>
  /** Existing dataset id for tables + CF (provider dataset, e.g. `vercel`). */
  datasetId: pulumi.Input<string>
  vercelTeamId: pulumi.Input<string>
  /** Secret Manager secret id holding VERCEL_API_TOKEN. */
  vercelApiTokenSecretId: string
  loaderAccountId: string
  gcpServiceAccountKeyB64: pulumi.Input<string>
  sourceArchive: pulumi.asset.Asset | pulumi.asset.Archive
  sourceBucketName: pulumi.Input<string>
  sourceObjectName?: pulumi.Input<string>
  createSecret?: boolean
  functionName?: pulumi.Input<string>
  entryPoint?: pulumi.Input<string>
  schedulerJobName?: pulumi.Input<string>
  schedulerAccountId?: string
  deployerSaEmail?: pulumi.Input<string>
  lookbackDays?: pulumi.Input<string>
  /** Previous stack-root names when wrapping meta dwhapp into this component. */
  childAliases?: VercelFinopsEtlChildAliases
}

/**
 * Resource-triggered: Vercel FOCUS billing → BigQuery `vercel`.
 * Pattern from meta `pulumi/dwhapp/vercel-billing-etl.ts`.
 * Expects an existing provider dataset (meta warehouse `vercel`).
 */
export class VercelFinopsEtl extends pulumi.ComponentResource {
  public readonly chargesTable: gcp.bigquery.Table
  public readonly domainsTable: gcp.bigquery.Table
  public readonly loaderSa: gcp.serviceaccount.Account
  public readonly functionUrl: pulumi.Output<string>
  public readonly chargesTableId: pulumi.Output<string>
  public readonly domainsTableId: pulumi.Output<string>
  public readonly loaderSaEmail: pulumi.Output<string>
  public readonly scheduleJobName: pulumi.Output<string>

  constructor(name: string, args: VercelFinopsEtlArgs, opts?: pulumi.ComponentResourceOptions) {
    super(VERCEL_FINOPS_ETL_TYPE, name, args, opts)

    const aliases = args.childAliases ?? {}
    const chargesTableId = 'vercel_charges_daily'
    const domainsTableId = 'vercel_domains_daily'
    const functionName = args.functionName ?? 'vercel-billing-etl'
    const entryPoint = args.entryPoint ?? 'loadVercelBillingHttp'
    const schedulerJobName = args.schedulerJobName ?? 'vercel-billing-daily'
    const schedulerAccountId = args.schedulerAccountId ?? 'vercel-bill-sched'
    const deployerSaEmail = args.deployerSaEmail ?? 'goproj@sargonpiraev.iam.gserviceaccount.com'
    const sourceObjectName = args.sourceObjectName ?? 'vercel-billing-etl-source.zip'
    const lookbackDays = args.lookbackDays ?? '31'

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

    const secretManagerApi = new gcp.projects.Service(
      `${name}-secretmanager-api`,
      {
        project: args.gcpProjectId,
        service: 'secretmanager.googleapis.com',
        disableOnDestroy: false,
      },
      childOpts(this, aliases.secretManagerApi, { provider: gcpProvider })
    )

    this.chargesTable = new gcp.bigquery.Table(
      `${name}-charges`,
      {
        project: args.gcpProjectId,
        datasetId: args.datasetId,
        tableId: chargesTableId,
        description: 'Vercel FOCUS v1.3 billing charges (day grain, America/Los_Angeles)',
        timePartitioning: { type: 'DAY', field: 'date' },
        clusterings: ['project_name', 'service_name', 'charge_category'],
        schema: JSON.stringify([
          { name: 'date', type: 'DATE', mode: 'REQUIRED' },
          { name: 'charge_period_start', type: 'TIMESTAMP', mode: 'REQUIRED' },
          { name: 'charge_period_end', type: 'TIMESTAMP', mode: 'REQUIRED' },
          { name: 'charge_category', type: 'STRING', mode: 'REQUIRED' },
          { name: 'service_name', type: 'STRING', mode: 'REQUIRED' },
          { name: 'service_category', type: 'STRING', mode: 'NULLABLE' },
          { name: 'service_provider_name', type: 'STRING', mode: 'NULLABLE' },
          { name: 'billed_cost', type: 'FLOAT', mode: 'REQUIRED' },
          { name: 'effective_cost', type: 'FLOAT', mode: 'REQUIRED' },
          { name: 'billing_currency', type: 'STRING', mode: 'REQUIRED' },
          { name: 'consumed_quantity', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'consumed_unit', type: 'STRING', mode: 'NULLABLE' },
          { name: 'pricing_category', type: 'STRING', mode: 'NULLABLE' },
          { name: 'pricing_currency', type: 'STRING', mode: 'NULLABLE' },
          { name: 'pricing_quantity', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'pricing_unit', type: 'STRING', mode: 'NULLABLE' },
          { name: 'region_id', type: 'STRING', mode: 'NULLABLE' },
          { name: 'region_name', type: 'STRING', mode: 'NULLABLE' },
          { name: 'project_id', type: 'STRING', mode: 'NULLABLE' },
          { name: 'project_name', type: 'STRING', mode: 'NULLABLE' },
          { name: 'tags_json', type: 'STRING', mode: 'NULLABLE' },
          { name: 'team_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
        ]),
        deletionProtection: false,
      },
      childOpts(this, aliases.chargesTable, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
        retainOnDelete: true,
      })
    )

    this.domainsTable = new gcp.bigquery.Table(
      `${name}-domains`,
      {
        project: args.gcpProjectId,
        datasetId: args.datasetId,
        tableId: domainsTableId,
        description:
          'Vercel domain inventory + registrar renewal quotes (not historical billed domain fees)',
        timePartitioning: { type: 'DAY', field: 'snapshot_date' },
        clusterings: ['domain', 'service_type'],
        schema: JSON.stringify([
          { name: 'snapshot_date', type: 'DATE', mode: 'REQUIRED' },
          { name: 'domain', type: 'STRING', mode: 'REQUIRED' },
          { name: 'service_type', type: 'STRING', mode: 'NULLABLE' },
          { name: 'bought_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
          { name: 'expires_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
          { name: 'renew', type: 'BOOLEAN', mode: 'NULLABLE' },
          { name: 'verified', type: 'BOOLEAN', mode: 'NULLABLE' },
          { name: 'renewal_price_usd', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'purchase_price_usd', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'team_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
        ]),
        deletionProtection: false,
      },
      childOpts(this, aliases.domainsTable, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
        retainOnDelete: true,
      })
    )

    this.loaderSa = new gcp.serviceaccount.Account(
      `${name}-loader`,
      {
        accountId: args.loaderAccountId,
        displayName: 'Vercel billing → BigQuery loader',
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
        datasetId: args.datasetId,
        role: 'roles/bigquery.dataEditor',
        member: pulumi.interpolate`serviceAccount:${this.loaderSa.email}`,
      },
      childOpts(this, aliases.loaderDataEditor, { provider: gcpProvider })
    )

    if (args.createSecret === true) {
      const secret = new gcp.secretmanager.Secret(
        `${name}-vercel-token`,
        {
          secretId: args.vercelApiTokenSecretId,
          project: args.gcpProjectId,
          replication: { auto: {} },
          labels: { domain: 'finops', source: 'vercel' },
        },
        childOpts(this, aliases.vercelToken, {
          provider: gcpProvider,
          dependsOn: [secretManagerApi],
        })
      )
      new gcp.secretmanager.SecretIamMember(
        `${name}-vercel-token-accessor`,
        {
          project: args.gcpProjectId,
          secretId: secret.secretId,
          role: 'roles/secretmanager.secretAccessor',
          member: pulumi.interpolate`serviceAccount:${this.loaderSa.email}`,
        },
        childOpts(this, aliases.vercelTokenAccessor, {
          provider: gcpProvider,
          dependsOn: [secret, this.loaderSa],
        })
      )
    } else {
      new gcp.secretmanager.SecretIamMember(
        `${name}-vercel-token-accessor`,
        {
          project: args.gcpProjectId,
          secretId: args.vercelApiTokenSecretId,
          role: 'roles/secretmanager.secretAccessor',
          member: pulumi.interpolate`serviceAccount:${this.loaderSa.email}`,
        },
        childOpts(this, aliases.vercelTokenAccessor, {
          provider: gcpProvider,
          dependsOn: [secretManagerApi, this.loaderSa],
        })
      )
    }

    const environmentVariables = pulumi
      .all([args.gcpProjectId, args.datasetId, args.location, args.vercelTeamId, lookbackDays])
      .apply(([projectId, dataset, location, teamId, lookback]) => ({
        GCP_PROJECT: projectId,
        BQ_DATASET: dataset,
        BQ_TABLE_CHARGES: chargesTableId,
        BQ_TABLE_DOMAINS: domainsTableId,
        BQ_LOCATION: location,
        VERCEL_TEAM_ID: teamId,
        VERCEL_BILLING_LOOKBACK_DAYS: lookback,
      }))

    const secretEnvironmentVariables = pulumi.output(args.gcpProjectId).apply((projectId) => [
      {
        key: 'VERCEL_API_TOKEN',
        projectId,
        secret: args.vercelApiTokenSecretId,
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
      description: 'Fetch Vercel FOCUS billing charges into BigQuery vercel',
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
      schedulerDescription: 'Daily Vercel billing ETL',
      attemptDeadline: '600s',
      deployerSaEmail,
      schedulerApi,
      dependsOn: [this.chargesTable, this.domainsTable, this.loaderSa],
      ignoreSecretEnvDiff: true,
      childAliases: aliases.etl,
    })

    this.functionUrl = etl.functionUrl
    this.chargesTableId = this.chargesTable.tableId
    this.domainsTableId = this.domainsTable.tableId
    this.loaderSaEmail = this.loaderSa.email
    this.scheduleJobName = etl.scheduleJob.name

    this.registerOutputs({
      functionUrl: this.functionUrl,
      scheduleJobName: this.scheduleJobName,
      chargesTableId: this.chargesTableId,
      domainsTableId: this.domainsTableId,
      loaderSaEmail: this.loaderSaEmail,
    })
  }
}
