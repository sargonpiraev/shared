# `@sargonpiraev/fslint-config`

Shared **alint** rules for file structure linting (`test:fslint` → `alint check`).

This package is the SSOT leaf (no nested `extends:`). Remote HTTP bodies cannot nest `extends:`.

## Usage

### Shared monorepo (in-tree)

```yaml
# .alint.yml
version: 1
extends:
  - ./packages/fslint-config/project.yml
```

### Product repos

Do not extend `../shared/...`. After this package is published, prefer the install path (inside the git boundary):

```yaml
# .alint.yml
version: 1
extends:
  - ./node_modules/@sargonpiraev/fslint-config/project.yml
```

Until then, pin GitHub raw + SRI:

```yaml
extends:
  - https://raw.githubusercontent.com/sargonpiraev/shared/main/packages/fslint-config/project.yml#sha256-<hash>
```

Recompute: `shasum -a 256 shared/packages/fslint-config/project.yml`.

## License

MIT © Sargon Piraev
