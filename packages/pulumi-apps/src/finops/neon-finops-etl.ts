import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from '../internal/child-opts.js'
import {
  createHttpFunctionEtl,
  type HttpFunctionEtlChildAliases,
} from '../internal/http-function-etl.js'

/** URN type token — governance `test:pulumi` asserts this ComponentResource is registered. */
export const NEON_FINOPS_ETL_TYPE = 'sargonpiraev:apps:NeonFinopsEtl' as const

export type NeonFinopsEtlChildAliases = {
  gcpProvider?: string
  bigqueryApi?: string
  schedulerApi?: string
  secretManagerApi?: string
  usageTable?: string
  costTable?: string
  loader?: string
  loaderDeployerActas?: string
  loaderJobUser?: string
  loaderDataEditor?: string
  neonKey?: string
  neonKeyAccessor?: string
  etl?: HttpFunctionEtlChildAliases
}

export type NeonFinopsEtlArgs = {
  gcpProjectId: pulumi.Input<string>
  location: pulumi.Input<string>
  region: pulumi.Input<string>
  /** Existing dataset id for tables + CF (provider dataset, e.g. `neon`). */
  datasetId: pulumi.Input<string>
  neonOrgId: pulumi.Input<string>
  neonApiKeySecretId: string
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
  childAliases?: NeonFinopsEtlChildAliases
}

/**
 * Resource-triggered: Neon consumption → BigQuery `neon`.
 * Pattern from meta `pulumi/dwhapp/neon-finops-etl.ts`.
 */
export class NeonFinopsEtl extends pulumi.ComponentResource {
  public readonly usageTable: gcp.bigquery.Table
  public readonly costTable: gcp.bigquery.Table
  public readonly loaderSa: gcp.serviceaccount.Account
  public readonly functionUrl: pulumi.Output<string>
  public readonly usageTableId: pulumi.Output<string>
  public readonly costTableId: pulumi.Output<string>
  public readonly loaderSaEmail: pulumi.Output<string>
  public readonly scheduleJobName: pulumi.Output<string>

  constructor(name: string, args: NeonFinopsEtlArgs, opts?: pulumi.ComponentResourceOptions) {
    super(NEON_FINOPS_ETL_TYPE, name, args, opts)

    const aliases = args.childAliases ?? {}
    const functionName = args.functionName ?? 'neon-finops-etl'
    const entryPoint = args.entryPoint ?? 'loadNeonFinops'
    const schedulerJobName = args.schedulerJobName ?? 'neon-finops-daily'
    const schedulerAccountId = args.schedulerAccountId ?? 'neon-finops-sched'
    const deployerSaEmail = args.deployerSaEmail ?? 'goproj@sargonpiraev.iam.gserviceaccount.com'
    const sourceObjectName = args.sourceObjectName ?? 'neon-finops-etl-source.zip'
    const lookbackDays = args.lookbackDays ?? '30'

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

    this.usageTable = new gcp.bigquery.Table(
      `${name}-usage`,
      {
        project: args.gcpProjectId,
        datasetId: args.datasetId,
        tableId: 'neon_usage_daily',
        description:
          'Neon consumption_history/v2 daily metrics (raw + billing units + estimated USD)',
        timePartitioning: { type: 'DAY', field: 'usage_date' },
        clusterings: ['project_id', 'metric_name'],
        schema: JSON.stringify([
          { name: 'usage_date', type: 'DATE', mode: 'REQUIRED' },
          { name: 'org_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'project_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'project_name', type: 'STRING', mode: 'NULLABLE' },
          { name: 'period_id', type: 'STRING', mode: 'NULLABLE' },
          { name: 'period_plan', type: 'STRING', mode: 'NULLABLE' },
          { name: 'metric_name', type: 'STRING', mode: 'REQUIRED' },
          { name: 'metric_value_raw', type: 'FLOAT', mode: 'REQUIRED' },
          { name: 'billing_unit', type: 'STRING', mode: 'NULLABLE' },
          { name: 'billing_unit_value', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'estimated_cost_usd', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
        ]),
        deletionProtection: false,
      },
      childOpts(this, aliases.usageTable, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
        retainOnDelete: true,
      })
    )

    this.costTable = new gcp.bigquery.Table(
      `${name}-cost`,
      {
        project: args.gcpProjectId,
        datasetId: args.datasetId,
        tableId: 'neon_cost_daily',
        description:
          'Neon estimated daily cost by project (Launch/Scale rates + transfer/branch allowances)',
        timePartitioning: { type: 'DAY', field: 'usage_date' },
        clusterings: ['project_id'],
        schema: JSON.stringify([
          { name: 'usage_date', type: 'DATE', mode: 'REQUIRED' },
          { name: 'org_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'project_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'project_name', type: 'STRING', mode: 'NULLABLE' },
          { name: 'period_plan', type: 'STRING', mode: 'NULLABLE' },
          { name: 'compute_cost_usd', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'root_storage_cost_usd', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'child_storage_cost_usd', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'instant_restore_cost_usd', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'snapshot_cost_usd', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'public_transfer_cost_usd', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'private_transfer_cost_usd', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'extra_branches_cost_usd', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'estimated_cost_usd', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
        ]),
        deletionProtection: false,
      },
      childOpts(this, aliases.costTable, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
        retainOnDelete: true,
      })
    )

    this.loaderSa = new gcp.serviceaccount.Account(
      `${name}-loader`,
      {
        accountId: args.loaderAccountId,
        displayName: 'Neon → BigQuery finops loader',
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
        `${name}-neon-key`,
        {
          secretId: args.neonApiKeySecretId,
          project: args.gcpProjectId,
          replication: { auto: {} },
          labels: { domain: 'finops', source: 'neon' },
        },
        childOpts(this, aliases.neonKey, {
          provider: gcpProvider,
          dependsOn: [secretManagerApi],
        })
      )
      new gcp.secretmanager.SecretIamMember(
        `${name}-neon-key-accessor`,
        {
          project: args.gcpProjectId,
          secretId: secret.secretId,
          role: 'roles/secretmanager.secretAccessor',
          member: pulumi.interpolate`serviceAccount:${this.loaderSa.email}`,
        },
        childOpts(this, aliases.neonKeyAccessor, {
          provider: gcpProvider,
          dependsOn: [secret, this.loaderSa],
        })
      )
    } else {
      new gcp.secretmanager.SecretIamMember(
        `${name}-neon-key-accessor`,
        {
          project: args.gcpProjectId,
          secretId: args.neonApiKeySecretId,
          role: 'roles/secretmanager.secretAccessor',
          member: pulumi.interpolate`serviceAccount:${this.loaderSa.email}`,
        },
        childOpts(this, aliases.neonKeyAccessor, {
          provider: gcpProvider,
          dependsOn: [secretManagerApi, this.loaderSa],
        })
      )
    }

    const environmentVariables = pulumi
      .all([args.gcpProjectId, args.datasetId, args.location, args.neonOrgId, lookbackDays])
      .apply(([projectId, dataset, location, orgId, lookback]) => ({
        GOOGLE_CLOUD_PROJECT: projectId,
        GCP_BQ_DATASET_NEON: dataset,
        GCP_BQ_LOCATION: location,
        NEON_ORG_ID: orgId,
        NEON_LOOKBACK_DAYS: lookback,
      }))

    const secretEnvironmentVariables = pulumi.output(args.gcpProjectId).apply((projectId) => [
      {
        key: 'NEON_API_KEY',
        projectId,
        secret: args.neonApiKeySecretId,
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
      description: 'Pull Neon consumption/cost into BigQuery neon',
      entryPoint,
      availableMemoryMb: 512,
      timeoutSeconds: 300,
      serviceAccountEmail: this.loaderSa.email,
      environmentVariables,
      secretEnvironmentVariables,
      sourceArchive: args.sourceArchive,
      sourceObjectName,
      sourceBucketName: args.sourceBucketName,
      schedulerJobName,
      schedulerAccountId,
      schedulerDescription: 'Daily Neon finops ETL',
      deployerSaEmail,
      schedulerApi,
      dependsOn: [this.usageTable, this.costTable, this.loaderSa],
      ignoreSecretEnvDiff: true,
      childAliases: aliases.etl,
    })

    this.functionUrl = etl.functionUrl
    this.usageTableId = this.usageTable.tableId
    this.costTableId = this.costTable.tableId
    this.loaderSaEmail = this.loaderSa.email
    this.scheduleJobName = etl.scheduleJob.name

    this.registerOutputs({
      functionUrl: this.functionUrl,
      scheduleJobName: this.scheduleJobName,
      usageTableId: this.usageTableId,
      costTableId: this.costTableId,
      loaderSaEmail: this.loaderSaEmail,
    })
  }
}
