# @sargonpiraev/pulumi-ga4

Pulumi provider for Google Analytics 4 properties and native BigQuery export links.

Uses `@googleapis/analyticsadmin` **v1alpha** (BigQuery links are not on v1beta). Service account scope: `https://www.googleapis.com/auth/analytics.edit`.

## Install

```bash
npm install @sargonpiraev/pulumi-ga4
```

## Resources

| Type token               | Class             | Role                              |
| ------------------------ | ----------------- | --------------------------------- |
| `ga4:index:Property`     | `Ga4Property`     | Adopt or create a GA4 property    |
| `ga4:index:BigQueryLink` | `Ga4BigQueryLink` | Native GA4 → BigQuery export link |

## Usage

```ts
import { Ga4Property, Ga4BigQueryLink } from '@sargonpiraev/pulumi-ga4'

const property = new Ga4Property('ga4', {
  propertyId: '123456789',
  serviceAccountKeyB64: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!,
  importExisting: true,
})

new Ga4BigQueryLink('ga4-bq', {
  propertyId: property.propertyId,
  gcpProjectId: 'sargonpiraev',
  datasetLocation: 'EU',
  serviceAccountKeyB64: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!,
  importExisting: true,
})
```

Prefer `@sargonpiraev/pulumi-apps` `Webapp` — it **creates** the GA4 property (account + display name + site URI), it does not wait for a console property id.

Pulumi looks up the resource plugin binary `pulumi-resource-ga4` on `PATH`. After install:

```bash
export PATH="$(npm root)/.bin:$PATH"
# or
pulumi plugin install resource ga4 v0.1.0 --file "$(npm root)/@sargonpiraev/pulumi-ga4/bin/pulumi-resource-ga4.js" --reinstall
```

## Home

https://github.com/sargonpiraev/shared/tree/main/packages/pulumi-ga4

## Release

Published from the [`sargonpiraev/shared`](https://github.com/sargonpiraev/shared) monorepo via Trusted Publishing (`repo-on-push-main.yml`). Bootstrap first publish may use `npm publish --access public` once.
