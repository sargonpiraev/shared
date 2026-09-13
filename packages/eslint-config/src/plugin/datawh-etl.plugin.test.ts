import assert from 'node:assert/strict'
import { test } from 'node:test'
import project from '../../build/project.js'
import {
  DATAWH_ETL_FILES,
  DATAWH_ETL_IGNORES,
  configs,
  plugin,
} from '../../build/plugin/datawh-etl.plugin.js'

test('datawh-etl plugin overlays Cloud Function job sources', () => {
  const [overlay] = configs.recommended
  assert.deepEqual(DATAWH_ETL_FILES, ['**/gcp.cloudfunctions.Function/src/*.ts'])
  assert.deepEqual(DATAWH_ETL_IGNORES, [
    '**/gcp.cloudfunctions.Function/src/index.ts',
    '**/lib/**',
    '**/deploy/**',
  ])
  assert.deepEqual(overlay?.files, DATAWH_ETL_FILES)
  assert.deepEqual(overlay?.ignores, DATAWH_ETL_IGNORES)
  assert.equal(overlay?.plugins && 'datawh-etl' in overlay.plugins, true)
  assert.equal(plugin.rules && 'extract-transform-load' in plugin.rules, true)
})

test('project preset enables datawh-etl overlay', () => {
  const overlay = project.find((entry) => entry.name === '@sargonpiraev/datawh-etl')
  const [recommended] = configs.recommended
  assert.deepEqual(overlay?.files, DATAWH_ETL_FILES)
  assert.deepEqual(overlay?.rules, recommended?.rules)
})
