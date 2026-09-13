# `@sargonpiraev/fslint-config`

Shared **alint** rules for file structure linting (`test:fslint` → `alint check -c .alint.fslint.yaml`).

One file per rule. No nested `extends:` in the leaves (safe to pin over GitHub raw + SRI).

| File                                    | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project.yaml`                          | clone root MUST files/dirs (including `.cursor/`, `.github/`, `pulumi/.env.example`)                                                                                                                                                                                                                                                                                                                                                            |
| `project__apps__webapp.yaml`            | `apps/webapp` (skipped if absent): canon anidex — App Router `src/` + root `layout` / `page` / `globals.css` + `src/env.ts` + `src/middleware.ts` + next-intl (`src/i18n/request.ts`, `src/i18n/routing.ts`, `src/i18n/navigation.ts`, `messages/`) + Playwright `e2e/` + Jest (`jest.config.*`, `jest.setup.ts`) + `sitemapindex.xml` + `sitemap/[id]` routes + `.env.example` + `eslint.config.mjs` + `pulumi.ts` + repo-root stack. Each `page.tsx` / `page.jsx` needs sibling `page.spec.ts` |
| `project__apps__mobapp.yaml`            | `apps/mobapp` (skipped if absent): Expo files + `pulumi.ts` + repo-root stack. `new Mobapp(` is configlint                                                                                                                                                                                                                                                                                                                                      |
| `project__apps__extapp.yaml`            | `apps/extapp` (skipped if absent): WXT files + `pulumi.ts` + repo-root stack. `new Extapp(` is configlint                                                                                                                                                                                                                                                                                                                                       |
| `project__packages__oapi-client.yaml`   | `packages/**/*-oapi-client` (skipped if none): `package.json`, `src/`, `src/oapi.yaml`                                                                                                                                                                                                                                                                                                                                                          |
| `project__packages__db-client.yaml`     | `packages/**/*-db-client` (skipped if none): `package.json`, `src/`, Prisma schema                                                                                                                                                                                                                                                                                                                                                              |
| `project__packages__scrape-client.yaml` | `packages/**/*-scrape-client` (skipped if none): `package.json`, `src/`                                                                                                                                                                                                                                                                                                                                                                         |

## Usage

```yaml
# .alint.fslint.yaml
version: 1
extends:
  - ./packages/fslint-config/project.yaml
  - ./packages/fslint-config/project__apps__webapp.yaml
  - ./packages/fslint-config/project__apps__mobapp.yaml
  - ./packages/fslint-config/project__apps__extapp.yaml
  - ./packages/fslint-config/project__packages__oapi-client.yaml
  - ./packages/fslint-config/project__packages__db-client.yaml
  - ./packages/fslint-config/project__packages__scrape-client.yaml
```

Product repos: same seven paths under `./node_modules/@sargonpiraev/fslint-config/`, or GitHub raw + SRI per file. Do not extend `../shared/...`. Config linting is a separate file: `.alint.configlint.yaml` → [`@sargonpiraev/configlint-config`](../configlint-config/).

```yaml
extends:
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/project.yaml#sha256-<hash>
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/project__apps__webapp.yaml#sha256-<hash>
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/project__apps__mobapp.yaml#sha256-<hash>
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/project__apps__extapp.yaml#sha256-<hash>
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/project__packages__oapi-client.yaml#sha256-<hash>
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/project__packages__db-client.yaml#sha256-<hash>
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/project__packages__scrape-client.yaml#sha256-<hash>
```

Recompute: `shasum -a 256 shared/packages/fslint-config/*.yaml`. Config lint hashes: `shasum -a 256 shared/packages/configlint-config/*.yaml`.

## License

MIT © Sargon Piraev
