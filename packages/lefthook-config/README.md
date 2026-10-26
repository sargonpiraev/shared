# `@sargonpiraev/lefthook-config`

Shared Lefthook baseline. Consumers load it via Lefthook **`extends`** from the installed package (local `npm run link` → symlink). Not git `remotes:`.

| Hook         | Commands                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `pre-commit` | `test:format`, `test:fslint`, `test:configlint`, `test:eslint`, `test:check-types`                                              |
| `commit-msg` | commitlint                                                                                                                      |
| `pre-push`   | those five + `test:unit`, `build`, `test:spec`, `npm audit --audit-level=critical` (mirrors `on-push-main`; no umbrella `test`) |
| `post-push`  | `test:github:ci` (tag `github-ci`) — wait for GitHub Actions on HEAD after a successful push                                    |

Do **not** add interactive Commitizen on `prepare-commit-msg` — agents use `git commit -m`. Message shape: [`@sargonpiraev/commitlint-config`](../commitlint-config/) + Conventional Commits.

```yaml
# lefthook.yml (clone / meta)
extends:
  - ./node_modules/@sargonpiraev/lefthook-config/lefthook.yml
```

```yaml
# lefthook.yml (shared monorepo)
extends:
  - ./packages/lefthook-config/lefthook.yml
```

## `test:github:ci`

Shared runner: `scripts/test-github-ci.mjs`.

```json
{
  "scripts": {
    "test:github:ci": "node node_modules/@sargonpiraev/lefthook-config/scripts/test-github-ci.mjs"
  }
}
```

- Waits for **all** workflow runs for HEAD SHA (not only `on-push-main`).
- No `.github/workflows` → exit 0 with a log line.
- Fail-fast if `gh` is missing / unauthenticated, or workflows exist but no run appears within ~2 min.
- Not part of cheap `npm test`.

Skip locally (personal, gitignored):

```yaml
# lefthook-local.yml
post-push:
  exclude_tags:
    - github-ci
```

Keep overlays thin. Clones: `extends` only. Meta lefthook.yml may add named non-git hooks (e.g. `workspace-open`). Do not set `remotes:` — they override `extends`.

## License

MIT © Sargon Piraev
