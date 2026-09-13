import assert from 'node:assert/strict'
import { test } from 'node:test'
import project from '../../build/project.js'
import { PLAYWRIGHT_SPEC_FILES, configs, plugin } from '../../build/plugin/playwright.plugin.js'

test('playwright plugin owns the page.spec overlay', () => {
  const [overlay] = configs.recommended
  assert.deepEqual(PLAYWRIGHT_SPEC_FILES, [
    '**/apps/webapp/src/app/**/page.spec.{ts,tsx,js,mjs}',
    '**/apps/docapp/src/app/**/page.spec.{ts,tsx,js,mjs}',
  ])
  assert.deepEqual(overlay?.files, PLAYWRIGHT_SPEC_FILES)
  assert.equal(overlay?.plugins && 'playwright-specs' in overlay.plugins, true)
  assert.equal(plugin.rules && 'aspect-tags' in plugin.rules, true)
  assert.equal(plugin.rules && 'aaa-steps' in plugin.rules, true)
  assert.ok(!PLAYWRIGHT_SPEC_FILES.some((glob) => glob.includes('feat')))
  assert.ok(!PLAYWRIGHT_SPEC_FILES.some((glob) => glob.includes('e2e')))
})

test('project preset only enables the plugin overlay', () => {
  const overlay = project.find((entry) => entry.name === '@sargonpiraev/playwright-specs')
  const [recommended] = configs.recommended
  assert.deepEqual(overlay?.files, PLAYWRIGHT_SPEC_FILES)
  assert.deepEqual(overlay?.rules, recommended?.rules)
})
