import fs from 'node:fs'
import path from 'node:path'
import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { GscProperty } from '@sargonpiraev/pulumi-gsc'

/** URN type token — governance `test:pulumi` asserts this ComponentResource is registered. */
export const WEBAPP_ANALYTICS_TYPE = 'sargonpiraev:webapp-analytics:WebappAnalytics' as const

/** True when the repo has a public web contour (`apps/webapp`). */
export function repoHasWebapp(repoRoot: string): boolean {
  return fs.existsSync(path.join(repoRoot, 'apps', 'webapp'))
}

export type WebappAnalyticsChildAliases = {
  gcpProvider?: string
  bigqueryApi?: string
  bigqueryStorageApi?: string
  gscExportJobUser?: string
  gscExportDataEditor?: string
  dataset?: string
  gscProperty?: string
}

export type WebappAnalyticsArgs = {
  /** GCP project that hosts warehouse datasets (portfolio SSOT: sargonpiraev). */
  gcpProjectId: pulumi.Input<string>
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
  childAliases?: WebappAnalyticsChildAliases
  /**
   * Optional GA4 measurement / property ids for future linking.
   * No first-class GA4→BQ resource exists in `@pulumi/gcp` yet — values are registered as outputs only.
   */
  ga4MeasurementId?: pulumi.Input<string>
  ga4PropertyId?: pulumi.Input<string>
}

function childOpts(
  parent: pulumi.Resource,
  previousName: string | undefined,
  extra?: pulumi.ResourceOptions
): pulumi.ResourceOptions {
  const aliases = previousName
    ? [{ name: previousName, parent: pulumi.rootStackResource }]
    : undefined
  return {
    parent,
    ...(aliases ? { aliases } : {}),
    ...extra,
  }
}

/**
 * Product analytics for `apps/webapp` / public `docapp`:
 * GSC property + BigQuery bulk-export dataset + IAM for Google's Search Console export SA.
 *
 * GA4→BQ native link is not declared until a Pulumi provider resource exists; optional
 * measurement/property ids are exposed as outputs for documentation / later wiring.
 */
export class WebappAnalytics extends pulumi.ComponentResource {
  public readonly gscProperty: GscProperty
  public readonly dataset: gcp.bigquery.Dataset
  public readonly gscSiteUrl: pulumi.Output<string>
  public readonly datasetId: pulumi.Output<string>
  public readonly datasetLocation: pulumi.Output<string | undefined>
  public readonly ga4MeasurementId?: pulumi.Output<string>
  public readonly ga4PropertyId?: pulumi.Output<string>

  constructor(name: string, args: WebappAnalyticsArgs, opts?: pulumi.ComponentResourceOptions) {
    super(WEBAPP_ANALYTICS_TYPE, name, args, opts)

    const adopt = args.adoptExisting === true
    const aliases = args.childAliases ?? {}

    const credentials = pulumi
      .output(args.gcpServiceAccountKeyB64)
      .apply((b64) => Buffer.from(b64, 'base64').toString('utf-8'))

    const gcpProvider = new gcp.Provider(
      `${name}-gcp`,
      {
        project: args.gcpProjectId,
        credentials,
      },
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

    const bigqueryStorageApi = new gcp.projects.Service(
      `${name}-bigquerystorage-api`,
      {
        project: args.gcpProjectId,
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
        project: args.gcpProjectId,
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
        project: args.gcpProjectId,
        role: 'roles/bigquery.dataEditor',
        member: gscExportPrincipal,
      },
      childOpts(this, aliases.gscExportDataEditor, {
        provider: gcpProvider,
        dependsOn: [bigqueryApi],
        ...(adopt ? { protect: true } : {}),
      })
    )

    this.dataset = new gcp.bigquery.Dataset(
      `${name}-dataset`,
      {
        project: args.gcpProjectId,
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
              ...(args.datasetImportId ? { import: args.datasetImportId } : {}),
              // GSC / console may manage dataset ACLs independently of Pulumi.
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
    if (args.ga4MeasurementId !== undefined) {
      this.ga4MeasurementId = pulumi.output(args.ga4MeasurementId)
    }
    if (args.ga4PropertyId !== undefined) {
      this.ga4PropertyId = pulumi.output(args.ga4PropertyId)
    }

    this.registerOutputs({
      gscSiteUrl: this.gscSiteUrl,
      datasetId: this.datasetId,
      datasetLocation: this.datasetLocation,
      ga4MeasurementId: this.ga4MeasurementId,
      ga4PropertyId: this.ga4PropertyId,
    })
  }
}
