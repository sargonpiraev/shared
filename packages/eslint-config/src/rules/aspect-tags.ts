import type { Rule } from 'eslint'
import type { CallExpression } from 'estree'
import {
  WEBAPP_ASPECT_TAGS,
  getDetailsObject,
  isDescribeCall,
  isPlaywrightSpecFile,
  isTestCall,
  readTagLiterals,
  reportFilename,
  requiredTagsForFile,
} from '../playwright-ast.js'

type Options = {
  allowedTags?: string[]
  requiredTags?: string[]
}

const aspectTagsRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require Playwright spec files to use a file-level whitelist of aspect tags, with required tags present on at least one test()',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedTags: {
            type: 'array',
            items: { type: 'string' },
          },
          requiredTags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unknownTag: "Playwright tag '{{tag}}' is not in the allowed aspect whitelist ({{allowed}}).",
      missingTag:
        "Playwright spec must include tag '{{tag}}' on at least one test() (file-level aspect coverage).",
    },
  },
  create(context) {
    const source = context.sourceCode.text
    const filename = reportFilename(context)
    if (!isPlaywrightSpecFile(filename, source)) return {}

    const options = (context.options[0] ?? {}) as Options
    const allowedTags = options.allowedTags ?? [...WEBAPP_ASPECT_TAGS]
    const requiredTags = options.requiredTags ?? [...WEBAPP_ASPECT_TAGS]
    const allowed = new Set(allowedTags)
    const needed = requiredTagsForFile(filename, requiredTags)
    const covered = new Set<string>()
    const tagStack: string[][] = []

    function tagsFromCall(node: CallExpression): string[] {
      const details = getDetailsObject(node)
      if (!details) return []
      const literals = readTagLiterals(details)
      for (const literal of literals) {
        if (!allowed.has(literal.value)) {
          context.report({
            node: literal.node,
            messageId: 'unknownTag',
            data: { tag: literal.value, allowed: allowedTags.join(', ') },
          })
        }
      }
      return literals.map((literal) => literal.value)
    }

    function inheritedTags(): string[] {
      return tagStack.flat()
    }

    return {
      CallExpression(node) {
        if (isDescribeCall(node)) {
          tagStack.push(tagsFromCall(node))
          return
        }
        if (!isTestCall(node)) return
        const tags = [...inheritedTags(), ...tagsFromCall(node)]
        for (const tag of tags) covered.add(tag)
      },
      'CallExpression:exit'(node) {
        if (isDescribeCall(node)) tagStack.pop()
      },
      'Program:exit'(program) {
        for (const tag of needed) {
          if (!covered.has(tag)) {
            context.report({
              node: program,
              messageId: 'missingTag',
              data: { tag },
            })
          }
        }
      },
    }
  },
}

export default aspectTagsRule
