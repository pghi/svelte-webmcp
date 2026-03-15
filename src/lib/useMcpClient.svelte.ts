import { getContext } from 'svelte'

interface McpClientContext {
  readonly client: any
  readonly isConnected: boolean
  readonly tools: any[]
}

export function useMcpClient(): McpClientContext {
  return getContext<McpClientContext>('mcp-client')
}
