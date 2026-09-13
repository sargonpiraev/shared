import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from '../internal/child-opts.js'
import type { PageType } from './page-types.js'
import { reportPerfByPageTypeGa4Sql, STUB_GA4_REPORT_PERF_SQL } from './page-types.js'

export const GA4_REPORT_PERF_BY_PAGE_TYPE_ID = 'report_perf_by_page_type'

export function createGa4ReportPerfByPageTypeView(
  parent: pulumi.Resource,
  args: {
    gcpProjectId: pulumi.Input<string>
    datasetId: pulumi.Input<string>
    pageTypes: PageType[]
    stub?: boolean
    provider: gcp.Provider
    dependsOn: pulumi.Resource[]
  }
): gcp.bigquery.Table {
  const query = args.stub
    ? pulumi.output(STUB_GA4_REPORT_PERF_SQL)
    : pulumi
        .all([args.gcpProjectId, args.datasetId])
        .apply(([project, datasetId]) =>
          reportPerfByPageTypeGa4Sql({
            projectId: project,
            datasetId,
            pageTypes: args.pageTypes,
          })
        )

  return new gcp.bigquery.Table(
    'analytics.report_perf_by_page_type',
    {
      project: args.gcpProjectId,
      datasetId: args.datasetId,
      tableId: GA4_REPORT_PERF_BY_PAGE_TYPE_ID,
      deletionProtection: false,
      description: 'GA4 page_view counts by page type (events_*).',
      view: {
        query,
        useLegacySql: false,
      },
    },
    childOpts(parent, undefined, {
      provider: args.provider,
      dependsOn: args.dependsOn,
    })
  )
}
