import fs from 'node:fs'
import path from 'node:path'
import type { ESLint, Linter, Rule } from 'eslint'
import {
  CANONICAL_APP_NAMES,
  COMMITLINT_CONFIG_PACKAGE,
  ENV_CONTRACT_APP_NAMES,
  ESLINT_CONFIG_PACKAGE,
  FORBIDDEN_APP_NAMES,
  PRETTIER_CONFIG_PACKAGE,
  TSCONFIG_PACKAGE_PREFIX,
} from './canonical-apps.js'
import { playwrightConfigRule } from './playwright-config-rule.js'
import { missingPulumiIndexClusterMessages } from './pulumi-index-clusters.js'

function projectRootFromFilename(filename: string): string {
  return path.dirname(filename)
}

function readJsonFile<T>(filePath: string): T | undefined {
  if (!fs.existsSync(filePath)) return undefined
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
  } catch {
    return undefined
  }
}

function listAppDirs(root: string): string[] {
  const appsDir = path.join(root, 'apps')
  if (!fs.existsSync(appsDir) || !fs.statSync(appsDir).isDirectory()) {
    return []
  }
  return fs
    .readdirSync(appsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort()
}

function hasTsconfigExtendsShared(root: string): {
  ok: boolean
  path?: string
  reason?: string
} {
  for (const name of ['tsconfig.json']) {
    const filePath = path.join(root, name)
    const data = readJsonFile<{
      extends?: string | string[]
      compilerOptions?: { strict?: boolean }
    }>(filePath)
    if (!data) continue
    const ext = data.extends
    const list = Array.isArray(ext) ? ext : ext ? [ext] : []
    const hits = list.some((e) => e.startsWith(TSCONFIG_PACKAGE_PREFIX))
    if (!hits) {
      return {
        ok: false,
        path: filePath,
        reason: `${name} must extend ${TSCONFIG_PACKAGE_PREFIX}/base.json`,
      }
    }
    if (data.compilerOptions && data.compilerOptions.strict === false) {
      return {
        ok: false,
        path: filePath,
        reason: `${name} must not set compilerOptions.strict to false`,
      }
    }
    return { ok: true, path: filePath }
  }
  return {
    ok: false,
    reason: `missing root tsconfig.json extending ${TSCONFIG_PACKAGE_PREFIX}`,
  }
}

function envExamplePath(root: string, appKey: string): string {
  if (appKey === '.') return path.join(root, '.env.example')
  return path.join(root, 'apps', appKey, '.env.example')
}

/** Active (non-negation) gitignore patterns from file text. */
export function parseGitignorePatterns(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('!'))
}

function normalizeGitignorePattern(pattern: string): string {
  return pattern.replace(/\/+$/, '')
}

/** True when pattern ignores pulumi/.env (root or nested .gitignore). */
export function patternCoversPulumiEnv(pattern: string): boolean {
  const p = normalizeGitignorePattern(pattern)
  return (
    p === '.env' ||
    p === '**/.env' ||
    p === 'pulumi/.env' ||
    p === '**/pulumi/.env' ||
    p === '.env*' ||
    p === '**/.env*'
  )
}

/** True when pattern ignores pulumi/.pulumi (local state). */
export function patternCoversPulumiState(pattern: string): boolean {
  const p = normalizeGitignorePattern(pattern)
  return (
    p === '.pulumi' ||
    p === '**/.pulumi' ||
    p === 'pulumi/.pulumi' ||
    p === '**/pulumi/.pulumi' ||
    p === '.pulumi/**' ||
    p === '**/.pulumi/**' ||
    p === 'pulumi/.pulumi/**' ||
    p === '**/pulumi/.pulumi/**'
  )
}

/** Root .gitignore must not ignore the whole pulumi/ IaC tree. */
export function patternIgnoresWholePulumiTree(pattern: string): boolean {
  const p = normalizeGitignorePattern(pattern)
  return p === 'pulumi' || p === '/pulumi' || p === 'pulumi/**' || p === '/pulumi/**'
}

/** True when pattern ignores lefthook-local.yml / .yaml (personal Lefthook overrides). */
export function patternCoversLefthookLocal(pattern: string): boolean {
  const p = normalizeGitignorePattern(pattern)
  return (
    p === 'lefthook-local.yml' ||
    p === 'lefthook-local.yaml' ||
    p === 'lefthook-local*' ||
    p === '/lefthook-local.yml' ||
    p === '/lefthook-local.yaml'
  )
}

function readGitignorePatterns(filePath: string): string[] {
  if (!fs.existsSync(filePath)) return []
  return parseGitignorePatterns(fs.readFileSync(filePath, 'utf8'))
}

export type PulumiGitignoreStatus = {
  hasPulumi: boolean
  coversEnv: boolean
  coversState: boolean
  ignoresWholeTree: boolean
}

/**
 * When pulumi/ exists, root .gitignore and/or pulumi/.gitignore must ignore
 * secrets (.env) and local state (.pulumi) — not the whole pulumi/ source tree.
 */
export function getPulumiGitignoreStatus(root: string): PulumiGitignoreStatus {
  const pulumiDir = path.join(root, 'pulumi')
  const hasPulumi = fs.existsSync(pulumiDir) && fs.statSync(pulumiDir).isDirectory()
  if (!hasPulumi) {
    return {
      hasPulumi: false,
      coversEnv: true,
      coversState: true,
      ignoresWholeTree: false,
    }
  }

  const rootPatterns = readGitignorePatterns(path.join(root, '.gitignore'))
  const nestedPatterns = readGitignorePatterns(path.join(pulumiDir, '.gitignore'))
  const combined = [...rootPatterns, ...nestedPatterns]

  return {
    hasPulumi: true,
    coversEnv: combined.some(patternCoversPulumiEnv),
    coversState: combined.some(patternCoversPulumiState),
    ignoresWholeTree: rootPatterns.some(patternIgnoresWholePulumiTree),
  }
}

const inventoryRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Hard project harness: prettier, commitlint, eslint, tsconfig, lefthook, repo apps, env, pulumi, npm token hygiene',
    },
    schema: [],
    messages: {
      missingPrettierConfig:
        'missing prettier.config.mjs (export default from "{{pkg}}"; do not use package.json "prettier" key).',
      missingPrettierDep: 'package.json must list "{{pkg}}" in dependencies or devDependencies.',
      leftoverPrettierKey:
        'package.json must not set "prettier" — use prettier.config.mjs exporting "{{pkg}}" instead.',
      missingCommitlintConfig: 'missing commitlint.config.cjs (extends: ["{{pkg}}"]).',
      missingCommitlintDep: 'package.json must list "{{pkg}}" in dependencies or devDependencies.',
      missingEslintConfig:
        'missing eslint.config.mjs (import/spread "{{pkg}}/project" or "{{pkg}}/project-meta").',
      missingEslintDep: 'package.json must list "{{pkg}}" in dependencies or devDependencies.',
      missingTsconfig: '{{reason}}',
      missingLefthook:
        'missing lefthook.yml (remotes → sargonpiraev/shared configs: [ci/lefthook.yml]; hooks via scripts.prepare → lefthook install).',
      missingLefthookPrepare:
        'package.json scripts.prepare must run lefthook install (wires git hooks on npm ci / npm install).',
      missingLefthookLocalGitignore:
        '.gitignore must ignore lefthook-local.yml (Lefthook personal overrides; only lefthook.yml is committed).',
      forbiddenApp: 'forbidden apps/* name "{{name}}" (use canonical allowlist).',
      unknownApp: 'apps/* "{{name}}" is not in the canonical allowlist.',
      missingTurbo: 'missing turbo.json at project root.',
      flatNextForbidden:
        'flat-root Next project app is forbidden; use turbo monorepo with apps/webapp (etc.).',
      missingEnvExample:
        'env-contract app "{{app}}" requires {{path}} (hand-maintained; no secrets).',
      missingPulumiYaml: 'pulumi/ exists but pulumi/Pulumi.yaml is missing.',
      missingPulumiEntry: 'pulumi/ exists but TypeScript entry missing (index.ts or src/index.ts).',
      missingPulumiScripts:
        'pulumi/ exists but package.json scripts must include pulumi:preview and pulumi:up.',
      missingPulumiEnvExample:
        'pulumi/ exists but pulumi/.env.example is missing (hand-maintained token contract; no secrets).',
      missingPulumiGitignoreEnv:
        'pulumi/ exists but .gitignore must ignore pulumi/.env (e.g. .env, **/.env, or pulumi/.env) — not the whole pulumi/ tree.',
      missingPulumiGitignoreState:
        'pulumi/ exists but .gitignore must ignore local state .pulumi/ (e.g. .pulumi/, **/.pulumi/, or pulumi/.pulumi/).',
      pulumiGitignoreWholeTree:
        'pulumi/ exists: do not gitignore the whole pulumi/ source tree — ignore secrets/state only (.env, .pulumi/).',
      missingPulumiAppCluster: '{{reason}}',
      npmrcToken:
        'committed .npmrc must not contain npm tokens / auth (use Trusted Publishing OIDC).',
      missingTestCwv:
        'webapp/docapp (or flat-root playwright.config.ts) requires package.json scripts.test:cwv (Core Web Vitals lab lane; not part of test:spec).',
      forbiddenTestLint:
        'package.json must not define scripts.test:lint — use scripts.test:eslint (tool-named).',
      forbiddenTestAlint:
        'package.json must not define scripts.test:alint — use scripts.test:fslint (file structure linting; engine remains alint).',
    },
  },
  create(context) {
    const root = projectRootFromFilename(context.filename)

    return {
      Program(node) {
        const pkg = readJsonFile<{
          prettier?: unknown
          scripts?: Record<string, string>
          dependencies?: Record<string, string>
          devDependencies?: Record<string, string>
        }>(context.filename)
        if (!pkg) return

        if (pkg.scripts?.['test:lint'] !== undefined) {
          context.report({ node, messageId: 'forbiddenTestLint' })
        }
        if (pkg.scripts?.['test:alint'] !== undefined) {
          context.report({ node, messageId: 'forbiddenTestAlint' })
        }

        if (pkg.prettier !== undefined) {
          context.report({
            node,
            messageId: 'leftoverPrettierKey',
            data: { pkg: PRETTIER_CONFIG_PACKAGE },
          })
        }

        if (!fs.existsSync(path.join(root, 'prettier.config.mjs'))) {
          context.report({
            node,
            messageId: 'missingPrettierConfig',
            data: { pkg: PRETTIER_CONFIG_PACKAGE },
          })
        }

        const hasPrettierDep =
          Boolean(pkg.dependencies?.[PRETTIER_CONFIG_PACKAGE]) ||
          Boolean(pkg.devDependencies?.[PRETTIER_CONFIG_PACKAGE])
        if (!hasPrettierDep) {
          context.report({
            node,
            messageId: 'missingPrettierDep',
            data: { pkg: PRETTIER_CONFIG_PACKAGE },
          })
        }

        if (!fs.existsSync(path.join(root, 'commitlint.config.cjs'))) {
          context.report({
            node,
            messageId: 'missingCommitlintConfig',
            data: { pkg: COMMITLINT_CONFIG_PACKAGE },
          })
        }

        const hasCommitlintDep =
          Boolean(pkg.dependencies?.[COMMITLINT_CONFIG_PACKAGE]) ||
          Boolean(pkg.devDependencies?.[COMMITLINT_CONFIG_PACKAGE])
        if (!hasCommitlintDep) {
          context.report({
            node,
            messageId: 'missingCommitlintDep',
            data: { pkg: COMMITLINT_CONFIG_PACKAGE },
          })
        }

        if (!fs.existsSync(path.join(root, 'eslint.config.mjs'))) {
          context.report({
            node,
            messageId: 'missingEslintConfig',
            data: { pkg: ESLINT_CONFIG_PACKAGE },
          })
        }

        const hasEslintDep =
          Boolean(pkg.dependencies?.[ESLINT_CONFIG_PACKAGE]) ||
          Boolean(pkg.devDependencies?.[ESLINT_CONFIG_PACKAGE])
        if (!hasEslintDep) {
          context.report({
            node,
            messageId: 'missingEslintDep',
            data: { pkg: ESLINT_CONFIG_PACKAGE },
          })
        }

        if (
          !fs.existsSync(path.join(root, 'lefthook.yml')) &&
          !fs.existsSync(path.join(root, 'lefthook.yaml'))
        ) {
          context.report({ node, messageId: 'missingLefthook' })
        }

        const prepare = pkg.scripts?.prepare ?? ''
        if (!/lefthook\s+install/.test(prepare)) {
          context.report({ node, messageId: 'missingLefthookPrepare' })
        }

        const rootGitignorePatterns = readGitignorePatterns(path.join(root, '.gitignore'))
        if (!rootGitignorePatterns.some(patternCoversLefthookLocal)) {
          context.report({ node, messageId: 'missingLefthookLocalGitignore' })
        }

        const diskApps = listAppDirs(root)
        const needsCwvScript =
          diskApps.includes('webapp') ||
          diskApps.includes('docapp') ||
          fs.existsSync(path.join(root, 'playwright.config.ts'))
        if (needsCwvScript && !pkg.scripts?.['test:cwv']) {
          context.report({ node, messageId: 'missingTestCwv' })
        }

        const ts = hasTsconfigExtendsShared(root)
        if (!ts.ok) {
          context.report({
            node,
            messageId: 'missingTsconfig',
            data: { reason: ts.reason ?? 'invalid tsconfig' },
          })
        }

        const npmrcPath = path.join(root, '.npmrc')
        if (fs.existsSync(npmrcPath)) {
          const npmrc = fs.readFileSync(npmrcPath, 'utf8')
          if (/(_authToken|authToken|NPM_TOKEN|\/\/registry\.npmjs\.org\/:_auth)/i.test(npmrc)) {
            context.report({ node, messageId: 'npmrcToken' })
          }
        }

        for (const name of diskApps) {
          if ((FORBIDDEN_APP_NAMES as readonly string[]).includes(name)) {
            context.report({
              node,
              messageId: 'forbiddenApp',
              data: { name },
            })
          } else if (!(CANONICAL_APP_NAMES as readonly string[]).includes(name)) {
            context.report({
              node,
              messageId: 'unknownApp',
              data: { name },
            })
          }
        }

        const deps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        }
        const hasNext = Boolean(deps?.next)
        if (hasNext && diskApps.length === 0) {
          context.report({ node, messageId: 'flatNextForbidden' })
        }

        if (!fs.existsSync(path.join(root, 'turbo.json'))) {
          context.report({ node, messageId: 'missingTurbo' })
        }

        const pulumiDir = path.join(root, 'pulumi')
        if (fs.existsSync(pulumiDir) && fs.statSync(pulumiDir).isDirectory()) {
          if (!fs.existsSync(path.join(pulumiDir, 'Pulumi.yaml'))) {
            context.report({ node, messageId: 'missingPulumiYaml' })
          }
          const entryPath = path.join(pulumiDir, 'index.ts')
          const fallback = path.join(pulumiDir, 'src', 'index.ts')
          if (!fs.existsSync(entryPath) && !fs.existsSync(fallback)) {
            context.report({ node, messageId: 'missingPulumiEntry' })
          }
          const scripts = pkg.scripts ?? {}
          if (!scripts['pulumi:preview'] || !scripts['pulumi:up']) {
            context.report({ node, messageId: 'missingPulumiScripts' })
          }
          if (!fs.existsSync(path.join(pulumiDir, '.env.example'))) {
            context.report({ node, messageId: 'missingPulumiEnvExample' })
          }
          const gi = getPulumiGitignoreStatus(root)
          if (gi.ignoresWholeTree) {
            context.report({ node, messageId: 'pulumiGitignoreWholeTree' })
          }
          if (!gi.coversEnv) {
            context.report({ node, messageId: 'missingPulumiGitignoreEnv' })
          }
          if (!gi.coversState) {
            context.report({ node, messageId: 'missingPulumiGitignoreState' })
          }
          const pulumiEntry = fs.existsSync(entryPath)
            ? entryPath
            : fs.existsSync(fallback)
              ? fallback
              : ''
          if (pulumiEntry) {
            const indexSource = fs.readFileSync(pulumiEntry, 'utf8')
            for (const reason of missingPulumiIndexClusterMessages(root, indexSource)) {
              context.report({
                node,
                messageId: 'missingPulumiAppCluster',
                data: { reason },
              })
            }
          }
        }

        for (const app of diskApps) {
          if (!(ENV_CONTRACT_APP_NAMES as readonly string[]).includes(app)) {
            continue
          }
          const example = envExamplePath(root, app)
          if (!fs.existsSync(example)) {
            context.report({
              node,
              messageId: 'missingEnvExample',
              data: {
                app,
                path: path.relative(root, example),
              },
            })
          }
        }
      },
    }
  },
}

const workflowTokenRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Forbid NPM_TOKEN / NODE_AUTH_TOKEN in on-push-main workflow (OIDC Trusted Publishing)',
    },
    schema: [],
    messages: {
      npmToken:
        'workflow must not reference {{token}} — use npm Trusted Publishing (OIDC), not npm tokens.',
      missingIdToken:
        'npm publish / release job should set permissions.id-token: write for Trusted Publishing.',
    },
  },
  create(context) {
    return {
      Program(node) {
        const text = fs.readFileSync(context.filename, 'utf8')
        // Strip YAML comments / ignore documentary mentions of banned tokens.
        const code = text
          .split('\n')
          .map((line) => line.replace(/#.*$/, ''))
          .join('\n')
        for (const token of ['NPM_TOKEN', 'NODE_AUTH_TOKEN']) {
          if (code.includes(token)) {
            context.report({
              node,
              messageId: 'npmToken',
              data: { token },
            })
          }
        }
        const publishes = /npm publish|multi-semantic-release|semantic-release/i.test(text)
        if (publishes && !/id-token:\s*write/.test(text)) {
          context.report({ node, messageId: 'missingIdToken' })
        }
      },
    }
  },
}

const pulumiGitignoreRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'When pulumi/ exists, .gitignore must ignore .env + .pulumi state (not the whole pulumi/ tree)',
    },
    schema: [],
    messages: {
      missingPulumiGitignoreEnv:
        'pulumi/ exists but .gitignore must ignore pulumi/.env (e.g. .env, **/.env, or pulumi/.env) — not the whole pulumi/ tree.',
      missingPulumiGitignoreState:
        'pulumi/ exists but .gitignore must ignore local state .pulumi/ (e.g. .pulumi/, **/.pulumi/, or pulumi/.pulumi/).',
      pulumiGitignoreWholeTree:
        'pulumi/ exists: do not gitignore the whole pulumi/ source tree — ignore secrets/state only (.env, .pulumi/).',
    },
  },
  create(context) {
    const diskPath = context.physicalFilename || context.filename.replace(/\/\d+\.js$/, '')
    const root = path.dirname(diskPath)
    return {
      Program(node) {
        const gi = getPulumiGitignoreStatus(root)
        if (!gi.hasPulumi) return
        if (gi.ignoresWholeTree) {
          context.report({ node, messageId: 'pulumiGitignoreWholeTree' })
        }
        if (!gi.coversEnv) {
          context.report({ node, messageId: 'missingPulumiGitignoreEnv' })
        }
        if (!gi.coversState) {
          context.report({ node, messageId: 'missingPulumiGitignoreState' })
        }
      },
    }
  },
}

/** Turn non-JS files into a tiny JS module so ESLint can attach rules. */
function passthroughProcessor(name: string): Linter.Processor {
  return {
    meta: {
      name,
      version: '0.0.0',
    },
    preprocess() {
      return ['\n']
    },
    postprocess(messages: Linter.LintMessage[][]) {
      return messages[0] ?? []
    },
  }
}

const gitignoreProcessor = passthroughProcessor('gitignore')
const playwrightConfigProcessor = passthroughProcessor('playwright-config')

export const projectHarnessPlugin: ESLint.Plugin = {
  meta: {
    name: '@sargonpiraev/eslint-config/project-harness',
    version: '0.0.0',
  },
  processors: {
    gitignore: gitignoreProcessor,
    'playwright-config': playwrightConfigProcessor,
  },
  rules: {
    inventory: inventoryRule,
    'workflow-no-npm-token': workflowTokenRule,
    'pulumi-gitignore': pulumiGitignoreRule,
    'playwright-config': playwrightConfigRule,
  },
}
