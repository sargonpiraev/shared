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
import { createGa4BigQueryLink } from './ga4.BigQueryLink.js'
import { createGa4Property } from './ga4.Property.js'
import { importAnalyticsDataset } from './gcp.bigquery.Dataset__analytics_$propertyId.js'
import { createSearchconsoleDataset } from './gcp.bigquery.Dataset__searchconsole_$project.js'
import { createGa4ReportPerfByPageTypeView } from './gcp.bigquery.Table__analytics_$propertyId__report_perf_by_page_type.js'
import { createGa4SessionsView } from './gcp.bigquery.Table__analytics_$propertyId__sessions.js'
import { createGscExportLogTable } from './gcp.bigquery.Table__searchconsole_$project__ExportLog.js'
import { createGscReportPerfByPageTypeView } from './gcp.bigquery.Table__searchconsole_$project__report_perf_by_page_type.js'
import { createGscSiteImpressionTable } from './gcp.bigquery.Table__searchconsole_$project__searchdata_site_impression.js'
import { createGscUrlImpressionTable } from './gcp.bigquery.Table__searchconsole_$project__searchdata_url_impression.js'
import { createGscProperty } from './gsc.Property.js'
import {
  ga4ExportDatasetId,
  requirePageTypes,
  requirePlainString,
  requireProductId,
  type PageType,
} from './page-types.js'
import type { WebappChildAliases, WebappVercelArgs } from './types.js'
import { createVercelProject } from './vercel.Project.js'

export { repoHasWebapp }
export type { PageType, WebappChildAliases, WebappVercelArgs }

const WEBAPP_TYPE_LEGACY = 'sargonpiraev:webapp-analytics:WebappAnalytics' as const
const WEBAPP_NAME_LEGACY = 'webapp-analytics' as const

export const WEBAPP_TYPE = 'sargonpiraev:apps:Webapp' as const

export type WebappArgs = {
  gcpProjectId?: pulumi.Input<string>
  datasetId: pulumi.Input<string>
  location: pulumi.Input<string>
  gscSiteUrl: pulumi.Input<string>
  gscServiceAccountKeyB64: pulumi.Input<string>
  gcpServiceAccountKeyB64: pulumi.Input<string>
  datasetDescription?: pulumi.Input<string>
  datasetLabels?: pulumi.Input<{ [key: string]: string }>
  adoptExisting?: boolean
  datasetImportId?: string
  childAliases?: WebappChildAliases
  ga4AccountId?: pulumi.Input<string>
  ga4DisplayName?: pulumi.Input<string>
  ga4TimeZone?: pulumi.Input<string>
  ga4CurrencyCode?: pulumi.Input<string>
  ga4MeasurementId?: pulumi.Input<string>
  ga4ImportExisting?: boolean
  ga4PropertyId?: pulumi.Input<string>
  ga4ServiceAccountKeyB64?: pulumi.Input<string>
  ga4LinkBigQuery?: boolean
  ga4ImportBigQueryLink?: boolean
  vercel: WebappVercelArgs
  productId: string
  pageTypes: PageType[]
  /** Import Google-owned GSC export tables. False until bulk export has created them. */
  importGscExportTables?: boolean
  /** Import `analytics_{propertyId}` (GA4 export). False until the first daily export. */
  importAnalyticsDataset?: boolean
}

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
  public readonly gscPageTypeView: gcp.bigquery.Table
  public readonly ga4PageTypeView?: gcp.bigquery.Table
  public readonly ga4SessionsView?: gcp.bigquery.Table
  public readonly analyticsDataset?: gcp.bigquery.Dataset

  constructor(name: string, args: WebappArgs, opts?: pulumi.ComponentResourceOptions) {
    requireProductId(args.productId)
    const pageTypes = requirePageTypes(args.pageTypes)

    super(
      WEBAPP_TYPE,
      name,
      args,
      pulumi.mergeOptions(opts, {
        aliases: [{ type: WEBAPP_TYPE_LEGACY }, { name: WEBAPP_NAME_LEGACY }],
      })
    )

    const adopt = args.adoptExisting === true
    const aliases = args.childAliases ?? {}

    const vercel = createVercelProject(this, name, aliases, args.vercel)
    this.vercelProject = vercel.project
    this.vercelProjectId = this.vercelProject.id

    const datasetId = requirePlainString(args.datasetId, 'datasetId')
    const gcpProjectIdStr =
      args.gcpProjectId === undefined
        ? undefined
        : requirePlainString(args.gcpProjectId, 'gcpProjectId')
    const gcpProjectId =
      gcpProjectIdStr ??
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

    const adoptImportId =
      args.datasetImportId ??
      (adopt && gcpProjectIdStr
        ? `projects/${gcpProjectIdStr}/datasets/${datasetId}`
        : undefined)
    if (adopt && !adoptImportId) {
      throw new Error('adoptExisting requires datasetImportId or a string gcpProjectId')
    }

    this.dataset = createSearchconsoleDataset(this, name, aliases, {
      gcpProjectId,
      datasetId,
      location: args.location,
      description: args.datasetDescription,
      labels: args.datasetLabels,
      provider: gcpProvider,
      adopt,
      datasetImportId: adoptImportId,
    })

    this.gscProperty = createGscProperty(this, name, aliases, {
      siteUrl: args.gscSiteUrl,
      serviceAccountKeyB64: args.gscServiceAccountKeyB64,
      importExisting: adopt,
    })

    this.gscSiteUrl = pulumi.output(args.gscSiteUrl)
    this.datasetId = this.dataset.datasetId
    this.datasetLocation = this.dataset.location

    const importGscExport = args.importGscExportTables !== false
    const importAnalytics = args.importAnalyticsDataset !== false

    if (importGscExport && !gcpProjectIdStr) {
      throw new Error('importGscExportTables requires a string gcpProjectId')
    }

    const gscExportTables = importGscExport
      ? [
          createGscExportLogTable(this, {
            gcpProjectId: gcpProjectIdStr!,
            datasetId,
            provider: gcpProvider,
            dependsOn: [this.dataset],
          }),
          createGscSiteImpressionTable(this, {
            gcpProjectId: gcpProjectIdStr!,
            datasetId,
            provider: gcpProvider,
            dependsOn: [this.dataset],
          }),
          createGscUrlImpressionTable(this, {
            gcpProjectId: gcpProjectIdStr!,
            datasetId,
            provider: gcpProvider,
            dependsOn: [this.dataset],
          }),
        ]
      : []

    this.gscPageTypeView = createGscReportPerfByPageTypeView(this, {
      gcpProjectId,
      datasetId: this.dataset.datasetId,
      pageTypes,
      stub: !importGscExport,
      provider: gcpProvider,
      dependsOn: [this.dataset, ...gscExportTables],
    })

    const ga4Key = args.ga4ServiceAccountKeyB64 ?? args.gscServiceAccountKeyB64
    const linkBigQuery = args.ga4LinkBigQuery !== false
    const importBqLink = args.ga4ImportBigQueryLink === true
    const importGa4 = args.ga4ImportExisting === true
    const ga4DisplayName =
      args.ga4DisplayName ?? pulumi.output(args.gscSiteUrl).apply(gscNameFromSiteUrl)
    const ga4DefaultUri = pulumi.output(args.gscSiteUrl).apply(siteUrlToDefaultUri)

    this.ga4Property = createGa4Property(
      this,
      name,
      aliases,
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
      adopt && importGa4 ? { protect: true } : {}
    )
    this.ga4PropertyId = this.ga4Property.id
    this.ga4MeasurementId = pulumi
      .all([this.ga4Property.measurementId, args.ga4MeasurementId ?? ''])
      .apply(([resolved, hint]) => resolved || hint || '')

    if (linkBigQuery) {
      this.ga4BigQueryLink = createGa4BigQueryLink(
        this,
        name,
        aliases,
        {
          propertyId:
            typeof args.ga4PropertyId === 'string' ? args.ga4PropertyId : this.ga4Property.id,
          gcpProjectId: gcpProjectIdStr ?? gcpProjectId,
          datasetLocation: args.location,
          serviceAccountKeyB64: ga4Key,
          importExisting: importBqLink,
          dailyExportEnabled: true,
        },
        {
          dependsOn: [this.ga4Property],
          retainOnDelete: true,
        }
      )
    }

    const analyticsDatasetId = this.ga4Property.id.apply(ga4ExportDatasetId)
    if (importAnalytics) {
      if (!gcpProjectIdStr) {
        throw new Error('importAnalyticsDataset requires a string gcpProjectId')
      }
      if (typeof args.ga4PropertyId !== 'string') {
        throw new Error('importAnalyticsDataset requires a string ga4PropertyId')
      }
      const analyticsId = ga4ExportDatasetId(args.ga4PropertyId)
      this.analyticsDataset = importAnalyticsDataset(this, {
        gcpProjectId: gcpProjectIdStr,
        datasetId: analyticsId,
        location: args.location,
        provider: gcpProvider,
        dependsOn: this.ga4BigQueryLink
          ? [this.ga4BigQueryLink]
          : [this.ga4Property],
      })

      this.ga4PageTypeView = createGa4ReportPerfByPageTypeView(this, {
        gcpProjectId,
        datasetId: analyticsId,
        pageTypes,
        stub: false,
        provider: gcpProvider,
        dependsOn: [this.analyticsDataset],
      })

      this.ga4SessionsView = createGa4SessionsView(this, {
        gcpProjectId,
        datasetId: analyticsId,
        provider: gcpProvider,
        dependsOn: [this.analyticsDataset],
      })
    }

    this.registerOutputs({
      gscSiteUrl: this.gscSiteUrl,
      datasetId: this.datasetId,
      datasetLocation: this.datasetLocation,
      ga4MeasurementId: this.ga4MeasurementId,
      ga4PropertyId: this.ga4PropertyId,
      vercelProjectId: this.vercelProjectId,
      gscPageTypeViewId: this.gscPageTypeView.tableId,
      ga4PageTypeViewId: this.ga4PageTypeView?.tableId,
      ga4SessionsViewId: this.ga4SessionsView?.tableId,
    })
  }
}

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
