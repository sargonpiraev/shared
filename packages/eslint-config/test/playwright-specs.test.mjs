import { test } from 'node:test'
import { RuleTester } from 'eslint'
import aaaStepsRule from '../build/rules/aaa-steps.js'
import aspectTagsRule from '../build/rules/aspect-tags.js'

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

test('playwright-specs/aspect-tags', () => {
  tester.run('aspect-tags', aspectTagsRule, {
    valid: [
      {
        filename: 'src/foo.spec.ts',
        code: "test('unit', () => { expect(1).toBe(1) })",
      },
      {
        filename: 'e2e/animes.functional.spec.ts',
        code: `test('lists', { tag: '@functional' }, ${aaa})`,
      },
      {
        filename: 'e2e/animes.functional.spec.ts',
        code: `test.describe('group', { tag: '@functional' }, () => { test('lists', ${aaa}) })`,
      },
      {
        filename: 'app/page.spec.ts',
        code: `
          test('f', { tag: '@functional' }, ${aaa})
          test('s', { tag: '@seo' }, ${aaa})
          test('a', { tag: '@analytics' }, ${aaa})
          test('v', { tag: '@visual' }, ${aaa})
          test('c', { tag: '@cwv' }, ${aaa})
        `,
      },
    ],
    invalid: [
      {
        filename: 'e2e/animes.functional.spec.ts',
        code: `test('lists', ${aaa})`,
        errors: [{ messageId: 'missingTag' }],
      },
      {
        filename: 'e2e/animes.functional.spec.ts',
        code: `test('lists', { tag: '@nope' }, ${aaa})`,
        errors: [{ messageId: 'missingTag' }, { messageId: 'unknownTag' }],
      },
      {
        filename: 'app/page.spec.ts',
        code: `test('only functional', { tag: '@functional' }, ${aaa})`,
        errors: [
          { messageId: 'missingTag' },
          { messageId: 'missingTag' },
          { messageId: 'missingTag' },
          { messageId: 'missingTag' },
        ],
      },
    ],
  })
})

test('playwright-specs/aaa-steps', () => {
  tester.run('aaa-steps', aaaStepsRule, {
    valid: [
      {
        filename: 'e2e/animes.functional.spec.ts',
        code: `test('lists', { tag: '@functional' }, ${aaa})`,
      },
      {
        filename: 'e2e/animes.functional.spec.ts',
        code: `test.skip('lists', { tag: '@functional' }, ${aaa})`,
      },
      {
        filename: 'src/foo.spec.ts',
        code: "test('unit', () => { expect(1).toBe(1) })",
      },
    ],
    invalid: [
      {
        filename: 'e2e/animes.functional.spec.ts',
        code: "test('lists', { tag: '@functional' }, async ({ page }) => { await page.goto('/') })",
        errors: [
          { messageId: 'missingStep' },
          { messageId: 'missingStep' },
          { messageId: 'missingStep' },
        ],
      },
      {
        filename: 'e2e/animes.functional.spec.ts',
        code: `
          test('lists', { tag: '@functional' }, async () => {
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
