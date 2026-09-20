# `@sargonpiraev/lefthook-config`

Shared Lefthook baseline. Consumers load it via Lefthook **`extends`** from the installed package (local `npm run link` → symlink). Not git `remotes:`.

| Hook         | Commands                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `pre-commit` | `test:format`, `test:fslint`, `test:configlint`, `test:eslint`, `test:check-types`                                              |
| `commit-msg` | commitlint                                                                                                                      |
| `pre-push`   | those five + `test:unit`, `build`, `test:spec`, `npm audit --audit-level=critical` (mirrors `on-push-main`; no umbrella `test`) |

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

Keep overlays thin. Clones: `extends` only. Meta lefthook.yml may add named non-git hooks (e.g. `workspace-open`). Do not set `remotes:` — they override `extends`.

## License

MIT © Sargon Piraev
