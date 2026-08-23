# `@sargonpiraev/eslint-config`

Shared ESLint flat-config presets + JSON schemas for project inventory gates:

| Gate               | Files                                                                                                                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nx / scripts       | `project.json`, `package.json` (`test:eslint` required, `test:lint` / `test:alint` forbidden; `test:fslint` required; `test:pulumi` required — mocks or noop; `build`; `test:format` = `prettier --check`; `prepare` = `lefthook install`; `engines.node` ≥22) |
| Worktrees          | `.cursor/worktrees.json`                                                                                                                                                                                                                       |
| Workflow / release | `.github/workflows/on-push-main.yml` (calls `sargonpiraev/shared`; no `NPM_TOKEN`)                                                                                                                                                             |
| Playwright         | `playwright.config.ts` / `apps/{webapp,docapp,extapp}/playwright.config.ts` via `project-harness/playwright-config` (eval projects + suite specs)                                                                                              |
| Apps               | disk `apps/*` against canonical allowlist (no `*.harness.json`)                                                                                                                                                                                |
| Prettier           | `prettier.config.mjs` → `@sargonpiraev/prettier-config` (not package.json `prettier` key)                                                                                                                                                      |
| TypeScript         | root `tsconfig.json` extends `@sargonpiraev/tsconfig`                                                                                                                                                                                          |
| Env                | env-contract apps (`webapp`, `docapp`, `extapp`, `mobapp`, `jobapp`, `admapp`) must have `apps/<app>/.env.example`                                                                                                                             |
| Pulumi             | if `pulumi/` exists: `Pulumi.yaml`, `index.ts` or `src/index.ts`, `pulumi:preview` / `pulumi:up`, `.gitignore` ignores `.env` + `.pulumi` (not whole `pulumi/`)                                                                                |
| Turbo              | required root `turbo.json`                                                                                                                                                                                                                     |
| semantic-release   | `.releaserc.json` when present must `"extends": "@sargonpiraev/semantic-release-config"`                                                                                                                                                       |
| Lefthook           | required `lefthook.yml` / `lefthook.yaml` → `remotes` → `sargonpiraev/shared` (`configs: ci/lefthook.yml`); `scripts.prepare` must run `lefthook install` (hooks on `npm ci` / `npm install`)                                                  |

Meta-only gates (`meta__package`, meta lefthook, commitlint shape) stay in the private meta repo.

## Install

```bash
npm install -D @sargonpiraev/eslint-config eslint eslint-plugin-json-schema-validator
npm install -D @sargonpiraev/prettier-config @sargonpiraev/tsconfig prettier
```

## Project usage

`eslint.config.mjs` at the project root:

```js
import project from '@sargonpiraev/eslint-config/project'

export default [...project]
```

Wire into `test:eslint` (example):

```bash
eslint --config ./eslint.config.mjs --no-config-lookup --no-warn-ignored --no-error-on-unmatched-pattern \
  "project.json" "package.json" ".cursor/worktrees.json" \
  "tsconfig.json" ".releaserc.json" \
  ".github/workflows/on-push-main.yml" \
  "playwright.config.ts" "apps/*/playwright.config.ts" \
  "lefthook.yml" "lefthook.yaml" ".gitignore"
```

### Required inventory files

```yaml
# lefthook.yml (required)
remotes:
  - git_url: https://github.com/sargonpiraev/shared
    ref: main
    configs:
      - ci/lefthook.yml
```

```json
// package.json (required) — hooks install via npm lifecycle
{ "scripts": { "prepare": "lefthook install" } }
```

`*.harness.json` files (`repo.harness.json`, `env.harness.json`, `pulumi.harness.json`) are **deprecated** and must not be present — inventory reads disk (`apps/*`, `.env.example`, `pulumi/`, `turbo.json`) instead.

### Playwright eval gate

`project-harness/playwright-config` loads each in-scope `playwright.config.ts` (via `jiti`) and checks:

| App path                                                          | Required `projects[].name`                                        | Specs on disk                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| `apps/webapp`, `apps/docapp`, or flat-root `playwright.config.ts` | `functional`, `seo`, `analytics`, `visual`, `cwv` (`*-mobile` OK) | at least one `*.<suite>.spec.ts` per required suite |
| `apps/extapp`                                                     | `functional`, `visual`                                            | same (no `cwv`)                                     |

Also requires each required project's `testMatch` to cover `*.<suite>.spec.ts`.

**Core Web Vitals (`cwv`):** lab metrics under Playwright (CDP CPU 4×) — not CrUX field p75. Assert LCP / INP / CLS budgets for Page Experience / ranking readiness. Run via `test:cwv` (slow; keep out of cheap `test:spec`). Inventory requires `scripts.test:cwv` when webapp/docapp (or flat-root PW) exists.

## Meta usage

```js
import projectMeta from '@sargonpiraev/eslint-config/project-meta'

export default [
  { ignores: ['pulumi/**', '**/node_modules/**'] },
  ...projectMeta,
  // meta__package, meta lefthook, commitlint, …
]
```

## What fails

| Failure                                                                                                            | Meaning                                                                    |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| missing `prettier.config.mjs` / missing `@sargonpiraev/prettier-config` dep / leftover package.json `prettier` key | adopt shared Prettier via config file                                      |
| `test:format` without `prettier --check`                                                                           | noops / `--write`-only rejected                                            |
| missing root tsconfig extending `@sargonpiraev/tsconfig`                                                           | adopt shared TS base (`strict: true`)                                      |
| forbidden / unknown `apps/*` name                                                                                  | use canonical allowlist; legacy `web`/`docs`/`mobile`/etc. forbidden       |
| flat-root Next (`next` dep, no `apps/`)                                                                            | must be turbo monorepo with `apps/webapp`                                  |
| missing `turbo.json`                                                                                               | portfolio projects are Turborepo                                           |
| env-contract app without `apps/<app>/.env.example`                                                                 | hand-maintained example (no secrets)                                       |
| `pulumi/` without yaml/entry/scripts                                                                               | add `Pulumi.yaml`, TS entry, `pulumi:preview`/`pulumi:up`                  |
| `pulumi/` without gitignore for `.env` / `.pulumi`                                                                 | ignore secrets/state only (not the whole `pulumi/` tree)                   |
| `NPM_TOKEN` in workflow                                                                                            | use Trusted Publishing OIDC + `id-token: write`                            |
| missing `lefthook.yml` / `lefthook.yaml`                                                                           | add remotes → `sargonpiraev/shared` + `"prepare": "lefthook install"`      |
| `scripts.prepare` missing / not `lefthook install`                                                                 | add `"prepare": "lefthook install"` (+ `lefthook` devDependency)           |
| lefthook without `remotes` → `sargonpiraev/shared`                                                                 | pull shared `ci/lefthook.yml` via remotes (no local hook duplication)      |
| missing `engines.node` / floor below `>=22`                                                                        | set `"engines": { "node": ">=22" }` (stricter OK); pair with root `.nvmrc` |
| playwright config missing required projects / specs                                                                | add named projects + `*.<suite>.spec.ts` files                             |

## Schemas (IDE `$schema`)

```text
@sargonpiraev/eslint-config/schemas/project__project.json
@sargonpiraev/eslint-config/schemas/project__package.json
@sargonpiraev/eslint-config/schemas/project__tsconfig.json
@sargonpiraev/eslint-config/schemas/project__releaserc.json
@sargonpiraev/eslint-config/schemas/project__lefthook.json
@sargonpiraev/eslint-config/schemas/project__worktrees.json
@sargonpiraev/eslint-config/schemas/project__workflow-on-push-main.json
```

## License

MIT © Sargon Piraev
