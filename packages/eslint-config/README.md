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

## License

MIT © Sargon Piraev
