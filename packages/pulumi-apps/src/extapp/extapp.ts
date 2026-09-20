import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'
import { childOpts } from '../internal/child-opts.js'
import { repoHasExtapp } from '../internal/repo-has-app.js'
import {
  CWS_DEV_CONSOLE_URL,
  cwsPublicListingUrl,
  requireCwsItemId,
  requireCwsItemSlug,
} from './cws-item.js'

export { repoHasExtapp }
export {
  CWS_DEV_CONSOLE_URL,
  cwsPublicListingUrl,
  requireCwsItemId,
  requireCwsItemSlug,
} from './cws-item.js'

/** Previous URN type — ComponentResource aliases only (stack continuity). */
const EXTAPP_TYPE_LEGACY = 'sargonpiraev:apps:ExtappAnalytics' as const

/** URN type token — governance `test:pulumi` asserts this ComponentResource is registered. */
export const EXTAPP_TYPE = 'sargonpiraev:apps:Extapp' as const

export type ExtappArgs = {
  gcpProjectId: pulumi.Input<string>
  location: pulumi.Input<string>
  /** Usually `cws`. */
  datasetId: pulumi.Input<string>
  /**
   * Chrome Web Store item id — stack code constant, not env.
   * Create the item in the Developer Dashboard first (API cannot create items).
   */
  cwsItemId: string
  cwsItemSlug: string
  /** Product label for dataset labels (lowercase slug). */
  productLabel: string
  /** Base64 SA key for `@pulumi/gcp`. */
  gcpServiceAccountKeyB64: pulumi.Input<string>
  /** When false, do not create the dataset (meta warehouse already owns it). */
  createDataset?: boolean
  datasetDescription?: pulumi.Input<string>
  adoptExisting?: boolean
  datasetImportId?: string
}

/**
 * `apps/extapp` product analytics: CWS item id in code + optional BQ dataset.
 * Store metrics ingest is meta chrome-vm Developer Dashboard scrape, not a public listing CF.
 */
export class Extapp extends pulumi.ComponentResource {
  public readonly dataset?: gcp.bigquery.Dataset
  public readonly datasetId: pulumi.Output<string>
  public readonly cwsItemId: pulumi.Output<string>
  public readonly cwsDevConsoleUrl: pulumi.Output<string>
  public readonly cwsListingUrl: pulumi.Output<string>

  constructor(name: string, args: ExtappArgs, opts?: pulumi.ComponentResourceOptions) {
    const cwsItemId = requireCwsItemId(args.cwsItemId)
    const cwsItemSlug = requireCwsItemSlug(args.cwsItemSlug)

    super(
      EXTAPP_TYPE,
      name,
      args,
      pulumi.mergeOptions(opts, {
        aliases: [{ type: EXTAPP_TYPE_LEGACY }],
      })
    )

    const adopt = args.adoptExisting === true
    const createDataset = args.createDataset !== false

    const credentials = pulumi
      .output(args.gcpServiceAccountKeyB64)
      .apply((b64) => Buffer.from(b64, 'base64').toString('utf-8'))

    const gcpProvider = new gcp.Provider(
      `${name}-gcp`,
      {
        project: args.gcpProjectId,
        credentials,
      },
      childOpts(this, undefined)
    )

    const bigqueryApi = new gcp.projects.Service(
      `${name}-bigquery-api`,
      {
        project: args.gcpProjectId,
        service: 'bigquery.googleapis.com',
        disableOnDestroy: false,
      },
      childOpts(this, undefined, { provider: gcpProvider })
    )

    if (createDataset) {
      this.dataset = new gcp.bigquery.Dataset(
        `${name}-dataset`,
        {
          project: args.gcpProjectId,
          datasetId: args.datasetId,
          location: args.location,
          deletionPolicy: 'ABANDON',
          description:
            args.datasetDescription ?? `Chrome Web Store product analytics (${args.productLabel})`,
          labels: {
            domain: 'product',
            source: 'cws',
            product: args.productLabel,
          },
        },
        childOpts(this, undefined, {
          provider: gcpProvider,
          dependsOn: [bigqueryApi],
          retainOnDelete: true,
          ...(adopt
            ? {
                protect: true,
                ignoreChanges: ['labels', 'description'],
                ...(args.datasetImportId ? { import: args.datasetImportId } : {}),
              }
            : {}),
        })
      )
    }

    this.datasetId = this.dataset?.datasetId ?? pulumi.output(args.datasetId)
    this.cwsItemId = pulumi.output(cwsItemId)
    this.cwsDevConsoleUrl = pulumi.output(CWS_DEV_CONSOLE_URL)
    this.cwsListingUrl = pulumi.output(cwsPublicListingUrl(cwsItemSlug, cwsItemId))

    this.registerOutputs({
      datasetId: this.datasetId,
      cwsItemId: this.cwsItemId,
      cwsDevConsoleUrl: this.cwsDevConsoleUrl,
      cwsListingUrl: this.cwsListingUrl,
    })
  }
}
