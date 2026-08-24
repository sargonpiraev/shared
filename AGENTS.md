# shared

Shared monorepo (former `packages` + `ci`).

- **clients** — transport API clients (OpenAPI → TS when no official SDK)
- **pulumi-*** — thin Pulumi providers over clients + ComponentResources (`pulumi-apps` preferred; legacy `pulumi-webapp-analytics`)
- **mcp-*** — MCP servers over clients
- **eslint-config** — shared project ESLint flat-config + inventory/harness JSON schemas (`@sargonpiraev/eslint-config`)
- **prettier-config** — shared Prettier (`@sargonpiraev/prettier-config`)
- **fslint-config** — shared alint file-structure rules (`@sargonpiraev/fslint-config`)
- **lefthook-config** — Lefthook remotes provider (`@sargonpiraev/lefthook-config`; `packages/lefthook-config/lefthook.yml`)
- **commitlint-config** — shared Commitlint conventional preset (`@sargonpiraev/commitlint-config`)
- **tsconfig** — shared TypeScript base with `strict: true` (`@sargonpiraev/tsconfig`)
- **semantic-release-config** — shared semantic-release base (`@sargonpiraev/semantic-release-config`); package `.releaserc.json` thin-extends it
- **ci/** — root `.npmrc` template (`ci/npmrc`)
- **.github/** — reusable GitHub Actions workflows + composite actions (from former `sargonpiraev/ci`)

Root thin extends: `prettier.config.mjs`, `commitlint.config.cjs`, `tsconfig.json`, `eslint.config.mjs`, `.alint.yml`, `lefthook.yml` — see meta `ws__meta-shared-projects-boundaries`.

Do not put meta-only code here — that belongs in private meta `internal/`.
Projects and jobs depend on published npm versions, not `file:` into private meta (meta may use `file:` while iterating).

## Publish

- CI: [`.github/workflows/repo-on-push-main.yml`](.github/workflows/repo-on-push-main.yml) — baseline checks via local reusable [`.github/workflows/on-push-main.yml`](.github/workflows/on-push-main.yml), then `multi-semantic-release` on `main`
- Auth: npm Trusted Publishing (OIDC) only — on npmjs.com → package → Settings → Trusted Publisher: GitHub Actions, repo (`sargonpiraev/shared`), workflow `repo-on-push-main.yml`
- Opt-in: workspace packages with `.releaserc.json` that `"extends": "@sargonpiraev/semantic-release-config"` (released via `multi-semantic-release`)
