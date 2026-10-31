import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

dotenv.config()

export const envSchema = z.object({
  GOOGLE_CALENDAR_CLIENT_ID: z.string(),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string(),
})

export const mcpServer = new McpServer(
  {
    name: '@sargonpiraev/google-calendar-mcp-server',
    version: 'v3',
  },
  {
    instructions: ``,
    capabilities: {
      tools: {},
      logging: {},
    },
  }
)

export const env = envSchema.parse(process.env)

export const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://www.googleapis.com/calendar/v3',
  headers: {
    Accept: 'application/json',
  },
  timeout: 30000,
})

apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

function handleResult(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  }
}

function handleError(error: unknown): CallToolResult {
  console.error(error)

  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message
    return {
      isError: true,
      content: [{ type: 'text', text: `API Error: ${message}` }],
    } as CallToolResult
  }

  return {
    isError: true,
    content: [{ type: 'text', text: `Error: ${error}` }],
  } as CallToolResult
}

// Register tools
mcpServer.tool(
  'list-acl',
  `List access control rules`,
  {
    calendarId: z.string(),
    maxResults: z.string().optional(),
    pageToken: z.string().optional(),
    showDeleted: z.string().optional(),
    syncToken: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}/acl`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'insert-acl',
  `Create access control rule`,
  {
    calendarId: z.string(),
    sendNotifications: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}/acl`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-acl',
  `Get access control rule`,
  {
    calendarId: z.string(),
    ruleId: z.string(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ruleId, ...otherParams } = args
      const url = `/calendars/${calendarId}/acl/${ruleId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'update-acl',
  `Update access control rule`,
  {
    calendarId: z.string(),
    ruleId: z.string(),
    sendNotifications: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ruleId, ...otherParams } = args
      const url = `/calendars/${calendarId}/acl/${ruleId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'patch-acl',
  `Patch access control rule`,
  {
    calendarId: z.string(),
    ruleId: z.string(),
    sendNotifications: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ruleId, ...otherParams } = args
      const url = `/calendars/${calendarId}/acl/${ruleId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PATCH',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-acl',
  `Delete access control rule`,
  {
    calendarId: z.string(),
    ruleId: z.string(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ruleId, ...otherParams } = args
      const url = `/calendars/${calendarId}/acl/${ruleId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'watch-acl',
  `Watch for changes to ACL resources`,
  {
    calendarId: z.string(),
    maxResults: z.string().optional(),
    pageToken: z.string().optional(),
    showDeleted: z.string().optional(),
    syncToken: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}/acl/watch`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'list-calendar-list',
  `List calendars`,
  {
    maxResults: z.string().optional(),
    minAccessRole: z.string().optional(),
    pageToken: z.string().optional(),
    showDeleted: z.string().optional(),
    showHidden: z.string().optional(),
    syncToken: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/users/me/calendarList',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'insert-calendar-list',
  `Insert calendar into calendar list`,
  {
    colorRgbFormat: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/users/me/calendarList',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-calendar-list',
  `Get calendar from calendar list`,
  {
    calendarId: z.string(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/users/me/calendarList/${calendarId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'update-calendar-list',
  `Update calendar in calendar list`,
  {
    calendarId: z.string(),
    colorRgbFormat: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/users/me/calendarList/${calendarId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'patch-calendar-list',
  `Patch calendar in calendar list`,
  {
    calendarId: z.string(),
    colorRgbFormat: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/users/me/calendarList/${calendarId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PATCH',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-calendar-list',
  `Remove calendar from calendar list`,
  {
    calendarId: z.string(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/users/me/calendarList/${calendarId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'watch-calendar-list',
  `Watch for changes to CalendarList resources`,
  {
    maxResults: z.string().optional(),
    minAccessRole: z.string().optional(),
    pageToken: z.string().optional(),
    showDeleted: z.string().optional(),
    showHidden: z.string().optional(),
    syncToken: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/users/me/calendarList/watch',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'insert-calendar',
  `Create calendar`,
  {
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/calendars',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-calendar',
  `Get calendar`,
  {
    calendarId: z.string(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'update-calendar',
  `Update calendar`,
  {
    calendarId: z.string(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'patch-calendar',
  `Patch calendar`,
  {
    calendarId: z.string(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PATCH',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-calendar',
  `Delete calendar`,
  {
    calendarId: z.string(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'clear-calendar',
  `Clear primary calendar`,
  {
    calendarId: z.string(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}/clear`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'list-events',
  `List events`,
  {
    calendarId: z.string(),
    alwaysIncludeEmail: z.string().optional(),
    eventTypes: z.string().optional(),
    iCalUID: z.string().optional(),
    maxAttendees: z.string().optional(),
    maxResults: z.string().optional(),
    orderBy: z.string().optional(),
    pageToken: z.string().optional(),
    privateExtendedProperty: z.string().optional(),
    q: z.string().optional(),
    sharedExtendedProperty: z.string().optional(),
    showDeleted: z.string().optional(),
    showHiddenInvitations: z.string().optional(),
    singleEvents: z.string().optional(),
    syncToken: z.string().optional(),
    timeMax: z.string().optional(),
    timeMin: z.string().optional(),
    timeZone: z.string().optional(),
    updatedMin: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}/events`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'insert-event',
  `Create event`,
  {
    calendarId: z.string(),
    conferenceDataVersion: z.string().optional(),
    maxAttendees: z.string().optional(),
    sendNotifications: z.string().optional(),
    sendUpdates: z.string().optional(),
    supportsAttachments: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}/events`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-event',
  `Get event`,
  {
    calendarId: z.string(),
    eventId: z.string(),
    alwaysIncludeEmail: z.string().optional(),
    maxAttendees: z.string().optional(),
    timeZone: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, eventId, ...otherParams } = args
      const url = `/calendars/${calendarId}/events/${eventId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'update-event',
  `Update event`,
  {
    calendarId: z.string(),
    eventId: z.string(),
    alwaysIncludeEmail: z.string().optional(),
    conferenceDataVersion: z.string().optional(),
    maxAttendees: z.string().optional(),
    sendNotifications: z.string().optional(),
    sendUpdates: z.string().optional(),
    supportsAttachments: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, eventId, ...otherParams } = args
      const url = `/calendars/${calendarId}/events/${eventId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PUT',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'patch-event',
  `Patch event`,
  {
    calendarId: z.string(),
    eventId: z.string(),
    alwaysIncludeEmail: z.string().optional(),
    conferenceDataVersion: z.string().optional(),
    maxAttendees: z.string().optional(),
    sendNotifications: z.string().optional(),
    sendUpdates: z.string().optional(),
    supportsAttachments: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, eventId, ...otherParams } = args
      const url = `/calendars/${calendarId}/events/${eventId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PATCH',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-event',
  `Delete event`,
  {
    calendarId: z.string(),
    eventId: z.string(),
    sendNotifications: z.string().optional(),
    sendUpdates: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, eventId, ...otherParams } = args
      const url = `/calendars/${calendarId}/events/${eventId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'instances-event',
  `Get event instances`,
  {
    calendarId: z.string(),
    eventId: z.string(),
    alwaysIncludeEmail: z.string().optional(),
    maxAttendees: z.string().optional(),
    maxResults: z.string().optional(),
    originalStart: z.string().optional(),
    pageToken: z.string().optional(),
    showDeleted: z.string().optional(),
    timeMax: z.string().optional(),
    timeMin: z.string().optional(),
    timeZone: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, eventId, ...otherParams } = args
      const url = `/calendars/${calendarId}/events/${eventId}/instances`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'move-event',
  `Move event`,
  {
    calendarId: z.string(),
    eventId: z.string(),
    destination: z.string(),
    sendNotifications: z.string().optional(),
    sendUpdates: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, eventId, ...otherParams } = args
      const url = `/calendars/${calendarId}/events/${eventId}/move`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'import-event',
  `Import event`,
  {
    calendarId: z.string(),
    conferenceDataVersion: z.string().optional(),
    supportsAttachments: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}/events/import`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'quick-add-event',
  `Quick add event`,
  {
    calendarId: z.string(),
    text: z.string(),
    sendNotifications: z.string().optional(),
    sendUpdates: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}/events/quickAdd`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'watch-events',
  `Watch for changes to Events resources`,
  {
    calendarId: z.string(),
    alwaysIncludeEmail: z.string().optional(),
    eventTypes: z.string().optional(),
    iCalUID: z.string().optional(),
    maxAttendees: z.string().optional(),
    maxResults: z.string().optional(),
    orderBy: z.string().optional(),
    pageToken: z.string().optional(),
    privateExtendedProperty: z.string().optional(),
    q: z.string().optional(),
    sharedExtendedProperty: z.string().optional(),
    showDeleted: z.string().optional(),
    showHiddenInvitations: z.string().optional(),
    singleEvents: z.string().optional(),
    syncToken: z.string().optional(),
    timeMax: z.string().optional(),
    timeMin: z.string().optional(),
    timeZone: z.string().optional(),
    updatedMin: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { calendarId, ...otherParams } = args
      const url = `/calendars/${calendarId}/events/watch`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'query-freebusy',
  `Query free/busy information`,
  {
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/freeBusy',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-colors', `Get color definitions`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/colors',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'list-settings',
  `List settings`,
  {
    maxResults: z.string().optional(),
    pageToken: z.string().optional(),
    syncToken: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/users/me/settings',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-setting',
  `Get setting`,
  {
    setting: z.string(),
  },
  async (args, extra) => {
    try {
      const { setting, ...otherParams } = args
      const url = `/users/me/settings/${setting}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'watch-settings',
  `Watch for changes to Settings resources`,
  {
    maxResults: z.string().optional(),
    pageToken: z.string().optional(),
    syncToken: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/users/me/settings/watch',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'stop-channel',
  `Stop watching resources`,
  {
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/channels/stop',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)
