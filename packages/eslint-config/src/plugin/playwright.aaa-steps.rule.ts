import type { Rule } from 'eslint'
import type { CallExpression } from 'estree'
import { isPlaywrightSpecFile, isTestCall, readStepName, reportFilename } from './playwright.ast.js'

const REQUIRED_STEPS = ['arrange', 'act', 'assert'] as const

type Collector = {
  node: CallExpression
  steps: { name: string; range: number }[]
}

const aaaStepsRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Require every Playwright test() to contain test.step('arrange'), test.step('act'), and test.step('assert') string literals in that order",
    },
    schema: [],
    messages: {
      missingStep: "test() must contain test.step('{{step}}') as a string literal.",
      wrongOrder:
        "test.step('arrange'), test.step('act'), and test.step('assert') must appear in that order.",
    },
  },
  create(context) {
    const source = context.sourceCode.text
    const filename = reportFilename(context)
    if (!isPlaywrightSpecFile(filename, source)) return {}

    const stack: Collector[] = []

    function lint(collector: Collector): void {
      const firstIndex: Partial<Record<(typeof REQUIRED_STEPS)[number], number>> = {}
      for (const step of collector.steps) {
        if (
          (step.name === 'arrange' || step.name === 'act' || step.name === 'assert') &&
          firstIndex[step.name] === undefined
        ) {
          firstIndex[step.name] = step.range
        }
      }

      let missing = false
      for (const name of REQUIRED_STEPS) {
        if (firstIndex[name] === undefined) {
          missing = true
          context.report({
            node: collector.node,
            messageId: 'missingStep',
            data: { step: name },
          })
        }
      }
      if (missing) return

      const arrange = firstIndex.arrange as number
      const act = firstIndex.act as number
      const assert = firstIndex.assert as number
      if (!(arrange < act && act < assert)) {
        context.report({
          node: collector.node,
          messageId: 'wrongOrder',
        })
      }
    }

    return {
      CallExpression(node) {
        if (isTestCall(node)) {
          stack.push({ node, steps: [] })
          return
        }
        const current = stack.at(-1)
        if (!current) return
        const step = readStepName(node)
        if (!step) return
        current.steps.push({ name: step.name, range: node.range?.[0] ?? 0 })
      },
      'CallExpression:exit'(node) {
        if (!isTestCall(node)) return
        const collector = stack.pop()
        if (collector) lint(collector)
      },
    }
  },
}

export default aaaStepsRule
