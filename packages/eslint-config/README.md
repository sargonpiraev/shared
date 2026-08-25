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

`/project-meta` is an empty preset (meta root must not apply this to sibling clones).

## Playwright specs

`/project` includes **warn**-level rules for `*.spec.ts` (and `.tsx` / `.js`):

| Rule                           | What it checks                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `playwright-specs/aspect-tags` | File-level aspect tags (not per-test `eslint-plugin-playwright` require-tags). Allowed whitelist: `@functional` `@seo` `@analytics` `@visual` `@cwv`. `page.spec.ts` must have **each** required tag on at least one `test()` (tags on `test.describe` inherit). `*.functional.spec.ts` (and the other aspect suffixes) must include the matching tag. |
| `playwright-specs/aaa-steps`   | Every `test()` / `test.skip` / `test.only` / `test.fixme` **with a callback** must contain `test.step('arrange')`, `test.step('act')`, and `test.step('assert')` as string literals, in that order.                                                                                                                                                    |

Non-Playwright `*.spec.ts` (Jest, etc.) are skipped unless the path looks like Playwright (`e2e/`, aspect suffix, `page.spec.ts`, or `@playwright/test`).

Opt-in overlay (same rules) if you are not on `/project` yet:

```js
import { playwrightSpecsConfig } from '@sargonpiraev/eslint-config/playwright-specs'

export default [...playwrightSpecsConfig]
```

## License

MIT © Sargon Piraev
