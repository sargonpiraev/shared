import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { importGscExportTable } from './gsc-export-table.js'

export function createGscExportLogTable(
  parent: pulumi.Resource,
  args: {
    gcpProjectId: string
    datasetId: string
    provider: gcp.Provider
    dependsOn: pulumi.Resource[]
  }
): gcp.bigquery.Table {
  return importGscExportTable(parent, 'searchconsole.ExportLog', {
    ...args,
    tableId: 'ExportLog',
  })
}
