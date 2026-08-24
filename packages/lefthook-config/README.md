# `@sargonpiraev/lefthook-config`

Shared Lefthook baseline (`commit-msg` + `pre-push` mirroring `on-push-main`).

Consumers do **not** import this over npm for hooks. Lefthook `remotes:` clone `sargonpiraev/shared` and load this file from the repo:

```yaml
# lefthook.yml (repo root overlay)
remotes:
  - git_url: https://github.com/sargonpiraev/shared
    ref: main
    configs:
      - packages/lefthook-config/lefthook.yml
```

Shared itself is also a remotes consumer of this path. No nested `extends:` — one provider file.

Skip local `npm audit` with `pre-push.exclude_tags: [audit]` under the hook in the overlay (parity with CI `skip-audit`).

## License

MIT © Sargon Piraev
