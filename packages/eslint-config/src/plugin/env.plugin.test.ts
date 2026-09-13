import assert from 'node:assert/strict'
import { test } from 'node:test'
import project from '../../build/project.js'
import { ENV_APP_FILES, ENV_APP_IGNORES, configs, plugin } from '../../build/plugin/env.plugin.js'

test('app-env plugin scopes to webapp and docapp, skips pulumi', () => {
  const [overlay] = configs.recommended
  assert.deepEqual(overlay?.files, ENV_APP_FILES)
  assert.deepEqual(overlay?.ignores, ENV_APP_IGNORES)
  assert.ok(ENV_APP_IGNORES.includes('**/pulumi.ts'))
  assert.ok(ENV_APP_IGNORES.includes('**/pulumi/**'))
  assert.equal(overlay?.plugins && 'app-env' in overlay.plugins, true)
  assert.equal(plugin.rules && 'no-raw-process-env' in plugin.rules, true)
})

test('project preset enables app-env overlay', () => {
  const overlay = project.find((entry) => entry.name === '@sargonpiraev/app-env')
  const [recommended] = configs.recommended
  assert.deepEqual(overlay?.files, ENV_APP_FILES)
  assert.deepEqual(overlay?.rules, recommended?.rules)
})
