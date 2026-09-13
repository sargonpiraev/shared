# GitHub Actions

Reusable workflows and composite actions for personal repos (merged from former `sargonpiraev/ci` into this monorepo).

Consumers call them with:

```yaml
jobs:
  base:
    uses: sargonpiraev/shared/.github/workflows/on-push-main.yml@main
    secrets: inherit
```

This repo’s own publish lane is [`repo-on-push-main.yml`](./repo-on-push-main.yml) (calls the local reusable workflow).

## Reusable workflows

### `on-push-main.yml`

Baseline parallel checks:

- `fslint` (`npm run test:fslint`)
- `configlint` (`npm run test:configlint`)
- `lint` (`npm run test:eslint`)
- `check-types`
- `build`
- `test`
- `audit` (optional via `skip-audit` input)

Repo-specific jobs (example Playwright, npm publish, docs) live in that repo’s own caller workflow, not here.

### Playwright visual baselines (consumer tip)

For `*.visual.spec.ts` screenshot gates, run the job in `mcr.microsoft.com/playwright:v{exact @playwright/test}-jammy` (or `noble`) and update baselines inside that same image locally — e.g. seokit’s `npm run test:spec:visual:update` / `scripts/pw-visual-docker.sh`. Host macOS `*-darwin.png` will not match Linux CI.

### `on-release.yml`

semantic-release publish helper for package repos (npm + GitHub release).

### `release.yml`

GitHub-only semantic-release with `released` / `tag` outputs for follow-up jobs (e.g. upload release assets in weazer).

## npm publish auth

Publish jobs use **npm Trusted Publishing (OIDC)** only — `id-token: write`, no `registry-url` in `setup-node` (it writes a temp `.npmrc` that breaks OIDC / causes `EINVALIDNPMTOKEN`). No `NPM_TOKEN` fallback.

Trusted Publisher workflow filename must match the **caller** workflow in the package repo (for this monorepo: `repo-on-push-main.yml`).

## Node.js

CI uses **Node.js 24**, `actions/checkout@v6`, `actions/setup-node@v6`.

## Local hooks (lefthook)

Provider baseline: [`../../packages/lefthook-config/lefthook.yml`](../../packages/lefthook-config/lefthook.yml) (mirrors `on-push-main.yml`).

| Hook                  | Checks                                          |
| --------------------- | ----------------------------------------------- |
| `commit-msg`          | Conventional Commits via commitlint             |
| `pre-push` (parallel) | `lint`, `check-types`, `build`, `test`, `audit` |

In a consumer repo:

```yaml
# lefthook.yml
remotes:
  - git_url: https://github.com/sargonpiraev/shared
    ref: main
    configs:
      - packages/lefthook-config/lefthook.yml
```

Needs `lefthook`, `@commitlint/cli`, and `@commitlint/config-conventional` in `devDependencies`, plus `prepare`: `lefthook install`.

To skip audit locally (same idea as `skip-audit: true` on the workflow):

```yaml
exclude_tags:
  - audit
```
