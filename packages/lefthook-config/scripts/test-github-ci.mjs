#!/usr/bin/env node
/**
 * Wait for GitHub Actions on HEAD after push.
 *
 * Multi-run rule (fail-fast): wait for **every** workflow run for the SHA.
 * Exit 0 only when each run concludes `success`. Any other conclusion fails.
 * No `.github/workflows` → exit 0 with a clear log (libs without CI).
 *
 * Usage:
 *   node …/test-github-ci.mjs
 *   node …/test-github-ci.mjs --help
 *   node …/test-github-ci.mjs --dry-run
 */

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export const APPEAR_TIMEOUT_MS = 120_000
export const APPEAR_POLL_MS = 5_000
export const WATCH_POLL_MS = 5_000

const HELP = `test:github:ci — wait for GitHub Actions on HEAD

Resolves HEAD SHA, waits until workflow runs appear (~2 min), then watches
every run for that commit until complete. Fails if any conclusion ≠ success.

Multi-run rule: wait for ALL workflow runs listed for the SHA (not only
on-push-main). Fail-fast if workflows exist but none appear within ~2 min.

Options:
  --help      Show this help
  --dry-run   Resolve SHA / workflows / gh auth; list matching runs; do not watch
`

/**
 * @param {string[]} argv
 */
export function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('-')))
  return {
    help: flags.has('--help') || flags.has('-h'),
    dryRun: flags.has('--dry-run'),
  }
}

/**
 * @param {string} cwd
 */
export function hasWorkflowsDir(cwd = process.cwd()) {
  return existsSync(join(cwd, '.github', 'workflows'))
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {{ cwd?: string }} [opts]
 */
export function runCapture(command, args, opts = {}) {
  const result = spawnSync(command, args, {
    cwd: opts.cwd ?? process.cwd(),
    encoding: 'utf8',
    env: process.env,
  })
  return {
    status: result.status ?? 1,
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? '').trim(),
    error: result.error,
  }
}

/**
 * @param {string} cwd
 */
export function requireGh(cwd = process.cwd()) {
  const which = runCapture('gh', ['--version'], { cwd })
  if (which.error || which.status !== 0) {
    throw new Error('gh CLI is required for test:github:ci (install GitHub CLI and retry)')
  }
  const auth = runCapture('gh', ['auth', 'status'], { cwd })
  if (auth.status !== 0) {
    throw new Error('gh is not authenticated (run `gh auth login` and retry)')
  }
}

/**
 * @param {string} cwd
 */
export function headSha(cwd = process.cwd()) {
  const result = runCapture('git', ['rev-parse', 'HEAD'], { cwd })
  if (result.status !== 0 || !result.stdout) {
    throw new Error(`failed to resolve HEAD: ${result.stderr || result.stdout || 'unknown'}`)
  }
  return result.stdout
}

/**
 * @typedef {{ databaseId: number, status: string, conclusion: string | null, name: string, url: string, workflowName?: string }} GhRun
 */

/**
 * @param {string} sha
 * @param {string} cwd
 * @returns {GhRun[]}
 */
export function listRunsForSha(sha, cwd = process.cwd()) {
  const result = runCapture(
    'gh',
    [
      'run',
      'list',
      '--commit',
      sha,
      '--limit',
      '50',
      '--json',
      'databaseId,status,conclusion,name,url,workflowName',
    ],
    { cwd }
  )
  if (result.status !== 0) {
    throw new Error(`gh run list failed: ${result.stderr || result.stdout || 'unknown'}`)
  }
  if (!result.stdout) return []
  /** @type {GhRun[]} */
  return JSON.parse(result.stdout)
}

/**
 * @param {GhRun[]} runs
 */
export function unfinishedRuns(runs) {
  return runs.filter((r) => r.status !== 'completed')
}

/**
 * @param {GhRun[]} runs
 */
export function failedRuns(runs) {
  return runs.filter((r) => r.status === 'completed' && r.conclusion !== 'success')
}

/**
 * @param {number} ms
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * @param {{
 *   sha: string
 *   cwd?: string
 *   timeoutMs?: number
 *   pollMs?: number
 *   now?: () => number
 *   list?: (sha: string, cwd: string) => GhRun[]
 *   sleepFn?: (ms: number) => Promise<void>
 *   log?: (msg: string) => void
 * }} opts
 */
export async function waitForRunsToAppear(opts) {
  const cwd = opts.cwd ?? process.cwd()
  const timeoutMs = opts.timeoutMs ?? APPEAR_TIMEOUT_MS
  const pollMs = opts.pollMs ?? APPEAR_POLL_MS
  const now = opts.now ?? Date.now
  const list = opts.list ?? listRunsForSha
  const sleepFn = opts.sleepFn ?? sleep
  const log = opts.log ?? console.log
  const started = now()

  for (;;) {
    const runs = list(opts.sha, cwd)
    if (runs.length > 0) {
      log(`found ${runs.length} workflow run(s) for ${opts.sha.slice(0, 7)}`)
      return runs
    }
    if (now() - started >= timeoutMs) {
      throw new Error(
        `no GitHub Actions runs for ${opts.sha} within ${Math.round(timeoutMs / 1000)}s (workflows exist — fail-fast)`
      )
    }
    log(`waiting for workflow runs for ${opts.sha.slice(0, 7)}…`)
    await sleepFn(pollMs)
  }
}

/**
 * Watch every run for the SHA until all complete successfully.
 * Late-starting runs (listed after earlier ones finish) are included.
 *
 * @param {{
 *   runs: GhRun[]
 *   cwd?: string
 *   pollMs?: number
 *   list?: (sha: string, cwd: string) => GhRun[]
 *   sha: string
 *   sleepFn?: (ms: number) => Promise<void>
 *   watch?: (id: number, cwd: string) => void
 *   log?: (msg: string) => void
 * }} opts
 */
export async function waitForAllRuns(opts) {
  const cwd = opts.cwd ?? process.cwd()
  const pollMs = opts.pollMs ?? WATCH_POLL_MS
  const list = opts.list ?? listRunsForSha
  const sleepFn = opts.sleepFn ?? sleep
  const log = opts.log ?? console.log
  const watch =
    opts.watch ??
    ((id, watchCwd) => {
      const result = runCapture('gh', ['run', 'watch', String(id), '--exit-status'], {
        cwd: watchCwd,
      })
      if (result.status !== 0) {
        throw new Error(
          `gh run watch ${id} failed (exit ${result.status}): ${result.stderr || result.stdout}`
        )
      }
    })

  const watched = new Set()
  let runs = opts.runs

  for (;;) {
    for (const run of unfinishedRuns(runs)) {
      if (watched.has(run.databaseId)) continue
      watched.add(run.databaseId)
      log(`watching ${run.workflowName || run.name} (#${run.databaseId})…`)
      watch(run.databaseId, cwd)
    }

    runs = list(opts.sha, cwd)
    if (runs.length === 0) {
      throw new Error(`workflow runs for ${opts.sha} disappeared while watching`)
    }

    const pending = unfinishedRuns(runs)
    if (pending.length > 0) {
      await sleepFn(pollMs)
      continue
    }

    const bad = failedRuns(runs)
    if (bad.length > 0) {
      const detail = bad
        .map((r) => `${r.workflowName || r.name} → ${r.conclusion} (${r.url})`)
        .join('\n')
      throw new Error(`CI failed for ${opts.sha.slice(0, 7)}:\n${detail}`)
    }

    // One more list in case a late run appeared after the last completion.
    await sleepFn(pollMs)
    const again = list(opts.sha, cwd)
    if (unfinishedRuns(again).length > 0 || failedRuns(again).length > 0) {
      runs = again
      continue
    }

    log(`all ${again.length} workflow run(s) succeeded for ${opts.sha.slice(0, 7)}`)
    return again
  }
}

/**
 * @param {{ cwd?: string, argv?: string[], log?: (msg: string) => void }} [opts]
 */
export async function main(opts = {}) {
  const cwd = opts.cwd ?? process.cwd()
  const log = opts.log ?? console.log
  const { help, dryRun } = parseArgs(opts.argv ?? process.argv.slice(2))

  if (help) {
    log(HELP.trimEnd())
    return 0
  }

  if (!hasWorkflowsDir(cwd)) {
    log('test:github:ci: no .github/workflows — skip')
    return 0
  }

  requireGh(cwd)
  const sha = headSha(cwd)
  log(`test:github:ci: HEAD ${sha}`)

  if (dryRun) {
    const runs = listRunsForSha(sha, cwd)
    log(`dry-run: ${runs.length} run(s) currently listed for this SHA`)
    for (const r of runs) {
      log(
        `  - ${r.workflowName || r.name} #${r.databaseId} ${r.status}/${r.conclusion ?? '—'} ${r.url}`
      )
    }
    return 0
  }

  const appeared = await waitForRunsToAppear({ sha, cwd, log })
  await waitForAllRuns({ sha, cwd, runs: appeared, log })
  return 0
}

const invoked = process.argv[1] ?? ''
if (invoked.endsWith('test-github-ci.mjs')) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      console.error(err instanceof Error ? err.message : err)
      process.exit(1)
    }
  )
}
