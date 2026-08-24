import { existsSync, readFileSync } from 'node:fs'

const templates = [
  'templates/.cursor__worktrees.json',
  'templates/.nvmrc',
  'templates/.npmrc',
  'templates/project__package.json.schema.json',
  'templates/project__project.json.schema.json',
  'templates/project__turbo.json.schema.json',
  'templates/project__tsconfig.json.schema.json',
  'templates/project__commitlintrc.yaml.schema.json',
  'templates/project__lefthook.yml.schema.json',
  'templates/project__.alint.fslint.yaml.schema.json',
  'templates/project__.alint.configlint.yaml.schema.json',
]

const ids = [
  ['project__package.json.yaml', 'id: project__package.json'],
  ['project__project.json.yaml', 'id: project__project.json'],
  ['project__.nvmrc.yaml', 'id: project__.nvmrc'],
  ['project__.npmrc.yaml', 'id: project__.npmrc'],
  ['project__turbo.json.yaml', 'id: project__turbo.json'],
  ['project__tsconfig.json.yaml', 'id: project__tsconfig.json'],
  ['project__commitlintrc.yaml', 'id: project__commitlintrc.yaml'],
  ['project__eslint.config.mjs.yaml', 'id: project__eslint.config.mjs'],
  ['project__prettier.config.mjs.yaml', 'id: project__prettier.config.mjs'],
  ['project__lefthook.yml.yaml', 'id: project__lefthook.yml'],
  ['project__.cursor__worktrees.json.yaml', 'id: project__.cursor__worktrees.json'],
  ['project__.alint.fslint.yaml.yaml', 'id: project__.alint.fslint.yaml'],
  ['project__.alint.configlint.yaml.yaml', 'id: project__.alint.configlint.yaml'],
  ['webapp__playwright.yaml', 'id: webapp-playwright'],
  ['docapp__playwright.yaml', 'id: docapp-playwright'],
  ['extapp__playwright.yaml', 'id: extapp-playwright'],
]

for (const path of templates) {
  if (!existsSync(path)) process.exit(1)
}
for (const [file, id] of ids) {
  if (!readFileSync(file, 'utf8').includes(id)) process.exit(1)
}
