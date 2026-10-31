import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

dotenv.config()

export const envSchema = z.object({
  GOOGLE_TASKS_CLIENT_ID: z.string(),
  GOOGLE_TASKS_CLIENT_SECRET: z.string(),
})

export const mcpServer = new McpServer(
  {
    name: '@sargonpiraev/google-tasks-mcp-server',
    version: 'v1',
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
  baseURL: 'https://tasks.googleapis.com/tasks/v1',
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
  'list-task-lists',
  `List task lists`,
  {
    maxResults: z.string().optional(),
    pageToken: z.string().optional(),
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
        url: '/users/@me/lists',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'insert-task-list',
  `Create task list`,
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
        url: '/users/@me/lists',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-task-list',
  `Get task list`,
  {
    tasklist: z.string(),
  },
  async (args, extra) => {
    try {
      const { tasklist, ...otherParams } = args
      const url = `/users/@me/lists/${tasklist}`

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
  'update-task-list',
  `Update task list`,
  {
    tasklist: z.string(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { tasklist, ...otherParams } = args
      const url = `/users/@me/lists/${tasklist}`

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
  'patch-task-list',
  `Patch task list`,
  {
    tasklist: z.string(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { tasklist, ...otherParams } = args
      const url = `/users/@me/lists/${tasklist}`

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
  'delete-task-list',
  `Delete task list`,
  {
    tasklist: z.string(),
  },
  async (args, extra) => {
    try {
      const { tasklist, ...otherParams } = args
      const url = `/users/@me/lists/${tasklist}`

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
  'list-tasks',
  `List tasks`,
  {
    tasklist: z.string(),
    completedMax: z.string().optional(),
    completedMin: z.string().optional(),
    dueMax: z.string().optional(),
    dueMin: z.string().optional(),
    maxResults: z.string().optional(),
    pageToken: z.string().optional(),
    showCompleted: z.string().optional(),
    showDeleted: z.string().optional(),
    showHidden: z.string().optional(),
    showAssigned: z.string().optional(),
    updatedMin: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { tasklist, ...otherParams } = args
      const url = `/lists/${tasklist}/tasks`

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
  'insert-task',
  `Create task`,
  {
    tasklist: z.string(),
    parent: z.string().optional(),
    previous: z.string().optional(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { tasklist, ...otherParams } = args
      const url = `/lists/${tasklist}/tasks`

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
  'get-task',
  `Get task`,
  {
    tasklist: z.string(),
    task: z.string(),
  },
  async (args, extra) => {
    try {
      const { tasklist, task, ...otherParams } = args
      const url = `/lists/${tasklist}/tasks/${task}`

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
  'update-task',
  `Update task`,
  {
    tasklist: z.string(),
    task: z.string(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { tasklist, task, ...otherParams } = args
      const url = `/lists/${tasklist}/tasks/${task}`

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
  'patch-task',
  `Patch task`,
  {
    tasklist: z.string(),
    task: z.string(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { tasklist, task, ...otherParams } = args
      const url = `/lists/${tasklist}/tasks/${task}`

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
  'delete-task',
  `Delete task`,
  {
    tasklist: z.string(),
    task: z.string(),
  },
  async (args, extra) => {
    try {
      const { tasklist, task, ...otherParams } = args
      const url = `/lists/${tasklist}/tasks/${task}`

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
  'move-task',
  `Move task`,
  {
    tasklist: z.string(),
    task: z.string(),
    parent: z.string().optional(),
    previous: z.string().optional(),
    destinationTasklist: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { tasklist, task, ...otherParams } = args
      const url = `/lists/${tasklist}/tasks/${task}/move`

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
  'clear-tasks',
  `Clear completed tasks`,
  {
    tasklist: z.string(),
  },
  async (args, extra) => {
    try {
      const { tasklist, ...otherParams } = args
      const url = `/lists/${tasklist}/clear`

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
