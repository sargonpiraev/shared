# `@sargonpiraev/eslint-config`

Shared ESLint flat-config preset for TypeScript / JavaScript source.

Repo governance (file presence, `package.json` / `project.json` / Playwright config) is **not** here:

- file/dir presence → `@sargonpiraev/fslint-config` (`test:fslint`)
- structured config → `@sargonpiraev/configlint-config` (`test:configlint`)

## Install

```bash
npm install -D @sargonpiraev/eslint-config eslint
```

## Usage

```js
import project from '@sargonpiraev/eslint-config/project'

export default [...project]
```

Product clones import `/project`. The meta workspace also imports `/project` and adds **local** ignores so sibling clones are not linted from the meta root.

## Webapp / docapp env

`/project` includes `app-env/no-raw-process-env` (**error**) on `**/apps/webapp/**` and `**/apps/docapp/**`:

- Allowed: files named `env.ts` / `env.mjs` / `env.js` (Zod `schema.parse(process.env)` at module load)
- Ignored: `pulumi.ts`, `pulumi/**`, Playwright configs, `e2e/**`, `scripts/**`

## Playwright specs

`/project` includes **warn**-level rules for Playwright **page-type** files only: colocated `page.spec.ts` under `apps/webapp` / `apps/docapp` (and the same names with `.tsx` / `.js` / `.mjs`). Jest / Nest `*.spec.ts` are out of scope.

| Rule                           | What it checks                                                                                                                                                                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `playwright-specs/aspect-tags` | File-level aspect tags (not per-test `eslint-plugin-playwright` require-tags). Allowed whitelist: `@feat` `@seokit` `@analytics` `@visual` `@perf`. `page.spec.ts` must have **each** required tag on at least one `test()` (tags on `test.describe` inherit). |
| `playwright-specs/aaa-steps`   | Every `test()` / `test.skip` / `test.only` / `test.fixme` **with a callback** must contain `test.step('arrange')`, `test.step('act')`, and `test.step('assert')` as string literals, in that order.                                                            |

Rules stay **warn** (existing aspect suites may still lack AAA / tags). Product `test:eslint` should not use `--max-warnings 0` unless those specs are already compliant.

## Data warehouse Cloud Function jobs

`/project` includes **error**-level `datawh-etl/extract-transform-load` on `**/gcp.cloudfunctions.Function/src/*.ts` (not `index.ts`, not `lib/` / `deploy/`).

| Rule                                | What it checks                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `datawh-etl/extract-transform-load` | Job file must declare `extract`, `transform`, and `load` (function declaration or `const` fn). Must `export async function main`. That export (or `run()` it awaits) must `await extract()`, `await transform(...)`, and `await load(...)` in that order. GCP `entryPoint` names are barrel re-exports in `index.ts`, not this file. |

## License

MIT © Sargon Piraev
