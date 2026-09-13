import { test } from 'node:test'
import { RuleTester } from 'eslint'
import stepsRule from '../../build/plugin/datawh-etl.steps.rule.js'

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
})

const JOB = 'pulumi/datawh/vercel/gcp.cloudfunctions.Function/src/deployments.ts'

const pipeline = `
async function extract() { return [] }
async function transform(raw) { return raw }
async function load(rows) { return rows }
`

test('datawh-etl/extract-transform-load', () => {
  tester.run('extract-transform-load', stepsRule, {
    valid: [
      {
        filename: JOB,
        code: `
          ${pipeline}
          async function run() {
            const raw = await extract()
            const rows = await transform(raw)
            return await load(rows)
          }
          export async function main() {
            return await run()
          }
        `,
      },
      {
        filename: JOB,
        code: `
          ${pipeline}
          export async function main() {
            const raw = await extract()
            const rows = await transform(raw)
            return await load(rows)
          }
        `,
      },
      {
        filename: JOB,
        code: `
          const extract = async () => []
          const transform = async (raw) => raw
          const load = async (rows) => rows
          export async function main() {
            const raw = await extract()
            const rows = await transform(raw)
            return await load(rows)
          }
        `,
      },
      {
        filename: 'pulumi/datawh/vercel/gcp.cloudfunctions.Function/src/index.ts',
        code: 'export { main as deployments } from "./deployments"',
      },
      {
        filename: 'src/other.ts',
        code: 'export async function other() {}',
      },
    ],
    invalid: [
      {
        filename: JOB,
        code: `
          async function transform(raw) { return raw }
          async function load(rows) { return rows }
          async function run() {
            const rows = await transform([])
            return await load(rows)
          }
          export async function main() {
            return await run()
          }
        `,
        errors: [{ messageId: 'missingStep' }, { messageId: 'missingPipeline' }],
      },
      {
        filename: JOB,
        code: `
          ${pipeline}
          async function run() {
            const raw = await extract()
            const rows = await transform(raw)
            return await load(rows)
          }
          export async function deployments() {
            return await run()
          }
        `,
        errors: [{ messageId: 'missingExport' }],
      },
      {
        filename: JOB,
        code: `
          ${pipeline}
          export async function main() {
            return { ok: true }
          }
        `,
        errors: [{ messageId: 'missingPipeline' }],
      },
      {
        filename: JOB,
        code: `
          ${pipeline}
          async function run() {
            const rows = await load([])
            const mapped = await transform(rows)
            return await extract()
          }
          export async function main() {
            return await run()
          }
        `,
        errors: [{ messageId: 'wrongOrder' }],
      },
    ],
  })
})
