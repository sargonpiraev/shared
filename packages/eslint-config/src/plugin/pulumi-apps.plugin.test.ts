import assert from 'node:assert/strict'
import { test } from 'node:test'
import project from '../../build/project.js'
import { PULUMI_APP_FILES, configs, plugin } from '../../build/plugin/pulumi-apps.plugin.js'

test('pulumi-apps plugin overlays apps/*/pulumi.ts', () => {
  const [overlay] = configs.recommended
  assert.deepEqual(PULUMI_APP_FILES, ['**/apps/*/pulumi.ts'])
  assert.deepEqual(overlay?.files, PULUMI_APP_FILES)
  assert.equal(overlay?.plugins && 'pulumi-apps' in overlay.plugins, true)
  assert.equal(plugin.rules && 'no-process-env' in plugin.rules, true)
})

test('project preset enables pulumi-apps env overlay', () => {
  const overlay = project.find((entry) => entry.name === '@sargonpiraev/pulumi-apps-env')
  const [recommended] = configs.recommended
  assert.deepEqual(overlay?.files, PULUMI_APP_FILES)
  assert.deepEqual(overlay?.rules, recommended?.rules)
})
