import * as pulumi from '@pulumi/pulumi'

export type Ga4PropertyArgs = {
  /**
   * Numeric GA4 property id (`123456789`) or resource name (`properties/123456789`).
   * Required when `importExisting` is true; optional when creating (output after create).
   */
  propertyId?: pulumi.Input<string>
  /** Base64-encoded Google Service Account JSON key (needs `analytics.edit`). */
  serviceAccountKeyB64: pulumi.Input<string>
  /** When true, adopt an existing property (do not create). Requires `propertyId`. */
  importExisting?: boolean
  /** Parent Analytics account id (`123`) or `accounts/123` — required to create. */
  accountId?: pulumi.Input<string>
  /** Display name when creating a property. */
  displayName?: pulumi.Input<string>
  /** IANA time zone when creating (e.g. `Europe/Moscow`). */
  timeZone?: pulumi.Input<string>
  /** ISO 4217 currency when creating (e.g. `USD`). */
  currencyCode?: pulumi.Input<string>
  /**
   * Optional measurement id hint (`G-…`). When importing, the provider prefers the
   * web data stream that matches this id; otherwise the first web stream.
   */
  measurementId?: pulumi.Input<string>
  /** Site URL for the web data stream (`https://example.com`) — used on create. */
  defaultUri?: pulumi.Input<string>
}

export class Ga4Property extends pulumi.CustomResource {
  public readonly propertyId!: pulumi.Output<string>
  public readonly propertyName!: pulumi.Output<string>
  public readonly displayName!: pulumi.Output<string>
  public readonly measurementId!: pulumi.Output<string>
  public readonly createTime!: pulumi.Output<string>

  constructor(name: string, args: Ga4PropertyArgs, opts?: pulumi.CustomResourceOptions) {
    super(
      'ga4:index:Property',
      name,
      {
        propertyId: args.propertyId,
        serviceAccountKeyB64: args.serviceAccountKeyB64,
        importExisting: args.importExisting ?? false,
        accountId: args.accountId,
        displayName: args.displayName,
        timeZone: args.timeZone,
        currencyCode: args.currencyCode,
        measurementId: args.measurementId,
        defaultUri: args.defaultUri,
        propertyName: undefined,
        createTime: undefined,
      },
      opts
    )
  }
}

export type Ga4BigQueryLinkArgs = {
  /** Numeric GA4 property id or `properties/{id}`. */
  propertyId: pulumi.Input<string>
  /** GCP project id or number that receives the GA4 export datasets. */
  gcpProjectId: pulumi.Input<string>
  /** BigQuery dataset location for the GA-managed export (e.g. `EU`). */
  datasetLocation: pulumi.Input<string>
  /** Base64-encoded Google Service Account JSON key (needs `analytics.edit`). */
  serviceAccountKeyB64: pulumi.Input<string>
  /** When true, adopt an existing BigQuery link for this property+project. */
  importExisting?: boolean
  dailyExportEnabled?: pulumi.Input<boolean>
  streamingExportEnabled?: pulumi.Input<boolean>
  freshDailyExportEnabled?: pulumi.Input<boolean>
}

export class Ga4BigQueryLink extends pulumi.CustomResource {
  public readonly linkName!: pulumi.Output<string>
  public readonly propertyId!: pulumi.Output<string>
  public readonly gcpProject!: pulumi.Output<string>
  public readonly datasetLocation!: pulumi.Output<string>
  public readonly createTime!: pulumi.Output<string>

  constructor(name: string, args: Ga4BigQueryLinkArgs, opts?: pulumi.CustomResourceOptions) {
    super(
      'ga4:index:BigQueryLink',
      name,
      {
        propertyId: args.propertyId,
        gcpProjectId: args.gcpProjectId,
        datasetLocation: args.datasetLocation,
        serviceAccountKeyB64: args.serviceAccountKeyB64,
        importExisting: args.importExisting ?? false,
        dailyExportEnabled: args.dailyExportEnabled ?? true,
        streamingExportEnabled: args.streamingExportEnabled ?? false,
        freshDailyExportEnabled: args.freshDailyExportEnabled ?? false,
        linkName: undefined,
        gcpProject: undefined,
        createTime: undefined,
      },
      opts
    )
  }
}
