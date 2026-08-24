export type Ga4BigQueryLinkListItem = {
  name?: string | null
  project?: string | null
  datasetLocation?: string | null
  createTime?: string | null
}

/** Analytics Admin list payload uses `bigqueryLinks`; generated types say `bigQueryLinks`. */
export function listedBigQueryLinks(data: {
  bigQueryLinks?: Ga4BigQueryLinkListItem[] | null
  bigqueryLinks?: Ga4BigQueryLinkListItem[] | null
}): Ga4BigQueryLinkListItem[] {
  return data.bigQueryLinks ?? data.bigqueryLinks ?? []
}
