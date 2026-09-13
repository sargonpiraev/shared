import { describe, expect, it } from '@jest/globals'
import {
  ga4ExportDatasetId,
  pageTypeCaseSql,
  pageTypesFromOrigin,
  reportPerfByPageTypeGscSql,
  requirePageTypes,
  requireProductId,
} from './page-types.js'

describe('requirePageTypes', () => {
  it('rejects an empty list', () => {
    expect(() => requirePageTypes([])).toThrow('empty')
  })

  it('rejects duplicate ids', () => {
    expect(() =>
      requirePageTypes([
        { id: 'home', path: '^https://x/' },
        { id: 'home', path: '^https://x/a' },
      ])
    ).toThrow('duplicate')
  })
})

describe('pageTypesFromOrigin', () => {
  it('builds locale-always RE2 paths', () => {
    const types = requirePageTypes(
      pageTypesFromOrigin({
        origin: 'https://anidex.tv',
        localePrefix: 'always',
        paths: [{ id: 'anime_detail', pathname: '/anime/[^/?#]+/?' }],
      })
    )
    expect(types[0]?.path).toBe('^https://anidex\\.tv/[a-z]{2}/anime/[^/?#]+/?$')
  })
})

describe('report SQL', () => {
  it('groups GSC url impressions by page_type', () => {
    const sql = reportPerfByPageTypeGscSql({
      projectId: 'sargonpiraev',
      datasetId: 'searchconsole_anidex',
      pageTypes: [{ id: 'home', path: '^https://anidex\\.tv/' }],
    })
    expect(sql).toContain('searchdata_url_impression')
    expect(sql).toContain("THEN 'home'")
    expect(sql).toContain("ELSE 'other'")
    expect(pageTypeCaseSql('url', [{ id: 'home', path: '^x' }])).toContain('REGEXP_CONTAINS(url')
  })
})

describe('ga4ExportDatasetId', () => {
  it('strips properties/ prefix', () => {
    expect(ga4ExportDatasetId('properties/530300959')).toBe('analytics_530300959')
    expect(requireProductId('anidex')).toBe('anidex')
  })
})
