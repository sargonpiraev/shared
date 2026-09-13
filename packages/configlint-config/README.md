# `@sargonpiraev/configlint-config`

Shared **alint** rules for **config linting** (`test:configlint` → `alint check -c .alint.configlint.yaml`).

One leaf per config file, one `for_each_file` rule per leaf. File/dir **presence** stays in [`@sargonpiraev/fslint-config`](../fslint-config/).

Leaf filename: `{scope}__` + target path with each directory separator `/` replaced by `__` (never a single `.` for a folder). Example: `.cursor/worktrees.json` → `project__.cursor__worktrees.json.yaml`.

Whole-file contracts use alint `cross_file` + `relation: identical` against a golden file in `templates/` (not JSONPath, not `file_hash`). Structured JSON pins use `json_schema_passes` + `const` in `templates/*.schema.json`. Both need the package on disk at `node_modules/@sargonpiraev/configlint-config/templates/…` — GitHub-raw YAML alone is not enough for those leaves.

| File                                    | Target                                                                                                                                                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project__package.json.yaml`            | clone-root `package.json` scripts via `json_schema_passes` + `templates/project__package.json.schema.json`                                                                                                                |
| `project__project.json.yaml`            | clone-root `project.json` Nx targets via `json_schema_passes` + `templates/project__project.json.schema.json`                                                                                                             |
| `project__.nvmrc.yaml`                  | clone-root `.nvmrc` byte-identical to `templates/.nvmrc`                                                                                                                                                                  |
| `project__.npmrc.yaml`                  | clone-root `.npmrc` starts with `templates/.npmrc` (overlays after allowed; no `_authToken`)                                                                                                                              |
| `project__turbo.json.yaml`              | clone-root `turbo.json` via `json_schema_passes` + `templates/project__turbo.json.schema.json`                                                                                                                            |
| `project__tsconfig.json.yaml`           | clone-root `tsconfig.json` via `json_schema_passes` + `templates/project__tsconfig.json.schema.json`                                                                                                                      |
| `project__commitlintrc.yaml`            | clone-root `.commitlintrc.yaml` via `json_schema_passes` + `templates/project__commitlintrc.yaml.schema.json`                                                                                                             |
| `project__eslint.config.mjs.yaml`       | clone-root `eslint.config.mjs` spreads `/project` (not meta)                                                                                                                                                              |
| `project__prettier.config.mjs.yaml`     | clone-root `prettier.config.mjs` re-exports `@sargonpiraev/prettier-config`                                                                                                                                               |
| `project__lefthook.yml.yaml`            | clone-root `lefthook.yml` must `extends` `lefthook-config/lefthook.yml` and must not set git `remotes:`                                                                                                                   |
| `project__.cursor__worktrees.json.yaml` | clone-root `.cursor/worktrees.json` byte-identical to `templates/.cursor__worktrees.json`                                                                                                                                 |
| `project__.alint.fslint.yaml.yaml`      | clone-root `.alint.fslint.yaml` extends `fslint-config/project.yaml` plus `project__apps__{webapp,mobapp,extapp}.yaml` and `project__packages__{oapi,db,scrape}-client.yaml`                                              |
| `project__.alint.configlint.yaml.yaml`  | clone-root `.alint.configlint.yaml` extends the product configlint leaves (names, not SRI)                                                                                                                                |
| `project__packages__oapi-client.yaml`   | `packages/**/*-oapi-client/package.json`: `name` `*-oapi-client`, `exports["./mock"]`, `scripts.test` (empty glob = pass)                                                                                                 |
| `project__packages__db-client.yaml`     | `packages/**/*-db-client/package.json`: `name` `*-db-client`, `exports["./mock"]`, `scripts.test`                                                                                                                         |
| `project__packages__scrape-client.yaml` | `packages/**/*-scrape-client/package.json`: `name` `*-scrape-client`, `exports["./mock"]`, `scripts.test`                                                                                                                 |
| `webapp__playwright.yaml`               | `apps/webapp`: `desktop`/`mobile` projects; app `package.json` `--grep @feat` `@seokit` `@analytics` `@visual` `@perf`; each `page.spec.ts` has those five tags; CI `npm run test:spec:visual` / `npm run test:spec:perf` |
| `docapp__playwright.yaml`               | `apps/docapp`: same viewport projects + grep lanes; CI `npm run test:spec:visual` / `npm run test:spec:perf` / `npm run test:spec`                                                                                        |
| `extapp__playwright.yaml`               | `apps/extapp`: `desktop` project; `--grep @feat` / `@visual`; CI `npm run test:spec:visual` / `npm run test:spec`                                                                                                         |
| `project__pulumi__webapp.yaml`          | `apps/webapp`: `apps/webapp/pulumi.ts` contains `new Webapp(` (not in `pulumi/index.ts`)                                                                                                                                  |
| `project__pulumi__mobapp.yaml`          | `apps/mobapp`: `apps/mobapp/pulumi.ts` contains `new Mobapp(`                                                                                                                                                             |
| `project__pulumi__extapp.yaml`          | `apps/extapp`: `apps/extapp/pulumi.ts` contains `new Extapp(`                                                                                                                                                             |

Do not extend product `project__package.json.yaml` / `project__project.json.yaml` / `project__eslint.config.mjs.yaml` / `project__turbo.json.yaml` / `project__.alint.fslint.yaml.yaml` / `project__.alint.configlint.yaml.yaml` from the meta repo.

## Usage

```yaml
# .alint.configlint.yaml
version: 1
extends:
  - ./packages/configlint-config/project__package.json.yaml
  - ./packages/configlint-config/project__project.json.yaml
  - ./packages/configlint-config/project__.nvmrc.yaml
  - ./packages/configlint-config/project__.npmrc.yaml
  - ./packages/configlint-config/project__turbo.json.yaml
  - ./packages/configlint-config/project__tsconfig.json.yaml
  - ./packages/configlint-config/project__commitlintrc.yaml
  - ./packages/configlint-config/project__eslint.config.mjs.yaml
  - ./packages/configlint-config/project__prettier.config.mjs.yaml
  - ./packages/configlint-config/project__lefthook.yml.yaml
  - ./packages/configlint-config/project__.cursor__worktrees.json.yaml
  - ./packages/configlint-config/project__.alint.fslint.yaml.yaml
  - ./packages/configlint-config/project__.alint.configlint.yaml.yaml
  - ./packages/configlint-config/webapp__playwright.yaml
  - ./packages/configlint-config/docapp__playwright.yaml
  - ./packages/configlint-config/extapp__playwright.yaml
  - ./packages/configlint-config/project__pulumi__webapp.yaml
  - ./packages/configlint-config/project__pulumi__mobapp.yaml
  - ./packages/configlint-config/project__pulumi__extapp.yaml
  - ./packages/configlint-config/project__packages__oapi-client.yaml
  - ./packages/configlint-config/project__packages__db-client.yaml
  - ./packages/configlint-config/project__packages__scrape-client.yaml
```

Product repos: the same paths under `./node_modules/@sargonpiraev/configlint-config/`, or GitHub raw + SRI per file. Do not extend `../shared/...`.

Recompute: `shasum -a 256 shared/packages/configlint-config/*.yaml`.

## License

MIT © Sargon Piraev
