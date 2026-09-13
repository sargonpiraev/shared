import { test } from 'node:test'
import { RuleTester } from 'eslint'
import aaaStepsRule from '../../build/plugin/playwright.aaa-steps.rule.js'

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
})

const aaa = `
async () => {
  await test.step('arrange', async () => {})
  await test.step('act', async () => {})
  await test.step('assert', async () => {})
}
`

test('playwright-specs/aaa-steps', () => {
  tester.run('aaa-steps', aaaStepsRule, {
    valid: [
      {
        filename: 'apps/webapp/src/app/page.spec.ts',
        code: `test('lists', { tag: '@feat' }, ${aaa})`,
      },
      {
        filename: 'apps/webapp/src/app/page.spec.ts',
        code: `test.skip('lists', { tag: '@feat' }, ${aaa})`,
      },
      {
        filename: 'src/foo.spec.ts',
        code: "test('unit', () => { expect(1).toBe(1) })",
      },
    ],
    invalid: [
      {
        filename: 'apps/webapp/src/app/page.spec.ts',
        code: "test('lists', { tag: '@feat' }, async ({ page }) => { await page.goto('/') })",
        errors: [
          { messageId: 'missingStep' },
          { messageId: 'missingStep' },
          { messageId: 'missingStep' },
        ],
      },
      {
        filename: 'apps/webapp/src/app/page.spec.ts',
        code: `
          test('lists', { tag: '@feat' }, async () => {
            await test.step('assert', async () => {})
            await test.step('act', async () => {})
            await test.step('arrange', async () => {})
          })
        `,
        errors: [{ messageId: 'wrongOrder' }],
      },
    ],
  })
})
