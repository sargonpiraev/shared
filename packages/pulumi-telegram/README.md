# @sargonpiraev/pulumi-telegram

Pulumi provider for Telegram bot registration/webhooks

## Install

```bash
npm install @sargonpiraev/pulumi-telegram
```

## Usage

```ts
import { TelegramBot } from '@sargonpiraev/pulumi-telegram'
```

Pulumi looks up the resource plugin binary `pulumi-resource-telegram` on `PATH`. After install:

```bash
export PATH="$(npm root)/.bin:$PATH"
# or
pulumi plugin install resource telegram v0.1.0 --file "$(npm root)/@sargonpiraev/pulumi-telegram/bin/pulumi-resource-telegram.js" --reinstall
```

## Home

https://github.com/sargonpiraev/shared/tree/main/packages/pulumi-telegram

## Release

Published from the [`sargonpiraev/shared`](https://github.com/sargonpiraev/shared) monorepo via Trusted Publishing (`on-push-main.yml`).

Release lane: Trusted Publisher on `on-push-main.yml`.
