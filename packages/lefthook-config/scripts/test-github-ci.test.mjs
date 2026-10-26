import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import {
  failedRuns,
  hasWorkflowsDir,
  parseArgs,
  unfinishedRuns,
  waitForAllRuns,
  waitForRunsToAppear,
} from './test-github-ci.mjs'

describe('parseArgs', () => {
  it('detects help and dry-run', () => {
    assert.deepEqual(parseArgs(['--help']), { help: true, dryRun: false })
    assert.deepEqual(parseArgs(['--dry-run']), { help: false, dryRun: true })
    assert.deepEqual(parseArgs([]), { help: false, dryRun: false })
  })
})

describe('hasWorkflowsDir', () => {
  it('returns false without .github/workflows', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tgci-'))
    try {
      assert.equal(hasWorkflowsDir(dir), false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('returns true when workflows dir exists', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tgci-'))
    try {
      mkdirSync(join(dir, '.github', 'workflows'), { recursive: true })
      assert.equal(hasWorkflowsDir(dir), true)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('run selectors', () => {
  const runs = [
    {
      databaseId: 1,
      status: 'completed',
      conclusion: 'success',
      name: 'ok',
      url: 'https://example/1',
    },
    {
      databaseId: 2,
      status: 'in_progress',
      conclusion: null,
      name: 'busy',
      url: 'https://example/2',
    },
    {
      databaseId: 3,
      status: 'completed',
      conclusion: 'failure',
      name: 'bad',
      url: 'https://example/3',
    },
  ]

  it('unfinishedRuns filters completed', () => {
    assert.equal(unfinishedRuns(runs).length, 1)
    assert.equal(unfinishedRuns(runs)[0].databaseId, 2)
  })

  it('failedRuns keeps non-success completed', () => {
    assert.equal(failedRuns(runs).length, 1)
    assert.equal(failedRuns(runs)[0].databaseId, 3)
  })
})

describe('waitForRunsToAppear', () => {
  it('returns when runs appear', async () => {
    let calls = 0
    const runs = await waitForRunsToAppear({
      sha: 'abc',
      timeoutMs: 1000,
      pollMs: 1,
      sleepFn: async () => {},
      list: () => {
        calls += 1
        return calls < 2
          ? []
          : [
              {
                databaseId: 9,
                status: 'queued',
                conclusion: null,
                name: 'ci',
                url: 'https://example/9',
              },
            ]
      },
      log: () => {},
    })
    assert.equal(runs.length, 1)
    assert.equal(calls, 2)
  })

  it('fails when timeout with no runs', async () => {
    let now = 0
    await assert.rejects(
      () =>
        waitForRunsToAppear({
          sha: 'deadbeef',
          timeoutMs: 10,
          pollMs: 1,
          now: () => now,
          sleepFn: async () => {
            now += 20
          },
          list: () => [],
          log: () => {},
        }),
      /no GitHub Actions runs/
    )
  })
})

describe('waitForAllRuns', () => {
  it('succeeds when all runs complete successfully', async () => {
    const watched = []
    /** @type {import('./test-github-ci.mjs').GhRun[]} */
    let state = [
      {
        databaseId: 1,
        status: 'in_progress',
        conclusion: null,
        name: 'ci',
        url: 'https://example/1',
        workflowName: 'on-push-main',
      },
    ]
    const final = await waitForAllRuns({
      sha: 'abc',
      pollMs: 1,
      sleepFn: async () => {},
      watch: (id) => {
        watched.push(id)
        state = [
          {
            databaseId: 1,
            status: 'completed',
            conclusion: 'success',
            name: 'ci',
            url: 'https://example/1',
            workflowName: 'on-push-main',
          },
        ]
      },
      list: () => state,
      log: () => {},
      runs: state,
    })
    assert.deepEqual(watched, [1])
    assert.equal(final[0].conclusion, 'success')
  })

  it('fails when a run concludes non-success', async () => {
    /** @type {import('./test-github-ci.mjs').GhRun[]} */
    let state = [
      {
        databaseId: 2,
        status: 'in_progress',
        conclusion: null,
        name: 'ci',
        url: 'https://example/2',
      },
    ]
    await assert.rejects(
      () =>
        waitForAllRuns({
          sha: 'abc1234',
          pollMs: 1,
          sleepFn: async () => {},
          watch: () => {
            state = [
              {
                databaseId: 2,
                status: 'completed',
                conclusion: 'failure',
                name: 'ci',
                url: 'https://example/2',
              },
            ]
          },
          list: () => state,
          log: () => {},
          runs: state,
        }),
      /CI failed/
    )
  })
})
