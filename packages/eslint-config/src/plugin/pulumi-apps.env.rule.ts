import type { Rule } from 'eslint'
import type { MemberExpression } from 'estree'

const APP_PULUMI = /(?:^|\/)apps\/[^/]+\/pulumi\.ts$/

function isProcessEnv(node: Rule.Node | MemberExpression): node is MemberExpression {
  return (
    node.type === 'MemberExpression' &&
    !node.computed &&
    node.object.type === 'Identifier' &&
    node.object.name === 'process' &&
    node.property.type === 'Identifier' &&
    node.property.name === 'env'
  )
}

function propertyName(node: MemberExpression): string | undefined {
  if (!node.computed && node.property.type === 'Identifier') return node.property.name
  if (
    node.computed &&
    node.property.type === 'Literal' &&
    typeof node.property.value === 'string'
  ) {
    return node.property.value
  }
  return undefined
}

const pulumiAppsEnvRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'apps/*/pulumi.ts must read SaaS keys via @sargonpiraev/pulumi-apps env parsers, not process.env',
    },
    schema: [],
    messages: {
      noProcessEnv:
        'Do not read process.env in apps/*/pulumi.ts (PATH is allowed). Import parseWebappEnv / parseExtappEnv / parseMobappEnv from @sargonpiraev/pulumi-apps.',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    if (!APP_PULUMI.test(filename)) return {}

    return {
      MemberExpression(node) {
        if (!isProcessEnv(node)) return
        const parent = context.sourceCode.getAncestors(node).at(-1)
        if (parent?.type === 'MemberExpression' && parent.object === node) {
          if (propertyName(parent) === 'PATH') return
        }
        context.report({ node, messageId: 'noProcessEnv' })
      },
    }
  },
}

export default pulumiAppsEnvRule
