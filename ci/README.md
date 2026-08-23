# CI baseline (former `sargonpiraev/ci`)

Reusable GitHub Actions and the Lefthook remotes provider live in this monorepo (`sargonpiraev/shared`) after the `packages` + `ci` merge.

| Path                                             | Role                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| [`lefthook.yml`](./lefthook.yml)                 | Provider hooks baseline — other repos pull via lefthook `remotes:`                                |
| [`npmrc`](./npmrc)                               | Portfolio root `.npmrc` template (`engine-strict=true`, `fund=false`) — copy to each repo root    |
| [`../.github/workflows/`](../.github/workflows/) | Reusable workflows (`on-push-main.yml`, …) — must stay at repo-root `.github/` for GitHub Actions |
| [`../.github/actions/`](../.github/actions/)     | Composite actions (e.g. `setup-node-npm-ci`)                                                      |

File structure linting (alint) lives in [`../packages/fslint-config/`](../packages/fslint-config/) (`@sargonpiraev/fslint-config`), not under `ci/`.

Consumers point remotes / `uses:` at `sargonpiraev/shared` (lefthook config path: `ci/lefthook.yml`).
