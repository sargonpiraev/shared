# @sargonpiraev/pulumi-cursor

Pulumi provider for [Cursor Cloud Agents](https://cursor.com/docs/cloud-agent/api/endpoints.md) **v1**: a durable **Agent** plus ephemeral **runs** (not modeled as Pulumi resources).

## Install

```bash
npm install @sargonpiraev/pulumi-cursor
```

Pulumi looks up `pulumi-resource-cursor` on `PATH` after install:

```bash
export PATH="$(npm root)/.bin:$PATH"
```

## Usage

```ts
import { Provider, Agent } from '@sargonpiraev/pulumi-cursor'

const cursor = new Provider('cursor', {
  apiKey: process.env.CURSOR_API_KEY!,
})

const growth = new Agent(
  'growth',
  {
    apiKey: process.env.CURSOR_API_KEY!,
    name: 'growth',
    promptText: '...',
    repositoryUrl: 'https://github.com/sargonpiraev/anidex',
    startingRef: 'main',
    autoCreatePR: true,
    mcpServers: [
      {
        name: 'bigquery',
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@toolbox-sdk/server@latest', '--prebuilt', 'bigquery', '--stdio'],
      },
    ],
  },
  { provider: cursor }
)
```

Create is `POST /v1/agents` (agent + initial run). Follow-ups are `POST /v1/agents/{id}/runs` from a scheduler — not a Pulumi resource.

Auth: Cursor Dashboard API key as `Authorization: Bearer` (`CURSOR_API_KEY`).

## Home

https://github.com/sargonpiraev/shared/tree/main/packages/pulumi-cursor
