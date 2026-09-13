import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from '@jest/globals'
import { assertIndexInstantiatesAppClusters } from './assert-index-clusters.js'

function tmpRepo(apps: string[]): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pulumi-apps-index-'))
  for (const app of apps) {
    fs.mkdirSync(path.join(root, 'apps', app), { recursive: true })
  }
  return root
}

describe('assertIndexInstantiatesAppClusters', () => {
  it('passes when index constructs Webapp for apps/webapp', () => {
    expect(() =>
      assertIndexInstantiatesAppClusters({
        repoRoot: tmpRepo(['webapp']),
        indexSource: "new Webapp({\n  datasetId: 'x',\n})",
      })
    ).not.toThrow()
  })

  it('fails when apps/webapp exists but index never constructs Webapp', () => {
    expect(() =>
      assertIndexInstantiatesAppClusters({
        repoRoot: tmpRepo(['webapp']),
        indexSource: 'export const x = 1',
      })
    ).toThrow('new Webapp')
  })

  it('does not accept helper wrappers', () => {
    expect(() =>
      assertIndexInstantiatesAppClusters({
        repoRoot: tmpRepo(['webapp']),
        indexSource: 'createWebappProductAnalytics({})',
      })
    ).toThrow('new Webapp')
  })

  it('ignores commented-out constructors', () => {
    expect(() =>
      assertIndexInstantiatesAppClusters({
        repoRoot: tmpRepo(['webapp']),
        indexSource: '// new Webapp()\n/* new Webapp( */',
      })
    ).toThrow('pulumi/index.ts')
  })

  it('treats apps/docapp like webapp', () => {
    expect(() =>
      assertIndexInstantiatesAppClusters({
        repoRoot: tmpRepo(['docapp']),
        indexSource: 'export const x = 1',
      })
    ).toThrow('apps/docapp')
  })

  it('requires Extapp and Mobapp when those app dirs exist', () => {
    expect(() =>
      assertIndexInstantiatesAppClusters({
        repoRoot: tmpRepo(['extapp', 'mobapp']),
        indexSource: 'new Extapp({})\nnew Mobapp({})',
      })
    ).not.toThrow()
    expect(() =>
      assertIndexInstantiatesAppClusters({
        repoRoot: tmpRepo(['extapp']),
        indexSource: 'export const x = 1',
      })
    ).toThrow('new Extapp')
  })

  it('does not skip Webapp for a defer marker file', () => {
    const root = tmpRepo(['webapp'])
    fs.mkdirSync(path.join(root, 'pulumi'))
    fs.writeFileSync(path.join(root, 'pulumi', 'defer-webapp-cluster'), 'parked\n')
    expect(() =>
      assertIndexInstantiatesAppClusters({
        repoRoot: root,
        indexSource: 'export const x = 1',
      })
    ).toThrow('new Webapp')
  })

  it('does not require a cluster when the app dir is absent', () => {
    expect(() =>
      assertIndexInstantiatesAppClusters({
        repoRoot: tmpRepo([]),
        indexSource: 'export const x = 1',
      })
    ).not.toThrow()
  })
})
