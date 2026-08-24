# @sargonpiraev/pulumi-gsc

Pulumi provider for Google Search Console properties

## Install

```bash
npm install @sargonpiraev/pulumi-gsc
```

## Usage

```ts
import { GscProperty } from '@sargonpiraev/pulumi-gsc'
```

Pulumi looks up the resource plugin binary `pulumi-resource-gsc` on `PATH`. After install:

```bash
export PATH="$(npm root)/.bin:$PATH"
# or
pulumi plugin install resource gsc v0.1.0 --file "$(npm root)/@sargonpiraev/pulumi-gsc/bin/pulumi-resource-gsc.js" --reinstall
```

## Home

https://github.com/sargonpiraev/shared/tree/main/packages/pulumi-gsc

## Release

Published from the [`sargonpiraev/shared`](https://github.com/sargonpiraev/shared) monorepo via Trusted Publishing (`on-push-main.yml`).

Release lane: Trusted Publisher on `on-push-main.yml`.
