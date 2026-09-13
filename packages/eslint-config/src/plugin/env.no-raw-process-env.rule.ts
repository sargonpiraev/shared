import path from 'node:path'
import type { Rule } from 'eslint'
import type { MemberExpression, Node } from 'estree'

const ENV_BASENAMES = new Set(['env.ts', 'env.mjs', 'env.js', 'env.cjs'])

function isEnvModule(filename: string): boolean {
  return ENV_BASENAMES.has(path.basename(filename))
}

function isProcessEnvMember(node: MemberExpression): boolean {
  if (node.object.type !== 'Identifier' || node.object.name !== 'process') {
    return false
  }
  if (node.property.type === 'Identifier' && !node.computed) {
    return node.property.name === 'env'
  }
  if (node.property.type === 'Literal') {
    return node.property.value === 'env'
  }
  return false
}

const noRawProcessEnvRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid process.env outside env.ts / env.mjs (Zod schema.parse at module load)',
    },
    schema: [],
    messages: {
      noRawProcessEnv:
        'Read env via schema.parse in env.ts (or env.mjs); do not use process.env here.',
    },
  },
  create(context) {
    if (isEnvModule(context.filename)) return {}

    return {
      MemberExpression(node: Node) {
        if (node.type !== 'MemberExpression') return
        if (!isProcessEnvMember(node)) return
        context.report({ node, messageId: 'noRawProcessEnv' })
      },
    }
  },
}

export default noRawProcessEnvRule
