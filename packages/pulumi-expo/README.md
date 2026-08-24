# @sargonpiraev/pulumi-expo

Pulumi provider for Expo/EAS projects

## Install

```bash
npm install @sargonpiraev/pulumi-expo
```

## Usage

```ts
import { ExpoProject } from '@sargonpiraev/pulumi-expo'
```

Pulumi looks up the resource plugin binary `pulumi-resource-expo` on `PATH`. After install:

```bash
export PATH="$(npm root)/.bin:$PATH"
# or
pulumi plugin install resource expo v0.1.0 --file "$(npm root)/@sargonpiraev/pulumi-expo/bin/pulumi-resource-expo.js" --reinstall
```

## Home

https://github.com/sargonpiraev/shared/tree/main/packages/pulumi-expo

## Release

Published from the [`sargonpiraev/shared`](https://github.com/sargonpiraev/shared) monorepo via Trusted Publishing (`on-push-main.yml`).

Release lane: Trusted Publisher on `on-push-main.yml`.
