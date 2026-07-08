# GitHub Actions

## Reusable workflows

### `on-push-main.yml`

Baseline parallel checks for monorepo workspaces:

- `lint`
- `check-types`
- `build`
- `test`
- `audit` (optional via `skip-audit` input)

Call from the same repo:

```yaml
jobs:
  base:
    uses: ./.github/workflows/on-push-main.yml
```

Call from another repo:

```yaml
jobs:
  base:
    uses: sargonpiraev/shared/.github/workflows/on-push-main.yml@main
```

### Package publish workflows

Pattern for publishable packages in `shared`:

```yaml
jobs:
  base:
    uses: ./.github/workflows/on-push-main.yml

  package-extra:
    runs-on: ubuntu-latest
    steps:
      # package-specific checks (Playwright, integration, etc.)

  publish-npm:
    needs: [base, package-extra]

  publish-docs:
    needs: [base, package-extra]
```

Example: `on-main-push-seodit.yml` adds `test-next` beside `base`, then publishes npm + docs in parallel.

### npm publish auth

`publish-npm` uses GitHub OIDC (`id-token: write`) and falls back to `NPM_TOKEN` for `@semantic-release/npm`.

Either:

1. **Trusted Publishing (preferred)** — on npmjs.com → `@sargonpiraev/seodit` → Settings → Trusted Publisher → GitHub Actions → repo `sargonpiraev/shared`, workflow `on-main-push-seodit.yml`, environment optional.

2. **Classic token** — add repo secret `NPM_TOKEN` with an Automation token that can publish `@sargonpiraev/seodit`.

## Extension points

Add optional `workflow_call` inputs to `on-push-main.yml` when a consumer needs them (`skip-audit`, custom test command, etc.). Keep heavy package-specific checks in `on-main-push-<package>.yml`, not in the shared baseline.
