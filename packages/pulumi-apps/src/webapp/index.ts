export {
  WEBAPP_TYPE,
  Webapp,
  assertRepoHasWebapp,
  repoHasWebapp,
  type WebappArgs,
  type WebappChildAliases,
  type WebappVercelArgs,
  type PageType,
} from './webapp.js'

export {
  ga4ExportDatasetId,
  pageTypesFromOrigin,
  requirePageTypes,
  requireProductId,
} from './page-types.js'

export { GSC_REPORT_PERF_BY_PAGE_TYPE_ID } from './gcp.bigquery.Table__searchconsole_$project__report_perf_by_page_type.js'
export { GA4_REPORT_PERF_BY_PAGE_TYPE_ID } from './gcp.bigquery.Table__analytics_$propertyId__report_perf_by_page_type.js'
export { GA4_SESSIONS_VIEW_ID } from './gcp.bigquery.Table__analytics_$propertyId__sessions.js'

export { parseWebappEnv, webappEnvSchema, type WebappEnv } from './env.js'
