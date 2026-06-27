# sargonpiraev/shared

Reusable GitHub Actions for turborepo projects.

## Workflows

| File | Trigger (in consumer) | Jobs |
|------|----------------------|------|
| `on-push-main.yml` | `push` → `main` | lint, check-types, build (parallel) |
| `hello.yml` | manual test | hello world |

Uses `@main` — always latest from shared.

## Consumer example

```yaml
# .github/workflows/on-push-main.yml
name: on-push-main

on:
  push:
    branches: [main]

jobs:
  ci:
    uses: sargonpiraev/shared/.github/workflows/on-push-main.yml@main
    secrets: inherit
```

Requires root scripts: `lint`, `check-types`, `build`.
