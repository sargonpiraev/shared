# `@sargonpiraev/commitlint-config`

Shared Commitlint config for portfolio products and the `packages` monorepo.

Extends `@commitlint/config-conventional`.

## Usage

At product / repo / meta root — **`commitlint.config.cjs`**:

```js
module.exports = {
  extends: ['@sargonpiraev/commitlint-config'],
}
```

```json
{
  "devDependencies": {
    "@commitlint/cli": "^21.2.1",
    "@sargonpiraev/commitlint-config": "*"
  }
}
```

Do not extend `@commitlint/config-conventional` directly at the repo root — use this package so portfolio defaults stay in one place.

## Commitizen (human CLI only)

Same Conventional Commits types as Commitlint. **Agents never run the wizard** — they write `git commit -m` (Commitlint still gates the string). Humans in this package (or a root that copies the `config.commitizen` block) can run `npx cz`.

```json
{
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

Do not wire `prepare-commit-msg` + `cz --hook`: `git commit -m` from agents would hang or fail.

## License

MIT © Sargon Piraev
