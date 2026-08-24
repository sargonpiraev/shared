# @sargonpiraev/pulumi-webapp-analytics

> **Prefer [`@sargonpiraev/pulumi-apps`](https://www.npmjs.com/package/@sargonpiraev/pulumi-apps)** (`Webapp` / `WEBAPP_TYPE` = `sargonpiraev:apps:Webapp`). This package remains published for existing pins; new stacks should import from `pulumi-apps`.

Pulumi **ComponentResource** for public web product analytics (`apps/webapp` / public `docapp`):

- Google Search Console property (`@sargonpiraev/pulumi-gsc`)
- BigQuery bulk-export dataset + GSC export IAM (`@pulumi/gcp`)
- Optional GA4 measurement / property ids as outputs (no first-class GA4→BQ resource in `@pulumi/gcp` yet)

## Install

```bash
# preferred
npm install @sargonpiraev/pulumi-apps

# legacy (existing pins)
npm install @sargonpiraev/pulumi-webapp-analytics
```

## Usage (legacy)

```ts
import {
  WebappAnalytics,
  WEBAPP_ANALYTICS_TYPE,
  repoHasWebapp,
} from '@sargonpiraev/pulumi-webapp-analytics'

if (!repoHasWebapp(repoRoot)) {
  throw new Error('apps/webapp required')
}

const analytics = new WebappAnalytics('webapp-analytics', {
  gcpProjectId: 'sargonpiraev',
  datasetId: 'searchconsole_anidex',
  location: 'EU',
  gscSiteUrl: 'sc-domain:anidex.tv',
  gscServiceAccountKeyB64: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!,
  gcpServiceAccountKeyB64: process.env.GCP_SERVICE_ACCOUNT_KEY!,
  datasetDescription: 'GSC bulk export for anidex.tv',
  datasetLabels: { product: 'anidex', source: 'gsc', domain: 'product' },
  adoptExisting: true,
  datasetImportId: 'projects/sargonpiraev/datasets/searchconsole_anidex',
})

void WEBAPP_ANALYTICS_TYPE
void analytics.datasetId
```

## Type token (legacy)

`sargonpiraev:webapp-analytics:WebappAnalytics` (`WEBAPP_ANALYTICS_TYPE`)

Prefer `@sargonpiraev/pulumi-apps` `Webapp` (`sargonpiraev:apps:Webapp`) — that class aliases this legacy type for stack continuity.

## Home

https://github.com/sargonpiraev/shared/tree/main/packages/pulumi-webapp-analytics

## Release

Published from [`sargonpiraev/shared`](https://github.com/sargonpiraev/shared) via Trusted Publishing (`repo-on-push-main.yml`).
