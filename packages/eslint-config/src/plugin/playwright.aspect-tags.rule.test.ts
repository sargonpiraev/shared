import { test } from 'node:test'
import { RuleTester } from 'eslint'
import aspectTagsRule from '../../build/plugin/playwright.aspect-tags.rule.js'

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
        filename: 'apps/webapp/src/app/page.spec.ts',
        code: `
          test.describe('feat', { tag: '@feat' }, () => { test('lists', ${aaa}) })
          test.describe('seokit', { tag: '@seokit' }, () => { test('meta', ${aaa}) })
          test.describe('analytics', { tag: '@analytics' }, () => { test('ga', ${aaa}) })
          test.describe('visual', { tag: '@visual' }, () => { test('shot', ${aaa}) })
          test.describe('perf', { tag: '@perf' }, () => { test('lcp', ${aaa}) })
        `,
      },
      {
        filename: 'apps/webapp/src/app/page.spec.ts',
        code: `
          test('f', { tag: '@feat' }, ${aaa})
          test('s', { tag: '@seokit' }, ${aaa})
          test('a', { tag: '@analytics' }, ${aaa})
          test('v', { tag: '@visual' }, ${aaa})
          test('c', { tag: '@perf' }, ${aaa})
        `,
      },
    ],
    invalid: [
      {
        filename: 'apps/webapp/src/app/page.spec.ts',
        code: `test('lists', ${aaa})`,
        errors: [
          { messageId: 'missingTag' },
          { messageId: 'missingTag' },
          { messageId: 'missingTag' },
          { messageId: 'missingTag' },
          { messageId: 'missingTag' },
        ],
      },
      {
        filename: 'apps/webapp/src/app/page.spec.ts',
        code: `test('lists', { tag: '@nope' }, ${aaa})`,
        errors: [
          { messageId: 'missingTag' },
          { messageId: 'missingTag' },
          { messageId: 'missingTag' },
          { messageId: 'missingTag' },
          { messageId: 'missingTag' },
          { messageId: 'unknownTag' },
        ],
      },
      {
        filename: 'apps/webapp/src/app/page.spec.ts',
        code: `test('only feat', { tag: '@feat' }, ${aaa})`,
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
