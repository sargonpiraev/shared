# `@sargonpiraev/fslint-config`

Shared **alint** rules for file structure linting (`test:fslint` → `alint check -c .alint.fslint.yaml`).

One file per rule. No nested `extends:` in the leaves (safe to pin over GitHub raw + SRI).

| File | Rule |
| --- | --- |
| `project.yaml` | clone root MUST files/dirs (including `.cursor/`, `.github/`) |
| `cursor.yaml` | `.cursor` (skipped if absent): `worktrees.json` |
| `github.yaml` | `.github` / `.github/workflows` (skipped if absent) |
| `webapp.yaml` | `apps/webapp` (skipped if absent) |
| `mobapp.yaml`  | `apps/mobapp` (skipped if absent) |
| `extapp.yaml`  | `apps/extapp` (skipped if absent) |

## Usage

```yaml
# .alint.fslint.yaml
version: 1
extends:
  - ./packages/fslint-config/project.yaml
  - ./packages/fslint-config/cursor.yaml
  - ./packages/fslint-config/github.yaml
  - ./packages/fslint-config/webapp.yaml
  - ./packages/fslint-config/mobapp.yaml
  - ./packages/fslint-config/extapp.yaml
```

Product repos: same four paths under `./node_modules/@sargonpiraev/fslint-config/`, or GitHub raw + SRI per file. Do not extend `../shared/...`. Config linting is a separate file: `.alint.configlint.yaml` → [`@sargonpiraev/configlint-config`](../configlint-config/).

```yaml
extends:
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/project.yaml#sha256-<hash>
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/cursor.yaml#sha256-<hash>
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/github.yaml#sha256-<hash>
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/webapp.yaml#sha256-<hash>
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/mobapp.yaml#sha256-<hash>
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/extapp.yaml#sha256-<hash>
```

Recompute: `shasum -a 256 shared/packages/fslint-config/*.yaml`. Config lint hashes: `shasum -a 256 shared/packages/configlint-config/*.yaml`.

## License

MIT © Sargon Piraev
