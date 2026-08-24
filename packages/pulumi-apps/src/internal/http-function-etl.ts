import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from './child-opts.js'

/** Previous stack-root names for Gen1 HTTP CF + Scheduler children. */
export type HttpFunctionEtlChildAliases = {
  cloudfunctionsApi?: string
  storageApi?: string
  scheduler?: string
  schedulerDeployerActas?: string
  sourceBucket?: string
  sourceZip?: string
  function?: string
  schedulerInvoker?: string
  schedule?: string
}

export type HttpFunctionEtlArgs = {
  /** Logical prefix for child resource names. */
  name: string
  projectId: pulumi.Input<string>
  location: pulumi.Input<string>
  region: pulumi.Input<string>
  provider: gcp.Provider
  parent: pulumi.Resource
  /** Cloud Function Gen1 name (globally unique per project/region). */
  functionName: pulumi.Input<string>
  description: pulumi.Input<string>
  entryPoint: pulumi.Input<string>
  runtime?: pulumi.Input<string>
  availableMemoryMb?: pulumi.Input<number>
  timeoutSeconds?: pulumi.Input<number>
  serviceAccountEmail: pulumi.Input<string>
  environmentVariables?: pulumi.Input<{ [key: string]: string }>
  secretEnvironmentVariables?: pulumi.Input<
    gcp.types.input.cloudfunctions.FunctionSecretEnvironmentVariable[]
  >
  /** Prebuilt deploy dir (FileArchive) or zip (FileAsset). */
  sourceArchive: pulumi.asset.Asset | pulumi.asset.Archive
  /** Object name inside the source bucket. */
  sourceObjectName: pulumi.Input<string>
  sourceBucketName: pulumi.Input<string>
  schedulerJobName: pulumi.Input<string>
  /** SA account id (6–30 chars, lowercase). */
  schedulerAccountId: string
  schedulerDescription: pulumi.Input<string>
  schedule?: pulumi.Input<string>
  timeZone?: pulumi.Input<string>
  attemptDeadline?: pulumi.Input<string>
  /** Deployer SA that must actAs runtime + scheduler SAs. */
  deployerSaEmail: pulumi.Input<string>
  schedulerApi: gcp.projects.Service
  dependsOn?: pulumi.Input<pulumi.Resource>[]
  ignoreSecretEnvDiff?: boolean
  childAliases?: HttpFunctionEtlChildAliases
}

export type HttpFunctionEtlResult = {
  fn: gcp.cloudfunctions.Function
  functionUrl: pulumi.Output<string>
  scheduleJob: gcp.cloudscheduler.Job
  schedulerSa: gcp.serviceaccount.Account
  sourceBucket: gcp.storage.Bucket
}

/**
 * Shared Gen1 HTTP Cloud Function + OIDC Cloud Scheduler pattern
 * (same shape as meta `pulumi/dwhapp/*-etl.ts`).
 */
export function createHttpFunctionEtl(args: HttpFunctionEtlArgs): HttpFunctionEtlResult {
  const runtime = args.runtime ?? 'nodejs20'
  const memory = args.availableMemoryMb ?? 256
  const timeout = args.timeoutSeconds ?? 120
  const schedule = args.schedule ?? '0 0 * * *'
  const timeZone = args.timeZone ?? 'Europe/Moscow'
  const attemptDeadline = args.attemptDeadline ?? '180s'
  const parent = args.parent
  const name = args.name
  const aliases = args.childAliases ?? {}

  const cloudfunctionsApi = new gcp.projects.Service(
    `${name}-cloudfunctions-api`,
    {
      project: args.projectId,
      service: 'cloudfunctions.googleapis.com',
      disableOnDestroy: false,
    },
    childOpts(parent, aliases.cloudfunctionsApi, { provider: args.provider })
  )

  const storageApi = new gcp.projects.Service(
    `${name}-storage-api`,
    {
      project: args.projectId,
      service: 'storage.googleapis.com',
      disableOnDestroy: false,
    },
    childOpts(parent, aliases.storageApi, { provider: args.provider })
  )

  const schedulerSa = new gcp.serviceaccount.Account(
    `${name}-scheduler`,
    {
      accountId: args.schedulerAccountId,
      displayName: pulumi.interpolate`${args.functionName} scheduler invoker`,
      project: args.projectId,
    },
    childOpts(parent, aliases.scheduler, { provider: args.provider })
  )

  new gcp.serviceaccount.IAMMember(
    `${name}-scheduler-deployer-actas`,
    {
      serviceAccountId: schedulerSa.name,
      role: 'roles/iam.serviceAccountUser',
      member: pulumi.interpolate`serviceAccount:${args.deployerSaEmail}`,
    },
    childOpts(parent, aliases.schedulerDeployerActas, {
      provider: args.provider,
      dependsOn: [schedulerSa],
    })
  )

  const sourceBucket = new gcp.storage.Bucket(
    `${name}-source`,
    {
      name: args.sourceBucketName,
      project: args.projectId,
      location: args.location,
      uniformBucketLevelAccess: true,
      forceDestroy: true,
      publicAccessPrevention: 'enforced',
    },
    childOpts(parent, aliases.sourceBucket, {
      provider: args.provider,
      dependsOn: [storageApi],
    })
  )

  const sourceObject = new gcp.storage.BucketObject(
    `${name}-source-zip`,
    {
      name: args.sourceObjectName,
      bucket: sourceBucket.name,
      source: args.sourceArchive,
    },
    childOpts(parent, aliases.sourceZip, {
      provider: args.provider,
      dependsOn: [sourceBucket],
    })
  )

  const fn = new gcp.cloudfunctions.Function(
    `${name}-fn`,
    {
      name: args.functionName,
      project: args.projectId,
      region: args.region,
      description: args.description,
      runtime,
      entryPoint: args.entryPoint,
      availableMemoryMb: memory,
      timeout,
      triggerHttp: true,
      httpsTriggerSecurityLevel: 'SECURE_ALWAYS',
      sourceArchiveBucket: sourceBucket.name,
      sourceArchiveObject: sourceObject.name,
      serviceAccountEmail: args.serviceAccountEmail,
      environmentVariables: args.environmentVariables,
      secretEnvironmentVariables: args.secretEnvironmentVariables,
    },
    childOpts(parent, aliases.function, {
      provider: args.provider,
      dependsOn: [cloudfunctionsApi, sourceObject, ...(args.dependsOn ?? [])],
      ...(args.ignoreSecretEnvDiff ? { ignoreChanges: ['secretEnvironmentVariables'] } : {}),
    })
  )

  new gcp.cloudfunctions.FunctionIamMember(
    `${name}-scheduler-invoker`,
    {
      project: fn.project,
      region: fn.region,
      cloudFunction: fn.name,
      role: 'roles/cloudfunctions.invoker',
      member: pulumi.interpolate`serviceAccount:${schedulerSa.email}`,
    },
    childOpts(parent, aliases.schedulerInvoker, {
      provider: args.provider,
      dependsOn: [fn, schedulerSa],
    })
  )

  const functionUrl = pulumi
    .all([fn.httpsTriggerUrl, args.region, args.projectId, args.functionName])
    .apply(([url, region, projectId, functionName]) => {
      if (url && url.length > 0) return url
      return `https://${region}-${projectId}.cloudfunctions.net/${functionName}`
    })

  const scheduleJob = new gcp.cloudscheduler.Job(
    `${name}-schedule`,
    {
      name: args.schedulerJobName,
      project: args.projectId,
      region: args.region,
      description: args.schedulerDescription,
      schedule,
      timeZone,
      attemptDeadline,
      httpTarget: {
        uri: functionUrl,
        httpMethod: 'POST',
        oidcToken: {
          serviceAccountEmail: schedulerSa.email,
          audience: functionUrl,
        },
      },
    },
    childOpts(parent, aliases.schedule, {
      provider: args.provider,
      dependsOn: [args.schedulerApi, fn, schedulerSa],
    })
  )

  return { fn, functionUrl, scheduleJob, schedulerSa, sourceBucket }
}
