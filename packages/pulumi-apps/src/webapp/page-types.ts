export type PageType = {
  id: string
  /** RE2 pattern matched with `REGEXP_CONTAINS` against the full URL. */
  path: string
}

const PAGE_TYPE_ID = /^[a-z][a-z0-9_]{0,63}$/

export function requirePlainString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${name} must be a plain string`)
  }
  return value
}

export function requireProductId(productId: string): string {
  const id = productId.trim().toLowerCase()
  if (!/^[a-z][a-z0-9-]{1,20}$/.test(id)) {
    throw new Error(`productId must be a short slug, got ${JSON.stringify(productId)}`)
  }
  return id
}

export function requirePageTypes(pageTypes: PageType[]): PageType[] {
  if (pageTypes.length === 0) {
    throw new Error('pageTypes must not be empty')
  }
  const ids = new Set<string>()
  for (const pageType of pageTypes) {
    if (!PAGE_TYPE_ID.test(pageType.id)) {
      throw new Error(`pageTypes.id must be a snake slug, got ${JSON.stringify(pageType.id)}`)
    }
    if (!pageType.path.trim()) {
      throw new Error(`pageTypes.path is empty for ${pageType.id}`)
    }
    if (pageType.path.includes("'")) {
      throw new Error(`pageTypes.path must not contain a single quote (${pageType.id})`)
    }
    if (ids.has(pageType.id)) {
      throw new Error(`duplicate pageTypes.id ${pageType.id}`)
    }
    ids.add(pageType.id)
  }
  return pageTypes
}

/** `analytics_{propertyId}` — vendor GA4 export dataset id. */
export function ga4ExportDatasetId(propertyId: string): string {
  const id = propertyId.startsWith('properties/')
    ? propertyId.slice('properties/'.length)
    : propertyId
  return `analytics_${id}`
}

export function pageTypeCaseSql(urlExpr: string, pageTypes: PageType[]): string {
  const whens = pageTypes.map(
    (pageType) => `    WHEN REGEXP_CONTAINS(${urlExpr}, r'${pageType.path}') THEN '${pageType.id}'`
  )
  return `CASE\n${whens.join('\n')}\n    ELSE 'other'\n  END`
}

export function reportPerfByPageTypeGscSql(args: {
  projectId: string
  datasetId: string
  pageTypes: PageType[]
}): string {
  const pageType = pageTypeCaseSql('url', args.pageTypes)
  return `SELECT
  data_date,
  ${pageType} AS page_type,
  SUM(clicks) AS clicks,
  SUM(impressions) AS impressions,
  SAFE_DIVIDE(SUM(clicks), SUM(impressions)) AS ctr
FROM \`${args.projectId}.${args.datasetId}.searchdata_url_impression\`
GROUP BY 1, 2`
}

export const STUB_GSC_REPORT_PERF_SQL = `SELECT
  CAST(NULL AS DATE) AS data_date,
  CAST(NULL AS STRING) AS page_type,
  CAST(NULL AS INT64) AS clicks,
  CAST(NULL AS INT64) AS impressions,
  CAST(NULL AS FLOAT64) AS ctr
FROM UNNEST([1])
WHERE FALSE`

export const STUB_GA4_REPORT_PERF_SQL = `SELECT
  CAST(NULL AS DATE) AS data_date,
  CAST(NULL AS STRING) AS page_type,
  CAST(NULL AS INT64) AS pageviews
FROM UNNEST([1])
WHERE FALSE`

export function reportPerfByPageTypeGa4Sql(args: {
  projectId: string
  datasetId: string
  pageTypes: PageType[]
}): string {
  const pageLocation = `(SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location')`
  const pageType = pageTypeCaseSql(pageLocation, args.pageTypes)
  return `SELECT
  PARSE_DATE('%Y%m%d', event_date) AS data_date,
  ${pageType} AS page_type,
  COUNT(*) AS pageviews
FROM \`${args.projectId}.${args.datasetId}.events_*\`
WHERE event_name = 'page_view'
GROUP BY 1, 2`
}

/** Build full-URL RE2 patterns from origin + pathname regex (no ^/$). */
export function pageTypesFromOrigin(args: {
  origin: string
  localePrefix?: 'always' | 'optional' | 'none'
  paths: { id: string; pathname: string }[]
}): PageType[] {
  const escaped = args.origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const locale =
    args.localePrefix === 'always'
      ? '/[a-z]{2}'
      : args.localePrefix === 'optional'
        ? '(?:/[a-z]{2})?'
        : ''
  return args.paths.map((path) => ({
    id: path.id,
    path: `^${escaped}${locale}${path.pathname}$`,
  }))
}
