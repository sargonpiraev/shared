import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

dotenv.config()

export const envSchema = z.object({
  HABITIFY_API_KEY: z.string(),
})

export const mcpServer = new McpServer(
  {
    name: '@sargonpiraev/habitify-mcp-server',
    version: '1.0.0',
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
  baseURL: 'https://api.habitify.me',
  headers: {
    Accept: 'application/json',
  },
  timeout: 30000,
})

apiClient.interceptors.request.use(
  (config) => {
    if (env.HABITIFY_API_KEY) {
      config.headers['Authorization'] = env.HABITIFY_API_KEY
    }

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
  'get-journal',
  `Get habit journal for a specific date`,
  {
    targetDate: z.string().optional(),
    orderBy: z.string().optional(),
    status: z.string().optional(),
    areaId: z.string().optional(),
    timeOfDay: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('targetDate' in mappedParams) {
        mappedParams['target_date'] = mappedParams['targetDate']
        delete mappedParams['targetDate']
      }
      if ('orderBy' in mappedParams) {
        mappedParams['order_by'] = mappedParams['orderBy']
        delete mappedParams['orderBy']
      }
      if ('areaId' in mappedParams) {
        mappedParams['area_id'] = mappedParams['areaId']
        delete mappedParams['areaId']
      }
      if ('timeOfDay' in mappedParams) {
        mappedParams['time_of_day'] = mappedParams['timeOfDay']
        delete mappedParams['timeOfDay']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/journal',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'add-habit-log',
  `Add a habit log`,
  {
    habitId: z.string(),
    requestData: z.record(z.string(), z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { habitId, ...otherParams } = args
      const url = `/logs/${habitId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('habitId' in mappedParams) {
        mappedParams['habit_id'] = mappedParams['habitId']
        delete mappedParams['habitId']
      }

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
  'delete-habit-logs-range',
  `Delete habit logs in date range`,
  {
    habitId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
  },
  async (args, extra) => {
    try {
      const { habitId, ...otherParams } = args
      const url = `/logs/${habitId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('habitId' in mappedParams) {
        mappedParams['habit_id'] = mappedParams['habitId']
        delete mappedParams['habitId']
      }
      if ('startDate' in mappedParams) {
        mappedParams['start_date'] = mappedParams['startDate']
        delete mappedParams['startDate']
      }
      if ('endDate' in mappedParams) {
        mappedParams['end_date'] = mappedParams['endDate']
        delete mappedParams['endDate']
      }

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
  'delete-habit-log',
  `Delete a specific habit log`,
  {
    habitId: z.string(),
    logId: z.string(),
  },
  async (args, extra) => {
    try {
      const { habitId, logId, ...otherParams } = args
      const url = `/logs/${habitId}/${logId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('habitId' in mappedParams) {
        mappedParams['habit_id'] = mappedParams['habitId']
        delete mappedParams['habitId']
      }
      if ('logId' in mappedParams) {
        mappedParams['log_id'] = mappedParams['logId']
        delete mappedParams['logId']
      }

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
  'get-habits',
  `Get all habits`,
  {
    status: z.string().optional(),
    areaId: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('areaId' in mappedParams) {
        mappedParams['area_id'] = mappedParams['areaId']
        delete mappedParams['areaId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/habits',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-habit',
  `Get habit details`,
  {
    habitId: z.string(),
  },
  async (args, extra) => {
    try {
      const { habitId, ...otherParams } = args
      const url = `/habits/${habitId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('habitId' in mappedParams) {
        mappedParams['habit_id'] = mappedParams['habitId']
        delete mappedParams['habitId']
      }

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

mcpServer.tool('get-areas', `Get all areas`, {}, async (args, extra) => {
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
      url: '/areas',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-moods',
  `Get mood entries`,
  {
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('startDate' in mappedParams) {
        mappedParams['start_date'] = mappedParams['startDate']
        delete mappedParams['startDate']
      }
      if ('endDate' in mappedParams) {
        mappedParams['end_date'] = mappedParams['endDate']
        delete mappedParams['endDate']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/moods',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'add-mood',
  `Add mood entry`,
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
        url: '/moods',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-notes',
  `Get notes`,
  {
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('startDate' in mappedParams) {
        mappedParams['start_date'] = mappedParams['startDate']
        delete mappedParams['startDate']
      }
      if ('endDate' in mappedParams) {
        mappedParams['end_date'] = mappedParams['endDate']
        delete mappedParams['endDate']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/notes',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'add-note',
  `Add note`,
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
        url: '/notes',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-actions', `Get available actions`, {}, async (args, extra) => {
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
      url: '/actions',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})
