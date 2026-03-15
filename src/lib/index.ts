// Imperative API
export { useWebMCP } from './useWebMCP.svelte.js'
export { useWebMCPContext } from './useWebMCPContext.svelte.js'

// Client API
export { default as McpClientProvider } from './McpClientProvider.svelte'
export { useMcpClient } from './useMcpClient.svelte.js'

// Declarative API (actions)
export { webmcpForm } from './actions/webmcpForm.js'
export { webmcpParam } from './actions/webmcpParam.js'

// Declarative API (component)
export { default as WebMCPForm } from './WebMCPForm.svelte'

// Utilities
export { getToolRegistry, getRegisteredToolCount } from './registry.svelte.js'
export { enableNavigationGuards } from './navigation.js'
export { getModelContext } from './browser.js'

// Types
export type {
  ModelContextTool,
  ModelContextClient,
  ToolAnnotations,
  ModelContext,
  WebMCPFormOptions,
  WebMCPParamOptions,
  RegisteredTool,
} from './types.js'
