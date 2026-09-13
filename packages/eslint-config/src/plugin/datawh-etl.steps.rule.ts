import type { Rule } from 'eslint'
import type { Node } from 'estree'

const JOB_FILE = /(?:^|\/)gcp\.cloudfunctions\.Function\/src\/([^/]+)\.ts$/
const STEPS = ['extract', 'transform', 'load'] as const
const PIPELINE = new Set<string>(STEPS)
const HTTP_EXPORT = 'main'

function stemFromFilename(filename: string): string | null {
  const match = JOB_FILE.exec(filename.replaceAll('\\', '/'))
  if (!match) return null
  const stem = match[1]
  if (stem == null || stem === 'index') return null
  return stem
}

const SKIP_KEYS = new Set(['parent', 'tokens', 'comments', 'loc', 'range', 'start', 'end'])

function walk(node: unknown, visit: (n: Node) => void): void {
  if (node == null || typeof node !== 'object') return
  const current = node as Node & Record<string, unknown>
  if (typeof current.type !== 'string') return
  visit(current)
  for (const [key, value] of Object.entries(current)) {
    if (SKIP_KEYS.has(key)) continue
    if (Array.isArray(value)) {
      for (const item of value) walk(item, visit)
    } else {
      walk(value, visit)
    }
  }
}

function functionName(node: Node): string | undefined {
  if (node.type === 'FunctionDeclaration' && node.id?.type === 'Identifier') {
    return node.id.name
  }
  if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
    const init = node.init
    if (init && (init.type === 'FunctionExpression' || init.type === 'ArrowFunctionExpression')) {
      return node.id.name
    }
  }
  return undefined
}

function functionBody(node: Node): Node | undefined {
  if (node.type === 'FunctionDeclaration') return node
  if (
    node.type === 'VariableDeclarator' &&
    node.init &&
    (node.init.type === 'FunctionExpression' || node.init.type === 'ArrowFunctionExpression')
  ) {
    return node.init
  }
  return undefined
}

function isExported(node: Node, ancestors: Node[]): boolean {
  if (node.type === 'FunctionDeclaration') {
    const parent = ancestors.at(-1)
    return parent?.type === 'ExportNamedDeclaration'
  }
  if (node.type === 'VariableDeclarator') {
    const declaration = ancestors.at(-1)
    const exported = ancestors.at(-2)
    return (
      declaration?.type === 'VariableDeclaration' && exported?.type === 'ExportNamedDeclaration'
    )
  }
  return false
}

function isAsyncFunction(node: Node): boolean {
  if (node.type === 'FunctionDeclaration') return node.async === true
  if (
    node.type === 'VariableDeclarator' &&
    node.init &&
    (node.init.type === 'FunctionExpression' || node.init.type === 'ArrowFunctionExpression')
  ) {
    return node.init.async === true
  }
  return false
}

function awaitedCalleeNames(fn: Node): { name: string; range: number }[] {
  const names: { name: string; range: number }[] = []
  walk(fn, (n) => {
    if (n.type !== 'AwaitExpression') return
    const argument = n.argument
    if (argument.type !== 'CallExpression') return
    if (argument.callee.type !== 'Identifier') return
    names.push({
      name: argument.callee.name,
      range: argument.range?.[0] ?? n.range?.[0] ?? 0,
    })
  })
  return names
}

function firstRange(calls: { name: string; range: number }[], name: string): number | undefined {
  return calls.find((call) => call.name === name)?.range
}

const datawhEtlStepsRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Cloud Function job sources must declare extract, transform, load and await them in that order from export async function main (or run that export calls)',
    },
    schema: [],
    messages: {
      missingStep: "Job file must declare a function named '{{step}}'.",
      missingExport: 'Job file must export an async function named `main`.',
      missingPipeline:
        'Export `main` (or run() that it awaits) must `await extract()`, `await transform(...)`, and `await load(...)` in that order.',
      wrongOrder:
        '`await extract()`, `await transform(...)`, and `await load(...)` must appear in that order.',
    },
  },
  create(context) {
    const stem = stemFromFilename(context.filename)
    if (stem == null) return {}

    const fnNodes = new Map<string, { node: Node; exported: boolean; async: boolean }>()
    const ancestorStack: Node[] = []

    function lintProgram(program: Node): void {
      const reportNode = program
      for (const step of STEPS) {
        if (!fnNodes.has(step)) {
          context.report({
            node: reportNode,
            messageId: 'missingStep',
            data: { step },
          })
        }
      }

      const entry = fnNodes.get(HTTP_EXPORT)
      if (entry == null || !entry.exported || !entry.async) {
        context.report({
          node: entry?.node ?? reportNode,
          messageId: 'missingExport',
        })
        return
      }

      const entryBody = functionBody(entry.node)
      if (entryBody == null) return
      const entryCalls = awaitedCalleeNames(entryBody)
      let pipelineCalls = entryCalls
      const awaitsRun = entryCalls.some((call) => call.name === 'run')
      if (firstRange(entryCalls, 'extract') == null && awaitsRun && fnNodes.has('run')) {
        const runBody = functionBody(fnNodes.get('run')!.node)
        if (runBody) pipelineCalls = awaitedCalleeNames(runBody)
      }

      const extractAt = firstRange(pipelineCalls, 'extract')
      const transformAt = firstRange(pipelineCalls, 'transform')
      const loadAt = firstRange(pipelineCalls, 'load')
      if (extractAt == null || transformAt == null || loadAt == null) {
        context.report({
          node: entry.node,
          messageId: 'missingPipeline',
        })
        return
      }
      if (!(extractAt < transformAt && transformAt < loadAt)) {
        context.report({
          node: entry.node,
          messageId: 'wrongOrder',
        })
      }
    }

    return {
      '*'(node: Node) {
        ancestorStack.push(node)
        const name = functionName(node)
        if (name == null) return
        if (!PIPELINE.has(name) && name !== HTTP_EXPORT && name !== 'run') return
        fnNodes.set(name, {
          node,
          exported: isExported(node, ancestorStack.slice(0, -1)),
          async: isAsyncFunction(node),
        })
      },
      '*:exit'() {
        ancestorStack.pop()
      },
      'Program:exit'(node: Node) {
        lintProgram(node)
      },
    }
  },
}

export default datawhEtlStepsRule
