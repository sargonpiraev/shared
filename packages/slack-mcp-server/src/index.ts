#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { WebClient } from '@slack/web-api'
import dotenv from 'dotenv'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { Channel } from '@slack/web-api/dist/response/ConversationsListResponse.js'

dotenv.config()

// Initialize Slack client with token from environment variables
const webClient = new WebClient(process.env.SLACK_USER_TOKEN)

const mcpServer = new McpServer(
  {
    name: 'Slack MCP Server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      logging: {},
    },
    instructions: `
      This MCP Server provides tools to interact with Slack.
      You can use these tools to send messages and interact with Slack workspaces.
    `,
  }
)

const logger = {
  info: (data: unknown) => {
    mcpServer.server.sendLoggingMessage({ level: 'info', data })
  },
  error: (data: unknown) => {
    mcpServer.server.sendLoggingMessage({ level: 'error', data })
  },
  debug: (data: unknown) => {
    mcpServer.server.sendLoggingMessage({ level: 'debug', data })
  },
  warn: (data: unknown) => {
    mcpServer.server.sendLoggingMessage({ level: 'warning', data })
  },
  log: (data: unknown) => {
    mcpServer.server.sendLoggingMessage({ level: 'info', data })
  },
}

const createTextMessage = (text: string): CallToolResult => {
  return { content: [{ type: 'text', text }] }
}

// Error handling helper
function handleError(error: unknown): CallToolResult {
  logger.error(error)
  return { isError: true, ...createTextMessage(String(error)) }
}

// Define post-message tool
mcpServer.tool(
  'post-message',
  `
    Send a message to a Slack channel
    Params:
    - channel (string): Channel ID or name to post to
    - text (string): Message text content
    - blocks? (array): Optional Slack Block Kit formatting
    Returns: Success confirmation with message timestamp
    Note: Requires permissions to post in the target channel
  `,
  {
    channel: z.string().describe('Channel ID or name to post the message to'),
    text: z.string().describe('Text content of the message'),
    blocks: z
      .array(z.any())
      .optional()
      .describe('Slack Block Kit formatted message blocks (optional)'),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ channel, text, blocks }: { channel: string; text: string; blocks?: any[] }) => {
    try {
      const result = await webClient.chat.postMessage({ channel, text, blocks })
      logger.debug(result)
      const _text = `Message sent successfully to channel ${channel}. Timestamp: ${result.ts}`
      return createTextMessage(_text)
    } catch (error) {
      return handleError(error)
    }
  }
)

// Define list-channels tool
mcpServer.tool(
  'list-channels',
  `
    List all accessible Slack channels
    Returns: List of channels with their types and IDs
    Note: Includes public, private, DM and group DM channels
    Types: public_channel, private_channel, im (direct messages), mpim (group messages)
  `,
  {},
  async () => {
    try {
      // Get all accessible channels including public, private, DMs and multi-person DMs
      const response = await webClient.conversations.list({
        exclude_archived: true,
        limit: 1000,
        types: 'public_channel,private_channel,im,mpim',
      })

      logger.debug(response)

      const channels = response.channels || []

      if (channels.length === 0) {
        return createTextMessage('No channels found. Make sure the user has proper permissions.')
      }

      // Format the channel list
      const channelList = channels
        .map((ch: Channel) => {
          let channelType = 'Channel'
          if (ch.is_im) channelType = 'Direct Message'
          else if (ch.is_mpim) channelType = 'Group Message'
          else if (ch.is_private) channelType = 'Private Channel'
          else channelType = 'Public Channel'

          // For DMs, use user's real name or display name instead of channel name
          const displayName = ch.is_im ? `DM with ${ch.user || 'User'}` : `#${ch.name}`

          return `• ${displayName} (${channelType}) - ID: ${ch.id}`
        })
        .join('\n')

      return createTextMessage(
        `Available Slack channels:\n\n${channelList}\n\nTotal: ${channels.length} channels`
      )
    } catch (error) {
      return handleError(error)
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await mcpServer.connect(transport)
  logger.info('Slack MCP Server running on stdio')
}

main().catch((error) => {
  logger.error(error)
  process.exit(1)
})
