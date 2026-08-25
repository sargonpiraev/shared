import type { Rule } from 'eslint'
import type {
  CallExpression,
  Expression,
  FunctionExpression,
  ArrowFunctionExpression,
  Node,
  ObjectExpression,
  Pattern,
  SpreadElement,
  Super,
} from 'estree'

const TEST_ID = 'test'
const TEST_FN_MODIFIERS = new Set(['skip', 'only', 'fixme'])
const DESCRIBE_MODIFIERS = new Set(['skip', 'only', 'fixme', 'serial', 'parallel'])

export const WEBAPP_ASPECT_TAGS = ['@functional', '@seo', '@analytics', '@visual', '@cwv'] as const

const ASPECT_SUFFIX = /\.(functional|seo|analytics|visual|cwv)\.spec\.[cm]?[jt]sx?$/
const PAGE_SPEC = /(^|\/)page\.spec\.[cm]?[jt]sx?$/

export function normalizeFilename(filename: string): string {
  return filename.replaceAll('\\', '/')
}

export function isPlaywrightSpecFile(filename: string, source: string): boolean {
  const path = normalizeFilename(filename)
  if (ASPECT_SUFFIX.test(path) || PAGE_SPEC.test(path)) return true
  if (/(^|\/)e2e\//.test(path)) return true
  return source.includes('@playwright/test')
}

export function requiredTagsForFile(filename: string, requiredTags: readonly string[]): string[] {
  const path = normalizeFilename(filename)
  if (PAGE_SPEC.test(path)) return [...requiredTags]
  const match = path.match(ASPECT_SUFFIX)
  if (match?.[1]) return [`@${match[1]}`]
  return []
}

function calleePath(callee: Expression | Super): string[] | null {
  if (callee.type === 'Identifier') {
    return callee.name === TEST_ID ? [] : null
  }
  if (callee.type !== 'MemberExpression' || callee.computed) return null
  const parts: string[] = []
  let current: Expression | Super = callee
  while (current.type === 'MemberExpression') {
    if (current.computed || current.property.type !== 'Identifier') return null
    parts.unshift(current.property.name)
    current = current.object
  }
  if (current.type !== 'Identifier' || current.name !== TEST_ID) return null
  return parts
}

export function isDescribeCall(node: CallExpression): boolean {
  const path = calleePath(node.callee)
  if (!path || path[0] !== 'describe') return false
  return path.length === 1 || (path.length === 2 && DESCRIBE_MODIFIERS.has(path[1]))
}

export function isTestCall(node: CallExpression): boolean {
  const path = calleePath(node.callee)
  if (!path) return false
  if (path.length === 0) return hasFunctionArg(node)
  if (path.length === 1 && TEST_FN_MODIFIERS.has(path[0])) return hasFunctionArg(node)
  return false
}

function hasFunctionArg(node: CallExpression): boolean {
  return node.arguments.some((arg) => isFunctionNode(arg))
}

export function isFunctionNode(
  node: Node | SpreadElement | Pattern | Expression | null | undefined
): node is FunctionExpression | ArrowFunctionExpression {
  return node?.type === 'FunctionExpression' || node?.type === 'ArrowFunctionExpression'
}

export function getDetailsObject(node: CallExpression): ObjectExpression | null {
  const candidate = node.arguments[1]
  if (candidate && candidate.type === 'ObjectExpression') return candidate
  return null
}

export function readTagLiterals(details: ObjectExpression): { value: string; node: Node }[] {
  const found: { value: string; node: Node }[] = []
  for (const prop of details.properties) {
    if (prop.type !== 'Property') continue
    const key = prop.key
    const isTag =
      (key.type === 'Identifier' && key.name === 'tag') ||
      (key.type === 'Literal' && key.value === 'tag')
    if (!isTag) continue
    collectStringLiterals(prop.value, found)
  }
  return found
}

function collectStringLiterals(
  node: Node | Expression | Pattern | SpreadElement,
  out: { value: string; node: Node }[]
): void {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    out.push({ value: node.value, node })
    return
  }
  if (node.type === 'ArrayExpression') {
    for (const el of node.elements) {
      if (el) collectStringLiterals(el, out)
    }
  }
}

export function readStepName(node: CallExpression): { name: string; node: Node } | null {
  const path = calleePath(node.callee)
  if (!path || path.length !== 1 || path[0] !== 'step') return null
  const first = node.arguments[0]
  if (first && first.type === 'Literal' && typeof first.value === 'string') {
    return { name: first.value, node: first }
  }
  return null
}

export function reportFilename(context: Rule.RuleContext): string {
  return context.filename
}
