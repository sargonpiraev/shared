import { describe, expect, it } from '@jest/globals'
import { listedBigQueryLinks } from './listed-bigquery-links.js'

describe('listedBigQueryLinks', () => {
  it('reads camelCase bigQueryLinks', () => {
    expect(
      listedBigQueryLinks({
        bigQueryLinks: [{ name: 'properties/1/bigQueryLinks/a' }],
      })
    ).toHaveLength(1)
  })

  it('reads JSON bigqueryLinks from the Admin API', () => {
    expect(
      listedBigQueryLinks({
        bigqueryLinks: [{ name: 'properties/1/bigQueryLinks/a' }],
      })
    ).toEqual([{ name: 'properties/1/bigQueryLinks/a' }])
  })

  it('returns empty when neither field is set', () => {
    expect(listedBigQueryLinks({})).toEqual([])
  })
})
