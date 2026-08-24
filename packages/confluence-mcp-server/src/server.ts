import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

dotenv.config()

export const envSchema = z.object({
  CONFLUENCE_CLIENT_ID: z.string(),
  CONFLUENCE_CLIENT_SECRET: z.string(),
})

export const mcpServer = new McpServer(
  {
    name: '@sargonpiraev/confluence-mcp-server',
    version: '2.0.0',
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
  baseURL: 'https://{your-domain}/wiki/api/v2',
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
mcpServer.tool('get-admin-key', `Get Admin Key`, {}, async (args, extra) => {
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
      url: '/admin-key',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('enable-admin-key', `Enable Admin Key`, {}, async (args, extra) => {
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
      url: '/admin-key',
      data: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool('disable-admin-key', `Disable Admin Key`, {}, async (args, extra) => {
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
      method: 'DELETE',
      url: '/admin-key',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-attachments',
  `Get attachments`,
  {
    sort: z.string().optional(),
    cursor: z.string().optional(),
    status: z.string().optional(),
    mediaType: z.string().optional(),
    filename: z.string().optional(),
    limit: z.string().optional(),
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
        url: '/attachments',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-attachment-by-id',
  `Get attachment by id`,
  {
    id: z.string(),
    version: z.string().optional(),
    includeLabels: z.string().optional(),
    includeProperties: z.string().optional(),
    includeOperations: z.string().optional(),
    includeVersions: z.string().optional(),
    includeVersion: z.string().optional(),
    includeCollaborators: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/attachments/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('includeLabels' in mappedParams) {
        mappedParams['include-labels'] = mappedParams['includeLabels']
        delete mappedParams['includeLabels']
      }
      if ('includeProperties' in mappedParams) {
        mappedParams['include-properties'] = mappedParams['includeProperties']
        delete mappedParams['includeProperties']
      }
      if ('includeOperations' in mappedParams) {
        mappedParams['include-operations'] = mappedParams['includeOperations']
        delete mappedParams['includeOperations']
      }
      if ('includeVersions' in mappedParams) {
        mappedParams['include-versions'] = mappedParams['includeVersions']
        delete mappedParams['includeVersions']
      }
      if ('includeVersion' in mappedParams) {
        mappedParams['include-version'] = mappedParams['includeVersion']
        delete mappedParams['includeVersion']
      }
      if ('includeCollaborators' in mappedParams) {
        mappedParams['include-collaborators'] = mappedParams['includeCollaborators']
        delete mappedParams['includeCollaborators']
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

mcpServer.tool(
  'delete-attachment',
  `Delete attachment`,
  {
    id: z.string(),
    purge: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/attachments/${id}`

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
  'get-attachment-labels',
  `Get labels for attachment`,
  {
    id: z.string(),
    prefix: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/attachments/${id}/labels`

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
  'get-attachment-operations',
  `Get permitted operations for attachment`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/attachments/${id}/operations`

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
  'get-attachment-content-properties',
  `Get content properties for attachment`,
  {
    attachmentId: z.string(),
    key: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { attachmentId, ...otherParams } = args
      const url = `/attachments/${attachmentId}/properties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('attachmentId' in mappedParams) {
        mappedParams['attachment-id'] = mappedParams['attachmentId']
        delete mappedParams['attachmentId']
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

mcpServer.tool(
  'create-attachment-property',
  `Create content property for attachment`,
  {
    attachmentId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { attachmentId, ...otherParams } = args
      const url = `/attachments/${attachmentId}/properties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('attachmentId' in mappedParams) {
        mappedParams['attachment-id'] = mappedParams['attachmentId']
        delete mappedParams['attachmentId']
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
  'get-attachment-content-properties-by-id',
  `Get content property for attachment by id`,
  {
    attachmentId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { attachmentId, propertyId, ...otherParams } = args
      const url = `/attachments/${attachmentId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('attachmentId' in mappedParams) {
        mappedParams['attachment-id'] = mappedParams['attachmentId']
        delete mappedParams['attachmentId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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

mcpServer.tool(
  'update-attachment-property-by-id',
  `Update content property for attachment by id`,
  {
    attachmentId: z.string(),
    propertyId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { attachmentId, propertyId, ...otherParams } = args
      const url = `/attachments/${attachmentId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('attachmentId' in mappedParams) {
        mappedParams['attachment-id'] = mappedParams['attachmentId']
        delete mappedParams['attachmentId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
      }

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
  'delete-attachment-property-by-id',
  `Delete content property for attachment by id`,
  {
    attachmentId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { attachmentId, propertyId, ...otherParams } = args
      const url = `/attachments/${attachmentId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('attachmentId' in mappedParams) {
        mappedParams['attachment-id'] = mappedParams['attachmentId']
        delete mappedParams['attachmentId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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
  'get-attachment-versions',
  `Get attachment versions`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/attachments/${id}/versions`

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
  'get-attachment-version-details',
  `Get version details for attachment version`,
  {
    attachmentId: z.string(),
    versionNumber: z.string(),
  },
  async (args, extra) => {
    try {
      const { attachmentId, versionNumber, ...otherParams } = args
      const url = `/attachments/${attachmentId}/versions/${versionNumber}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('attachmentId' in mappedParams) {
        mappedParams['attachment-id'] = mappedParams['attachmentId']
        delete mappedParams['attachmentId']
      }
      if ('versionNumber' in mappedParams) {
        mappedParams['version-number'] = mappedParams['versionNumber']
        delete mappedParams['versionNumber']
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

mcpServer.tool(
  'get-attachment-comments',
  `Get attachment comments`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
    version: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/attachments/${id}/footer-comments`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-blog-posts',
  `Get blog posts`,
  {
    id: z.string().optional(),
    spaceId: z.string().optional(),
    sort: z.string().optional(),
    status: z.string().optional(),
    title: z.string().optional(),
    bodyFormat: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('spaceId' in mappedParams) {
        mappedParams['space-id'] = mappedParams['spaceId']
        delete mappedParams['spaceId']
      }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/blogposts',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'create-blog-post',
  `Create blog post`,
  {
    private: z.string().optional(),
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
        url: '/blogposts',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-blog-post-by-id',
  `Get blog post by id`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    getDraft: z.string().optional(),
    status: z.string().optional(),
    version: z.string().optional(),
    includeLabels: z.string().optional(),
    includeProperties: z.string().optional(),
    includeOperations: z.string().optional(),
    includeLikes: z.string().optional(),
    includeVersions: z.string().optional(),
    includeVersion: z.string().optional(),
    includeFavoritedByCurrentUserStatus: z.string().optional(),
    includeWebresources: z.string().optional(),
    includeCollaborators: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }
      if ('getDraft' in mappedParams) {
        mappedParams['get-draft'] = mappedParams['getDraft']
        delete mappedParams['getDraft']
      }
      if ('includeLabels' in mappedParams) {
        mappedParams['include-labels'] = mappedParams['includeLabels']
        delete mappedParams['includeLabels']
      }
      if ('includeProperties' in mappedParams) {
        mappedParams['include-properties'] = mappedParams['includeProperties']
        delete mappedParams['includeProperties']
      }
      if ('includeOperations' in mappedParams) {
        mappedParams['include-operations'] = mappedParams['includeOperations']
        delete mappedParams['includeOperations']
      }
      if ('includeLikes' in mappedParams) {
        mappedParams['include-likes'] = mappedParams['includeLikes']
        delete mappedParams['includeLikes']
      }
      if ('includeVersions' in mappedParams) {
        mappedParams['include-versions'] = mappedParams['includeVersions']
        delete mappedParams['includeVersions']
      }
      if ('includeVersion' in mappedParams) {
        mappedParams['include-version'] = mappedParams['includeVersion']
        delete mappedParams['includeVersion']
      }
      if ('includeFavoritedByCurrentUserStatus' in mappedParams) {
        mappedParams['include-favorited-by-current-user-status'] =
          mappedParams['includeFavoritedByCurrentUserStatus']
        delete mappedParams['includeFavoritedByCurrentUserStatus']
      }
      if ('includeWebresources' in mappedParams) {
        mappedParams['include-webresources'] = mappedParams['includeWebresources']
        delete mappedParams['includeWebresources']
      }
      if ('includeCollaborators' in mappedParams) {
        mappedParams['include-collaborators'] = mappedParams['includeCollaborators']
        delete mappedParams['includeCollaborators']
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

mcpServer.tool(
  'update-blog-post',
  `Update blog post`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}`

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
  'delete-blog-post',
  `Delete blog post`,
  {
    id: z.string(),
    purge: z.string().optional(),
    draft: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}`

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
  'get-blogpost-attachments',
  `Get attachments for blog post`,
  {
    id: z.string(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    status: z.string().optional(),
    mediaType: z.string().optional(),
    filename: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/attachments`

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
  'get-custom-content-by-type-in-blog-post',
  `Get custom content by type in blog post`,
  {
    id: z.string(),
    type: z.string(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    bodyFormat: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/custom-content`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-blog-post-labels',
  `Get labels for blog post`,
  {
    id: z.string(),
    prefix: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/labels`

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
  'get-blog-post-like-count',
  `Get like count for blog post`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/likes/count`

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
  'get-blog-post-like-users',
  `Get account IDs of likes for blog post`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/likes/users`

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
  'get-blogpost-content-properties',
  `Get content properties for blog post`,
  {
    blogpostId: z.string(),
    key: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { blogpostId, ...otherParams } = args
      const url = `/blogposts/${blogpostId}/properties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('blogpostId' in mappedParams) {
        mappedParams['blogpost-id'] = mappedParams['blogpostId']
        delete mappedParams['blogpostId']
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

mcpServer.tool(
  'create-blogpost-property',
  `Create content property for blog post`,
  {
    blogpostId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { blogpostId, ...otherParams } = args
      const url = `/blogposts/${blogpostId}/properties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('blogpostId' in mappedParams) {
        mappedParams['blogpost-id'] = mappedParams['blogpostId']
        delete mappedParams['blogpostId']
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
  'get-blogpost-content-properties-by-id',
  `Get content property for blog post by id`,
  {
    blogpostId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { blogpostId, propertyId, ...otherParams } = args
      const url = `/blogposts/${blogpostId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('blogpostId' in mappedParams) {
        mappedParams['blogpost-id'] = mappedParams['blogpostId']
        delete mappedParams['blogpostId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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

mcpServer.tool(
  'update-blogpost-property-by-id',
  `Update content property for blog post by id`,
  {
    blogpostId: z.string(),
    propertyId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { blogpostId, propertyId, ...otherParams } = args
      const url = `/blogposts/${blogpostId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('blogpostId' in mappedParams) {
        mappedParams['blogpost-id'] = mappedParams['blogpostId']
        delete mappedParams['blogpostId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
      }

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
  'delete-blogpost-property-by-id',
  `Delete content property for blogpost by id`,
  {
    blogpostId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { blogpostId, propertyId, ...otherParams } = args
      const url = `/blogposts/${blogpostId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('blogpostId' in mappedParams) {
        mappedParams['blogpost-id'] = mappedParams['blogpostId']
        delete mappedParams['blogpostId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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
  'get-blog-post-operations',
  `Get permitted operations for blog post`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/operations`

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
  'get-blog-post-versions',
  `Get blog post versions`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/versions`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-blog-post-version-details',
  `Get version details for blog post version`,
  {
    blogpostId: z.string(),
    versionNumber: z.string(),
  },
  async (args, extra) => {
    try {
      const { blogpostId, versionNumber, ...otherParams } = args
      const url = `/blogposts/${blogpostId}/versions/${versionNumber}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('blogpostId' in mappedParams) {
        mappedParams['blogpost-id'] = mappedParams['blogpostId']
        delete mappedParams['blogpostId']
      }
      if ('versionNumber' in mappedParams) {
        mappedParams['version-number'] = mappedParams['versionNumber']
        delete mappedParams['versionNumber']
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

mcpServer.tool(
  'convert-content-ids-to-content-types',
  `Convert content ids to content types`,
  {},
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
        url: '/content/convert-ids-to-types',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-custom-content-by-type',
  `Get custom content by type`,
  {
    type: z.string(),
    id: z.string().optional(),
    spaceId: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    bodyFormat: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('spaceId' in mappedParams) {
        mappedParams['space-id'] = mappedParams['spaceId']
        delete mappedParams['spaceId']
      }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/custom-content',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('create-custom-content', `Create custom content`, {}, async (args, extra) => {
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
      url: '/custom-content',
      data: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-custom-content-by-id',
  `Get custom content by id`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    version: z.string().optional(),
    includeLabels: z.string().optional(),
    includeProperties: z.string().optional(),
    includeOperations: z.string().optional(),
    includeVersions: z.string().optional(),
    includeVersion: z.string().optional(),
    includeCollaborators: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/custom-content/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }
      if ('includeLabels' in mappedParams) {
        mappedParams['include-labels'] = mappedParams['includeLabels']
        delete mappedParams['includeLabels']
      }
      if ('includeProperties' in mappedParams) {
        mappedParams['include-properties'] = mappedParams['includeProperties']
        delete mappedParams['includeProperties']
      }
      if ('includeOperations' in mappedParams) {
        mappedParams['include-operations'] = mappedParams['includeOperations']
        delete mappedParams['includeOperations']
      }
      if ('includeVersions' in mappedParams) {
        mappedParams['include-versions'] = mappedParams['includeVersions']
        delete mappedParams['includeVersions']
      }
      if ('includeVersion' in mappedParams) {
        mappedParams['include-version'] = mappedParams['includeVersion']
        delete mappedParams['includeVersion']
      }
      if ('includeCollaborators' in mappedParams) {
        mappedParams['include-collaborators'] = mappedParams['includeCollaborators']
        delete mappedParams['includeCollaborators']
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

mcpServer.tool(
  'update-custom-content',
  `Update custom content`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/custom-content/${id}`

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
  'delete-custom-content',
  `Delete custom content`,
  {
    id: z.string(),
    purge: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/custom-content/${id}`

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
  'get-custom-content-attachments',
  `Get attachments for custom content`,
  {
    id: z.string(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    status: z.string().optional(),
    mediaType: z.string().optional(),
    filename: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/custom-content/${id}/attachments`

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
  'get-custom-content-comments',
  `Get custom content comments`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/custom-content/${id}/footer-comments`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-custom-content-labels',
  `Get labels for custom content`,
  {
    id: z.string(),
    prefix: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/custom-content/${id}/labels`

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
  'get-custom-content-operations',
  `Get permitted operations for custom content`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/custom-content/${id}/operations`

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
  'get-custom-content-content-properties',
  `Get content properties for custom content`,
  {
    customContentId: z.string(),
    key: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { customContentId, ...otherParams } = args
      const url = `/custom-content/${customContentId}/properties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('customContentId' in mappedParams) {
        mappedParams['custom-content-id'] = mappedParams['customContentId']
        delete mappedParams['customContentId']
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

mcpServer.tool(
  'create-custom-content-property',
  `Create content property for custom content`,
  {
    customContentId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { customContentId, ...otherParams } = args
      const url = `/custom-content/${customContentId}/properties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('customContentId' in mappedParams) {
        mappedParams['custom-content-id'] = mappedParams['customContentId']
        delete mappedParams['customContentId']
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
  'get-custom-content-content-properties-by-id',
  `Get content property for custom content by id`,
  {
    customContentId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { customContentId, propertyId, ...otherParams } = args
      const url = `/custom-content/${customContentId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('customContentId' in mappedParams) {
        mappedParams['custom-content-id'] = mappedParams['customContentId']
        delete mappedParams['customContentId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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

mcpServer.tool(
  'update-custom-content-property-by-id',
  `Update content property for custom content by id`,
  {
    customContentId: z.string(),
    propertyId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { customContentId, propertyId, ...otherParams } = args
      const url = `/custom-content/${customContentId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('customContentId' in mappedParams) {
        mappedParams['custom-content-id'] = mappedParams['customContentId']
        delete mappedParams['customContentId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
      }

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
  'delete-custom-content-property-by-id',
  `Delete content property for custom content by id`,
  {
    customContentId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { customContentId, propertyId, ...otherParams } = args
      const url = `/custom-content/${customContentId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('customContentId' in mappedParams) {
        mappedParams['custom-content-id'] = mappedParams['customContentId']
        delete mappedParams['customContentId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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
  'get-labels',
  `Get labels`,
  {
    labelId: z.string().optional(),
    prefix: z.string().optional(),
    cursor: z.string().optional(),
    sort: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('labelId' in mappedParams) {
        mappedParams['label-id'] = mappedParams['labelId']
        delete mappedParams['labelId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/labels',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-label-attachments',
  `Get attachments for label`,
  {
    id: z.string(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/labels/${id}/attachments`

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
  'get-label-blog-posts',
  `Get blog posts for label`,
  {
    id: z.string(),
    spaceId: z.string().optional(),
    bodyFormat: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/labels/${id}/blogposts`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('spaceId' in mappedParams) {
        mappedParams['space-id'] = mappedParams['spaceId']
        delete mappedParams['spaceId']
      }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-label-pages',
  `Get pages for label`,
  {
    id: z.string(),
    spaceId: z.string().optional(),
    bodyFormat: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/labels/${id}/pages`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('spaceId' in mappedParams) {
        mappedParams['space-id'] = mappedParams['spaceId']
        delete mappedParams['spaceId']
      }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-pages',
  `Get pages`,
  {
    id: z.string().optional(),
    spaceId: z.string().optional(),
    sort: z.string().optional(),
    status: z.string().optional(),
    title: z.string().optional(),
    bodyFormat: z.string().optional(),
    subtype: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('spaceId' in mappedParams) {
        mappedParams['space-id'] = mappedParams['spaceId']
        delete mappedParams['spaceId']
      }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/pages',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'create-page',
  `Create page`,
  {
    embedded: z.string().optional(),
    private: z.string().optional(),
    rootLevel: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('rootLevel' in mappedParams) {
        mappedParams['root-level'] = mappedParams['rootLevel']
        delete mappedParams['rootLevel']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/pages',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-page-by-id',
  `Get page by id`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    getDraft: z.string().optional(),
    status: z.string().optional(),
    version: z.string().optional(),
    includeLabels: z.string().optional(),
    includeProperties: z.string().optional(),
    includeOperations: z.string().optional(),
    includeLikes: z.string().optional(),
    includeVersions: z.string().optional(),
    includeVersion: z.string().optional(),
    includeFavoritedByCurrentUserStatus: z.string().optional(),
    includeWebresources: z.string().optional(),
    includeCollaborators: z.string().optional(),
    includeDirectChildren: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }
      if ('getDraft' in mappedParams) {
        mappedParams['get-draft'] = mappedParams['getDraft']
        delete mappedParams['getDraft']
      }
      if ('includeLabels' in mappedParams) {
        mappedParams['include-labels'] = mappedParams['includeLabels']
        delete mappedParams['includeLabels']
      }
      if ('includeProperties' in mappedParams) {
        mappedParams['include-properties'] = mappedParams['includeProperties']
        delete mappedParams['includeProperties']
      }
      if ('includeOperations' in mappedParams) {
        mappedParams['include-operations'] = mappedParams['includeOperations']
        delete mappedParams['includeOperations']
      }
      if ('includeLikes' in mappedParams) {
        mappedParams['include-likes'] = mappedParams['includeLikes']
        delete mappedParams['includeLikes']
      }
      if ('includeVersions' in mappedParams) {
        mappedParams['include-versions'] = mappedParams['includeVersions']
        delete mappedParams['includeVersions']
      }
      if ('includeVersion' in mappedParams) {
        mappedParams['include-version'] = mappedParams['includeVersion']
        delete mappedParams['includeVersion']
      }
      if ('includeFavoritedByCurrentUserStatus' in mappedParams) {
        mappedParams['include-favorited-by-current-user-status'] =
          mappedParams['includeFavoritedByCurrentUserStatus']
        delete mappedParams['includeFavoritedByCurrentUserStatus']
      }
      if ('includeWebresources' in mappedParams) {
        mappedParams['include-webresources'] = mappedParams['includeWebresources']
        delete mappedParams['includeWebresources']
      }
      if ('includeCollaborators' in mappedParams) {
        mappedParams['include-collaborators'] = mappedParams['includeCollaborators']
        delete mappedParams['includeCollaborators']
      }
      if ('includeDirectChildren' in mappedParams) {
        mappedParams['include-direct-children'] = mappedParams['includeDirectChildren']
        delete mappedParams['includeDirectChildren']
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

mcpServer.tool(
  'update-page',
  `Update page`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}`

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
  'delete-page',
  `Delete page`,
  {
    id: z.string(),
    purge: z.string().optional(),
    draft: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}`

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
  'get-page-attachments',
  `Get attachments for page`,
  {
    id: z.string(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    status: z.string().optional(),
    mediaType: z.string().optional(),
    filename: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/attachments`

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
  'get-custom-content-by-type-in-page',
  `Get custom content by type in page`,
  {
    id: z.string(),
    type: z.string(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    bodyFormat: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/custom-content`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-page-labels',
  `Get labels for page`,
  {
    id: z.string(),
    prefix: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/labels`

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
  'get-page-like-count',
  `Get like count for page`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/likes/count`

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
  'get-page-like-users',
  `Get account IDs of likes for page`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/likes/users`

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
  'get-page-operations',
  `Get permitted operations for page`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/operations`

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
  'get-page-content-properties',
  `Get content properties for page`,
  {
    pageId: z.string(),
    key: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { pageId, ...otherParams } = args
      const url = `/pages/${pageId}/properties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('pageId' in mappedParams) {
        mappedParams['page-id'] = mappedParams['pageId']
        delete mappedParams['pageId']
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

mcpServer.tool(
  'create-page-property',
  `Create content property for page`,
  {
    pageId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { pageId, ...otherParams } = args
      const url = `/pages/${pageId}/properties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('pageId' in mappedParams) {
        mappedParams['page-id'] = mappedParams['pageId']
        delete mappedParams['pageId']
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
  'get-page-content-properties-by-id',
  `Get content property for page by id`,
  {
    pageId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { pageId, propertyId, ...otherParams } = args
      const url = `/pages/${pageId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('pageId' in mappedParams) {
        mappedParams['page-id'] = mappedParams['pageId']
        delete mappedParams['pageId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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

mcpServer.tool(
  'update-page-property-by-id',
  `Update content property for page by id`,
  {
    pageId: z.string(),
    propertyId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { pageId, propertyId, ...otherParams } = args
      const url = `/pages/${pageId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('pageId' in mappedParams) {
        mappedParams['page-id'] = mappedParams['pageId']
        delete mappedParams['pageId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
      }

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
  'delete-page-property-by-id',
  `Delete content property for page by id`,
  {
    pageId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { pageId, propertyId, ...otherParams } = args
      const url = `/pages/${pageId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('pageId' in mappedParams) {
        mappedParams['page-id'] = mappedParams['pageId']
        delete mappedParams['pageId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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
  'post-redact-page',
  `Redact Content in a Confluence Page`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/redact`

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
  'post-redact-blog',
  `Redact Content in a Confluence Blog Post`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/redact`

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
  'update-page-title',
  `Update page title`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/title`

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
  'get-page-versions',
  `Get page versions`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/versions`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'create-whiteboard',
  `Create whiteboard`,
  {
    private: z.string().optional(),
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
        url: '/whiteboards',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-whiteboard-by-id',
  `Get whiteboard by id`,
  {
    id: z.string(),
    includeCollaborators: z.string().optional(),
    includeDirectChildren: z.string().optional(),
    includeOperations: z.string().optional(),
    includeProperties: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/whiteboards/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('includeCollaborators' in mappedParams) {
        mappedParams['include-collaborators'] = mappedParams['includeCollaborators']
        delete mappedParams['includeCollaborators']
      }
      if ('includeDirectChildren' in mappedParams) {
        mappedParams['include-direct-children'] = mappedParams['includeDirectChildren']
        delete mappedParams['includeDirectChildren']
      }
      if ('includeOperations' in mappedParams) {
        mappedParams['include-operations'] = mappedParams['includeOperations']
        delete mappedParams['includeOperations']
      }
      if ('includeProperties' in mappedParams) {
        mappedParams['include-properties'] = mappedParams['includeProperties']
        delete mappedParams['includeProperties']
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

mcpServer.tool(
  'delete-whiteboard',
  `Delete whiteboard`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/whiteboards/${id}`

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
  'get-whiteboard-content-properties',
  `Get content properties for whiteboard`,
  {
    id: z.string(),
    key: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/whiteboards/${id}/properties`

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
  'create-whiteboard-property',
  `Create content property for whiteboard`,
  {
    id: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/whiteboards/${id}/properties`

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
  'get-whiteboard-content-properties-by-id',
  `Get content property for whiteboard by id`,
  {
    whiteboardId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { whiteboardId, propertyId, ...otherParams } = args
      const url = `/whiteboards/${whiteboardId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('whiteboardId' in mappedParams) {
        mappedParams['whiteboard-id'] = mappedParams['whiteboardId']
        delete mappedParams['whiteboardId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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

mcpServer.tool(
  'update-whiteboard-property-by-id',
  `Update content property for whiteboard by id`,
  {
    whiteboardId: z.string(),
    propertyId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { whiteboardId, propertyId, ...otherParams } = args
      const url = `/whiteboards/${whiteboardId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('whiteboardId' in mappedParams) {
        mappedParams['whiteboard-id'] = mappedParams['whiteboardId']
        delete mappedParams['whiteboardId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
      }

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
  'delete-whiteboard-property-by-id',
  `Delete content property for whiteboard by id`,
  {
    whiteboardId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { whiteboardId, propertyId, ...otherParams } = args
      const url = `/whiteboards/${whiteboardId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('whiteboardId' in mappedParams) {
        mappedParams['whiteboard-id'] = mappedParams['whiteboardId']
        delete mappedParams['whiteboardId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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
  'get-whiteboard-operations',
  `Get permitted operations for a whiteboard`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/whiteboards/${id}/operations`

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
  'get-whiteboard-direct-children',
  `Get direct children of a whiteboard`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/whiteboards/${id}/direct-children`

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
  'get-whiteboard-descendants',
  `Get descendants of a whiteboard`,
  {
    id: z.string(),
    limit: z.string().optional(),
    depth: z.string().optional(),
    cursor: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/whiteboards/${id}/descendants`

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
  'get-whiteboard-ancestors',
  `Get all ancestors of whiteboard`,
  {
    id: z.string(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/whiteboards/${id}/ancestors`

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
  'create-database',
  `Create database`,
  {
    private: z.string().optional(),
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
        url: '/databases',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-database-by-id',
  `Get database by id`,
  {
    id: z.string(),
    includeCollaborators: z.string().optional(),
    includeDirectChildren: z.string().optional(),
    includeOperations: z.string().optional(),
    includeProperties: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/databases/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('includeCollaborators' in mappedParams) {
        mappedParams['include-collaborators'] = mappedParams['includeCollaborators']
        delete mappedParams['includeCollaborators']
      }
      if ('includeDirectChildren' in mappedParams) {
        mappedParams['include-direct-children'] = mappedParams['includeDirectChildren']
        delete mappedParams['includeDirectChildren']
      }
      if ('includeOperations' in mappedParams) {
        mappedParams['include-operations'] = mappedParams['includeOperations']
        delete mappedParams['includeOperations']
      }
      if ('includeProperties' in mappedParams) {
        mappedParams['include-properties'] = mappedParams['includeProperties']
        delete mappedParams['includeProperties']
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

mcpServer.tool(
  'delete-database',
  `Delete database`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/databases/${id}`

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
  'get-database-content-properties',
  `Get content properties for database`,
  {
    id: z.string(),
    key: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/databases/${id}/properties`

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
  'create-database-property',
  `Create content property for database`,
  {
    id: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/databases/${id}/properties`

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
  'get-database-content-properties-by-id',
  `Get content property for database by id`,
  {
    databaseId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { databaseId, propertyId, ...otherParams } = args
      const url = `/databases/${databaseId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('databaseId' in mappedParams) {
        mappedParams['database-id'] = mappedParams['databaseId']
        delete mappedParams['databaseId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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

mcpServer.tool(
  'update-database-property-by-id',
  `Update content property for database by id`,
  {
    databaseId: z.string(),
    propertyId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { databaseId, propertyId, ...otherParams } = args
      const url = `/databases/${databaseId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('databaseId' in mappedParams) {
        mappedParams['database-id'] = mappedParams['databaseId']
        delete mappedParams['databaseId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
      }

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
  'delete-database-property-by-id',
  `Delete content property for database by id`,
  {
    databaseId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { databaseId, propertyId, ...otherParams } = args
      const url = `/databases/${databaseId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('databaseId' in mappedParams) {
        mappedParams['database-id'] = mappedParams['databaseId']
        delete mappedParams['databaseId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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
  'get-database-operations',
  `Get permitted operations for a database`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/databases/${id}/operations`

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
  'get-database-direct-children',
  `Get direct children of a database`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/databases/${id}/direct-children`

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
  'get-database-descendants',
  `Get descendants of a database`,
  {
    id: z.string(),
    limit: z.string().optional(),
    depth: z.string().optional(),
    cursor: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/databases/${id}/descendants`

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
  'get-database-ancestors',
  `Get all ancestors of database`,
  {
    id: z.string(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/databases/${id}/ancestors`

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
  'create-smart-link',
  `Create Smart Link in the content tree`,
  {},
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
        url: '/embeds',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-smart-link-by-id',
  `Get Smart Link in the content tree by id`,
  {
    id: z.string(),
    includeCollaborators: z.string().optional(),
    includeDirectChildren: z.string().optional(),
    includeOperations: z.string().optional(),
    includeProperties: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/embeds/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('includeCollaborators' in mappedParams) {
        mappedParams['include-collaborators'] = mappedParams['includeCollaborators']
        delete mappedParams['includeCollaborators']
      }
      if ('includeDirectChildren' in mappedParams) {
        mappedParams['include-direct-children'] = mappedParams['includeDirectChildren']
        delete mappedParams['includeDirectChildren']
      }
      if ('includeOperations' in mappedParams) {
        mappedParams['include-operations'] = mappedParams['includeOperations']
        delete mappedParams['includeOperations']
      }
      if ('includeProperties' in mappedParams) {
        mappedParams['include-properties'] = mappedParams['includeProperties']
        delete mappedParams['includeProperties']
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

mcpServer.tool(
  'delete-smart-link',
  `Delete Smart Link in the content tree`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/embeds/${id}`

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
  'get-smart-link-content-properties',
  `Get content properties for Smart Link in the content tree`,
  {
    id: z.string(),
    key: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/embeds/${id}/properties`

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
  'create-smart-link-property',
  `Create content property for Smart Link in the content tree`,
  {
    id: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/embeds/${id}/properties`

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
  'get-smart-link-content-properties-by-id',
  `Get content property for Smart Link in the content tree by id`,
  {
    embedId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { embedId, propertyId, ...otherParams } = args
      const url = `/embeds/${embedId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('embedId' in mappedParams) {
        mappedParams['embed-id'] = mappedParams['embedId']
        delete mappedParams['embedId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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

mcpServer.tool(
  'update-smart-link-property-by-id',
  `Update content property for Smart Link in the content tree by id`,
  {
    embedId: z.string(),
    propertyId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { embedId, propertyId, ...otherParams } = args
      const url = `/embeds/${embedId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('embedId' in mappedParams) {
        mappedParams['embed-id'] = mappedParams['embedId']
        delete mappedParams['embedId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
      }

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
  'delete-smart-link-property-by-id',
  `Delete content property for Smart Link in the content tree by id`,
  {
    embedId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { embedId, propertyId, ...otherParams } = args
      const url = `/embeds/${embedId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('embedId' in mappedParams) {
        mappedParams['embed-id'] = mappedParams['embedId']
        delete mappedParams['embedId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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
  'get-smart-link-operations',
  `Get permitted operations for a Smart Link in the content tree`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/embeds/${id}/operations`

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
  'get-smart-link-direct-children',
  `Get direct children of a Smart Link`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/embeds/${id}/direct-children`

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
  'get-smart-link-descendants',
  `Get descendants of a smart link`,
  {
    id: z.string(),
    limit: z.string().optional(),
    depth: z.string().optional(),
    cursor: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/embeds/${id}/descendants`

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
  'get-smart-link-ancestors',
  `Get all ancestors of Smart Link in content tree`,
  {
    id: z.string(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/embeds/${id}/ancestors`

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

mcpServer.tool('create-folder', `Create folder`, {}, async (args, extra) => {
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
      url: '/folders',
      data: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-folder-by-id',
  `Get folder by id`,
  {
    id: z.string(),
    includeCollaborators: z.string().optional(),
    includeDirectChildren: z.string().optional(),
    includeOperations: z.string().optional(),
    includeProperties: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/folders/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('includeCollaborators' in mappedParams) {
        mappedParams['include-collaborators'] = mappedParams['includeCollaborators']
        delete mappedParams['includeCollaborators']
      }
      if ('includeDirectChildren' in mappedParams) {
        mappedParams['include-direct-children'] = mappedParams['includeDirectChildren']
        delete mappedParams['includeDirectChildren']
      }
      if ('includeOperations' in mappedParams) {
        mappedParams['include-operations'] = mappedParams['includeOperations']
        delete mappedParams['includeOperations']
      }
      if ('includeProperties' in mappedParams) {
        mappedParams['include-properties'] = mappedParams['includeProperties']
        delete mappedParams['includeProperties']
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

mcpServer.tool(
  'delete-folder',
  `Delete folder`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/folders/${id}`

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
  'get-folder-content-properties',
  `Get content properties for folder`,
  {
    id: z.string(),
    key: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/folders/${id}/properties`

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
  'create-folder-property',
  `Create content property for folder`,
  {
    id: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/folders/${id}/properties`

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
  'get-folder-content-properties-by-id',
  `Get content property for folder by id`,
  {
    folderId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { folderId, propertyId, ...otherParams } = args
      const url = `/folders/${folderId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('folderId' in mappedParams) {
        mappedParams['folder-id'] = mappedParams['folderId']
        delete mappedParams['folderId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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

mcpServer.tool(
  'update-folder-property-by-id',
  `Update content property for folder by id`,
  {
    folderId: z.string(),
    propertyId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { folderId, propertyId, ...otherParams } = args
      const url = `/folders/${folderId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('folderId' in mappedParams) {
        mappedParams['folder-id'] = mappedParams['folderId']
        delete mappedParams['folderId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
      }

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
  'delete-folder-property-by-id',
  `Delete content property for folder by id`,
  {
    folderId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { folderId, propertyId, ...otherParams } = args
      const url = `/folders/${folderId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('folderId' in mappedParams) {
        mappedParams['folder-id'] = mappedParams['folderId']
        delete mappedParams['folderId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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
  'get-folder-operations',
  `Get permitted operations for a folder`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/folders/${id}/operations`

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
  'get-folder-direct-children',
  `Get direct children of a folder`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/folders/${id}/direct-children`

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
  'get-folder-descendants',
  `Get descendants of folder`,
  {
    id: z.string(),
    limit: z.string().optional(),
    depth: z.string().optional(),
    cursor: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/folders/${id}/descendants`

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
  'get-folder-ancestors',
  `Get all ancestors of folder`,
  {
    id: z.string(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/folders/${id}/ancestors`

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
  'get-page-version-details',
  `Get version details for page version`,
  {
    pageId: z.string(),
    versionNumber: z.string(),
  },
  async (args, extra) => {
    try {
      const { pageId, versionNumber, ...otherParams } = args
      const url = `/pages/${pageId}/versions/${versionNumber}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('pageId' in mappedParams) {
        mappedParams['page-id'] = mappedParams['pageId']
        delete mappedParams['pageId']
      }
      if ('versionNumber' in mappedParams) {
        mappedParams['version-number'] = mappedParams['versionNumber']
        delete mappedParams['versionNumber']
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

mcpServer.tool(
  'get-custom-content-versions',
  `Get custom content versions`,
  {
    customContentId: z.string(),
    bodyFormat: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { customContentId, ...otherParams } = args
      const url = `/custom-content/${customContentId}/versions`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('customContentId' in mappedParams) {
        mappedParams['custom-content-id'] = mappedParams['customContentId']
        delete mappedParams['customContentId']
      }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-custom-content-version-details',
  `Get version details for custom content version`,
  {
    customContentId: z.string(),
    versionNumber: z.string(),
  },
  async (args, extra) => {
    try {
      const { customContentId, versionNumber, ...otherParams } = args
      const url = `/custom-content/${customContentId}/versions/${versionNumber}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('customContentId' in mappedParams) {
        mappedParams['custom-content-id'] = mappedParams['customContentId']
        delete mappedParams['customContentId']
      }
      if ('versionNumber' in mappedParams) {
        mappedParams['version-number'] = mappedParams['versionNumber']
        delete mappedParams['versionNumber']
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

mcpServer.tool(
  'get-spaces',
  `Get spaces`,
  {
    ids: z.string().optional(),
    keys: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    labels: z.string().optional(),
    favoritedBy: z.string().optional(),
    notFavoritedBy: z.string().optional(),
    sort: z.string().optional(),
    descriptionFormat: z.string().optional(),
    includeIcon: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('favoritedBy' in mappedParams) {
        mappedParams['favorited-by'] = mappedParams['favoritedBy']
        delete mappedParams['favoritedBy']
      }
      if ('notFavoritedBy' in mappedParams) {
        mappedParams['not-favorited-by'] = mappedParams['notFavoritedBy']
        delete mappedParams['notFavoritedBy']
      }
      if ('descriptionFormat' in mappedParams) {
        mappedParams['description-format'] = mappedParams['descriptionFormat']
        delete mappedParams['descriptionFormat']
      }
      if ('includeIcon' in mappedParams) {
        mappedParams['include-icon'] = mappedParams['includeIcon']
        delete mappedParams['includeIcon']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/spaces',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('create-space', `Create space`, {}, async (args, extra) => {
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
      url: '/spaces',
      data: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'get-space-by-id',
  `Get space by id`,
  {
    id: z.string(),
    descriptionFormat: z.string().optional(),
    includeIcon: z.string().optional(),
    includeOperations: z.string().optional(),
    includeProperties: z.string().optional(),
    includePermissions: z.string().optional(),
    includeRoleAssignments: z.string().optional(),
    includeLabels: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('descriptionFormat' in mappedParams) {
        mappedParams['description-format'] = mappedParams['descriptionFormat']
        delete mappedParams['descriptionFormat']
      }
      if ('includeIcon' in mappedParams) {
        mappedParams['include-icon'] = mappedParams['includeIcon']
        delete mappedParams['includeIcon']
      }
      if ('includeOperations' in mappedParams) {
        mappedParams['include-operations'] = mappedParams['includeOperations']
        delete mappedParams['includeOperations']
      }
      if ('includeProperties' in mappedParams) {
        mappedParams['include-properties'] = mappedParams['includeProperties']
        delete mappedParams['includeProperties']
      }
      if ('includePermissions' in mappedParams) {
        mappedParams['include-permissions'] = mappedParams['includePermissions']
        delete mappedParams['includePermissions']
      }
      if ('includeRoleAssignments' in mappedParams) {
        mappedParams['include-role-assignments'] = mappedParams['includeRoleAssignments']
        delete mappedParams['includeRoleAssignments']
      }
      if ('includeLabels' in mappedParams) {
        mappedParams['include-labels'] = mappedParams['includeLabels']
        delete mappedParams['includeLabels']
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

mcpServer.tool(
  'get-blog-posts-in-space',
  `Get blog posts in space`,
  {
    id: z.string(),
    sort: z.string().optional(),
    status: z.string().optional(),
    title: z.string().optional(),
    bodyFormat: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}/blogposts`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-space-labels',
  `Get labels for space`,
  {
    id: z.string(),
    prefix: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}/labels`

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
  'get-space-content-labels',
  `Get labels for space content`,
  {
    id: z.string(),
    prefix: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}/content/labels`

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
  'get-custom-content-by-type-in-space',
  `Get custom content by type in space`,
  {
    id: z.string(),
    type: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    bodyFormat: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}/custom-content`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-space-operations',
  `Get permitted operations for space`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}/operations`

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
  'get-pages-in-space',
  `Get pages in space`,
  {
    id: z.string(),
    depth: z.string().optional(),
    sort: z.string().optional(),
    status: z.string().optional(),
    title: z.string().optional(),
    bodyFormat: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}/pages`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-space-properties',
  `Get space properties in space`,
  {
    spaceId: z.string(),
    key: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { spaceId, ...otherParams } = args
      const url = `/spaces/${spaceId}/properties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('spaceId' in mappedParams) {
        mappedParams['space-id'] = mappedParams['spaceId']
        delete mappedParams['spaceId']
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

mcpServer.tool(
  'create-space-property',
  `Create space property in space`,
  {
    spaceId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { spaceId, ...otherParams } = args
      const url = `/spaces/${spaceId}/properties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('spaceId' in mappedParams) {
        mappedParams['space-id'] = mappedParams['spaceId']
        delete mappedParams['spaceId']
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
  'get-space-property-by-id',
  `Get space property by id`,
  {
    spaceId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { spaceId, propertyId, ...otherParams } = args
      const url = `/spaces/${spaceId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('spaceId' in mappedParams) {
        mappedParams['space-id'] = mappedParams['spaceId']
        delete mappedParams['spaceId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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

mcpServer.tool(
  'update-space-property-by-id',
  `Update space property by id`,
  {
    spaceId: z.string(),
    propertyId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { spaceId, propertyId, ...otherParams } = args
      const url = `/spaces/${spaceId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('spaceId' in mappedParams) {
        mappedParams['space-id'] = mappedParams['spaceId']
        delete mappedParams['spaceId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
      }

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
  'delete-space-property-by-id',
  `Delete space property by id`,
  {
    spaceId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { spaceId, propertyId, ...otherParams } = args
      const url = `/spaces/${spaceId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('spaceId' in mappedParams) {
        mappedParams['space-id'] = mappedParams['spaceId']
        delete mappedParams['spaceId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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
  'get-space-permissions-assignments',
  `Get space permissions assignments`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}/permissions`

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
  'get-available-space-permissions',
  `Get available space permissions`,
  {
    cursor: z.string().optional(),
    limit: z.string().optional(),
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
        url: '/space-permissions',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-available-space-roles',
  `Get available space roles`,
  {
    spaceId: z.string().optional(),
    roleType: z.string().optional(),
    principalId: z.string().optional(),
    principalType: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('spaceId' in mappedParams) {
        mappedParams['space-id'] = mappedParams['spaceId']
        delete mappedParams['spaceId']
      }
      if ('roleType' in mappedParams) {
        mappedParams['role-type'] = mappedParams['roleType']
        delete mappedParams['roleType']
      }
      if ('principalId' in mappedParams) {
        mappedParams['principal-id'] = mappedParams['principalId']
        delete mappedParams['principalId']
      }
      if ('principalType' in mappedParams) {
        mappedParams['principal-type'] = mappedParams['principalType']
        delete mappedParams['principalType']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/space-roles',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-space-roles-by-id',
  `Get space role by ID`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/space-roles/${id}`

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
  'get-space-role-assignments',
  `Get space role assignments`,
  {
    id: z.string(),
    roleId: z.string().optional(),
    roleType: z.string().optional(),
    principalId: z.string().optional(),
    principalType: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}/role-assignments`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('roleId' in mappedParams) {
        mappedParams['role-id'] = mappedParams['roleId']
        delete mappedParams['roleId']
      }
      if ('roleType' in mappedParams) {
        mappedParams['role-type'] = mappedParams['roleType']
        delete mappedParams['roleType']
      }
      if ('principalId' in mappedParams) {
        mappedParams['principal-id'] = mappedParams['principalId']
        delete mappedParams['principalId']
      }
      if ('principalType' in mappedParams) {
        mappedParams['principal-type'] = mappedParams['principalType']
        delete mappedParams['principalType']
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

mcpServer.tool(
  'set-space-role-assignments',
  `Set space role assignments`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}/role-assignments`

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
  'get-page-footer-comments',
  `Get footer comments for page`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    status: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/footer-comments`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-page-inline-comments',
  `Get inline comments for page`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    status: z.string().optional(),
    resolutionStatus: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/inline-comments`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }
      if ('resolutionStatus' in mappedParams) {
        mappedParams['resolution-status'] = mappedParams['resolutionStatus']
        delete mappedParams['resolutionStatus']
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

mcpServer.tool(
  'get-blog-post-footer-comments',
  `Get footer comments for blog post`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    status: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/footer-comments`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-blog-post-inline-comments',
  `Get inline comments for blog post`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    status: z.string().optional(),
    resolutionStatus: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/inline-comments`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }
      if ('resolutionStatus' in mappedParams) {
        mappedParams['resolution-status'] = mappedParams['resolutionStatus']
        delete mappedParams['resolutionStatus']
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

mcpServer.tool(
  'get-footer-comments',
  `Get footer comments`,
  {
    bodyFormat: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/footer-comments',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'create-footer-comment',
  `Create footer comment`,
  {
    requestData: z.record(z.any()).optional(),
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
        url: '/footer-comments',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-footer-comment-by-id',
  `Get footer comment by id`,
  {
    commentId: z.string(),
    bodyFormat: z.string().optional(),
    version: z.string().optional(),
    includeProperties: z.string().optional(),
    includeOperations: z.string().optional(),
    includeLikes: z.string().optional(),
    includeVersions: z.string().optional(),
    includeVersion: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { commentId, ...otherParams } = args
      const url = `/footer-comments/${commentId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('commentId' in mappedParams) {
        mappedParams['comment-id'] = mappedParams['commentId']
        delete mappedParams['commentId']
      }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }
      if ('includeProperties' in mappedParams) {
        mappedParams['include-properties'] = mappedParams['includeProperties']
        delete mappedParams['includeProperties']
      }
      if ('includeOperations' in mappedParams) {
        mappedParams['include-operations'] = mappedParams['includeOperations']
        delete mappedParams['includeOperations']
      }
      if ('includeLikes' in mappedParams) {
        mappedParams['include-likes'] = mappedParams['includeLikes']
        delete mappedParams['includeLikes']
      }
      if ('includeVersions' in mappedParams) {
        mappedParams['include-versions'] = mappedParams['includeVersions']
        delete mappedParams['includeVersions']
      }
      if ('includeVersion' in mappedParams) {
        mappedParams['include-version'] = mappedParams['includeVersion']
        delete mappedParams['includeVersion']
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

mcpServer.tool(
  'update-footer-comment',
  `Update footer comment`,
  {
    commentId: z.string(),
  },
  async (args, extra) => {
    try {
      const { commentId, ...otherParams } = args
      const url = `/footer-comments/${commentId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('commentId' in mappedParams) {
        mappedParams['comment-id'] = mappedParams['commentId']
        delete mappedParams['commentId']
      }

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
  'delete-footer-comment',
  `Delete footer comment`,
  {
    commentId: z.string(),
  },
  async (args, extra) => {
    try {
      const { commentId, ...otherParams } = args
      const url = `/footer-comments/${commentId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('commentId' in mappedParams) {
        mappedParams['comment-id'] = mappedParams['commentId']
        delete mappedParams['commentId']
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
  'get-footer-comment-children',
  `Get children footer comments`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/footer-comments/${id}/children`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-footer-like-count',
  `Get like count for footer comment`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/footer-comments/${id}/likes/count`

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
  'get-footer-like-users',
  `Get account IDs of likes for footer comment`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/footer-comments/${id}/likes/users`

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
  'get-footer-comment-operations',
  `Get permitted operations for footer comment`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/footer-comments/${id}/operations`

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
  'get-footer-comment-versions',
  `Get footer comment versions`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/footer-comments/${id}/versions`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-footer-comment-version-details',
  `Get version details for footer comment version`,
  {
    id: z.string(),
    versionNumber: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, versionNumber, ...otherParams } = args
      const url = `/footer-comments/${id}/versions/${versionNumber}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('versionNumber' in mappedParams) {
        mappedParams['version-number'] = mappedParams['versionNumber']
        delete mappedParams['versionNumber']
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

mcpServer.tool(
  'get-inline-comments',
  `Get inline comments`,
  {
    bodyFormat: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/inline-comments',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'create-inline-comment',
  `Create inline comment`,
  {
    requestData: z.record(z.any()).optional(),
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
        url: '/inline-comments',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-inline-comment-by-id',
  `Get inline comment by id`,
  {
    commentId: z.string(),
    bodyFormat: z.string().optional(),
    version: z.string().optional(),
    includeProperties: z.string().optional(),
    includeOperations: z.string().optional(),
    includeLikes: z.string().optional(),
    includeVersions: z.string().optional(),
    includeVersion: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { commentId, ...otherParams } = args
      const url = `/inline-comments/${commentId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('commentId' in mappedParams) {
        mappedParams['comment-id'] = mappedParams['commentId']
        delete mappedParams['commentId']
      }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }
      if ('includeProperties' in mappedParams) {
        mappedParams['include-properties'] = mappedParams['includeProperties']
        delete mappedParams['includeProperties']
      }
      if ('includeOperations' in mappedParams) {
        mappedParams['include-operations'] = mappedParams['includeOperations']
        delete mappedParams['includeOperations']
      }
      if ('includeLikes' in mappedParams) {
        mappedParams['include-likes'] = mappedParams['includeLikes']
        delete mappedParams['includeLikes']
      }
      if ('includeVersions' in mappedParams) {
        mappedParams['include-versions'] = mappedParams['includeVersions']
        delete mappedParams['includeVersions']
      }
      if ('includeVersion' in mappedParams) {
        mappedParams['include-version'] = mappedParams['includeVersion']
        delete mappedParams['includeVersion']
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

mcpServer.tool(
  'update-inline-comment',
  `Update inline comment`,
  {
    commentId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { commentId, ...otherParams } = args
      const url = `/inline-comments/${commentId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('commentId' in mappedParams) {
        mappedParams['comment-id'] = mappedParams['commentId']
        delete mappedParams['commentId']
      }

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
  'delete-inline-comment',
  `Delete inline comment`,
  {
    commentId: z.string(),
  },
  async (args, extra) => {
    try {
      const { commentId, ...otherParams } = args
      const url = `/inline-comments/${commentId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('commentId' in mappedParams) {
        mappedParams['comment-id'] = mappedParams['commentId']
        delete mappedParams['commentId']
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
  'get-inline-comment-children',
  `Get children inline comments`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/inline-comments/${id}/children`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-inline-like-count',
  `Get like count for inline comment`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/inline-comments/${id}/likes/count`

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
  'get-inline-like-users',
  `Get account IDs of likes for inline comment`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/inline-comments/${id}/likes/users`

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
  'get-inline-comment-operations',
  `Get permitted operations for inline comment`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/inline-comments/${id}/operations`

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
  'get-inline-comment-versions',
  `Get inline comment versions`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/inline-comments/${id}/versions`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'get-inline-comment-version-details',
  `Get version details for inline comment version`,
  {
    id: z.string(),
    versionNumber: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, versionNumber, ...otherParams } = args
      const url = `/inline-comments/${id}/versions/${versionNumber}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('versionNumber' in mappedParams) {
        mappedParams['version-number'] = mappedParams['versionNumber']
        delete mappedParams['versionNumber']
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

mcpServer.tool(
  'get-comment-content-properties',
  `Get content properties for comment`,
  {
    commentId: z.string(),
    key: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { commentId, ...otherParams } = args
      const url = `/comments/${commentId}/properties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('commentId' in mappedParams) {
        mappedParams['comment-id'] = mappedParams['commentId']
        delete mappedParams['commentId']
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

mcpServer.tool(
  'create-comment-property',
  `Create content property for comment`,
  {
    commentId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { commentId, ...otherParams } = args
      const url = `/comments/${commentId}/properties`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('commentId' in mappedParams) {
        mappedParams['comment-id'] = mappedParams['commentId']
        delete mappedParams['commentId']
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
  'get-comment-content-properties-by-id',
  `Get content property for comment by id`,
  {
    commentId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { commentId, propertyId, ...otherParams } = args
      const url = `/comments/${commentId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('commentId' in mappedParams) {
        mappedParams['comment-id'] = mappedParams['commentId']
        delete mappedParams['commentId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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

mcpServer.tool(
  'update-comment-property-by-id',
  `Update content property for comment by id`,
  {
    commentId: z.string(),
    propertyId: z.string(),
    requestData: z.record(z.any()).optional(),
  },
  async (args, extra) => {
    try {
      const { commentId, propertyId, ...otherParams } = args
      const url = `/comments/${commentId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('commentId' in mappedParams) {
        mappedParams['comment-id'] = mappedParams['commentId']
        delete mappedParams['commentId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
      }

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
  'delete-comment-property-by-id',
  `Delete content property for comment by id`,
  {
    commentId: z.string(),
    propertyId: z.string(),
  },
  async (args, extra) => {
    try {
      const { commentId, propertyId, ...otherParams } = args
      const url = `/comments/${commentId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('commentId' in mappedParams) {
        mappedParams['comment-id'] = mappedParams['commentId']
        delete mappedParams['commentId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property-id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
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
  'get-tasks',
  `Get tasks`,
  {
    bodyFormat: z.string().optional(),
    includeBlankTasks: z.string().optional(),
    status: z.string().optional(),
    taskId: z.string().optional(),
    spaceId: z.string().optional(),
    pageId: z.string().optional(),
    blogpostId: z.string().optional(),
    createdBy: z.string().optional(),
    assignedTo: z.string().optional(),
    completedBy: z.string().optional(),
    createdAtFrom: z.string().optional(),
    createdAtTo: z.string().optional(),
    dueAtFrom: z.string().optional(),
    dueAtTo: z.string().optional(),
    completedAtFrom: z.string().optional(),
    completedAtTo: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }
      if ('includeBlankTasks' in mappedParams) {
        mappedParams['include-blank-tasks'] = mappedParams['includeBlankTasks']
        delete mappedParams['includeBlankTasks']
      }
      if ('taskId' in mappedParams) {
        mappedParams['task-id'] = mappedParams['taskId']
        delete mappedParams['taskId']
      }
      if ('spaceId' in mappedParams) {
        mappedParams['space-id'] = mappedParams['spaceId']
        delete mappedParams['spaceId']
      }
      if ('pageId' in mappedParams) {
        mappedParams['page-id'] = mappedParams['pageId']
        delete mappedParams['pageId']
      }
      if ('blogpostId' in mappedParams) {
        mappedParams['blogpost-id'] = mappedParams['blogpostId']
        delete mappedParams['blogpostId']
      }
      if ('createdBy' in mappedParams) {
        mappedParams['created-by'] = mappedParams['createdBy']
        delete mappedParams['createdBy']
      }
      if ('assignedTo' in mappedParams) {
        mappedParams['assigned-to'] = mappedParams['assignedTo']
        delete mappedParams['assignedTo']
      }
      if ('completedBy' in mappedParams) {
        mappedParams['completed-by'] = mappedParams['completedBy']
        delete mappedParams['completedBy']
      }
      if ('createdAtFrom' in mappedParams) {
        mappedParams['created-at-from'] = mappedParams['createdAtFrom']
        delete mappedParams['createdAtFrom']
      }
      if ('createdAtTo' in mappedParams) {
        mappedParams['created-at-to'] = mappedParams['createdAtTo']
        delete mappedParams['createdAtTo']
      }
      if ('dueAtFrom' in mappedParams) {
        mappedParams['due-at-from'] = mappedParams['dueAtFrom']
        delete mappedParams['dueAtFrom']
      }
      if ('dueAtTo' in mappedParams) {
        mappedParams['due-at-to'] = mappedParams['dueAtTo']
        delete mappedParams['dueAtTo']
      }
      if ('completedAtFrom' in mappedParams) {
        mappedParams['completed-at-from'] = mappedParams['completedAtFrom']
        delete mappedParams['completedAtFrom']
      }
      if ('completedAtTo' in mappedParams) {
        mappedParams['completed-at-to'] = mappedParams['completedAtTo']
        delete mappedParams['completedAtTo']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/tasks',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-task-by-id',
  `Get task by id`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/tasks/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
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

mcpServer.tool(
  'update-task',
  `Update task`,
  {
    id: z.string(),
    bodyFormat: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/tasks/${id}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('bodyFormat' in mappedParams) {
        mappedParams['body-format'] = mappedParams['bodyFormat']
        delete mappedParams['bodyFormat']
      }

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
  'get-child-pages',
  `Get child pages`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/children`

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
  'get-child-custom-content',
  `Get child custom content`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/custom-content/${id}/children`

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
  'get-page-direct-children',
  `Get direct children of a page`,
  {
    id: z.string(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/direct-children`

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
  'get-page-ancestors',
  `Get all ancestors of page`,
  {
    id: z.string(),
    limit: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/ancestors`

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
  'get-page-descendants',
  `Get descendants of page`,
  {
    id: z.string(),
    limit: z.string().optional(),
    depth: z.string().optional(),
    cursor: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/descendants`

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
  'create-bulk-user-lookup',
  `Create bulk user lookup using ids`,
  {},
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
        url: '/users-bulk',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'check-access-by-email',
  `Check site access for a list of emails`,
  {},
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
        url: '/user/access/check-access-by-email',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'invite-by-email',
  `Invite a list of emails to the site`,
  {},
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
        url: '/user/access/invite-by-email',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-data-policy-metadata',
  `Get data policy metadata for the workspace`,
  {},
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
        url: '/data-policies/metadata',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-data-policy-spaces',
  `Get spaces with data policies`,
  {
    ids: z.string().optional(),
    keys: z.string().optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional(),
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
        url: '/data-policies/spaces',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-classification-levels',
  `Get list of classification levels`,
  {},
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
        url: '/classification-levels',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-space-default-classification-level',
  `Get space default classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}/classification-level/default`

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
  'put-space-default-classification-level',
  `Update space default classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}/classification-level/default`

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
  'delete-space-default-classification-level',
  `Delete space default classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/spaces/${id}/classification-level/default`

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
  'get-page-classification-level',
  `Get page classification level`,
  {
    id: z.string(),
    status: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/classification-level`

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
  'put-page-classification-level',
  `Update page classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/classification-level`

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
  'post-page-classification-level',
  `Reset page classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/pages/${id}/classification-level/reset`

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
  'get-blog-post-classification-level',
  `Get blog post classification level`,
  {
    id: z.string(),
    status: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/classification-level`

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
  'put-blog-post-classification-level',
  `Update blog post classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/classification-level`

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
  'post-blog-post-classification-level',
  `Reset blog post classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/blogposts/${id}/classification-level/reset`

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
  'get-whiteboard-classification-level',
  `Get whiteboard classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/whiteboards/${id}/classification-level`

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
  'put-whiteboard-classification-level',
  `Update whiteboard classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/whiteboards/${id}/classification-level`

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
  'post-whiteboard-classification-level',
  `Reset whiteboard classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/whiteboards/${id}/classification-level/reset`

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
  'get-database-classification-level',
  `Get database classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/databases/${id}/classification-level`

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
  'put-database-classification-level',
  `Update database classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/databases/${id}/classification-level`

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
  'post-database-classification-level',
  `Reset database classification level`,
  {
    id: z.string(),
  },
  async (args, extra) => {
    try {
      const { id, ...otherParams } = args
      const url = `/databases/${id}/classification-level/reset`

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
  'put-forge-app-property',
  `Create or update a Forge app property.`,
  {
    propertyKey: z.string(),
  },
  async (args, extra) => {
    try {
      const { propertyKey, ...otherParams } = args
      const url = `/app/properties/${propertyKey}`

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
  'delete-forge-app-property',
  `Deletes a Forge app property.`,
  {
    propertyKey: z.string(),
  },
  async (args, extra) => {
    try {
      const { propertyKey, ...otherParams } = args
      const url = `/app/properties/${propertyKey}`

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
