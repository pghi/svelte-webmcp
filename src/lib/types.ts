// W3C WebMCP spec types

export interface ModelContextTool {
  name: string
  description: string
  inputSchema?: object
  execute: (input: any, client: ModelContextClient) => Promise<any>
  annotations?: ToolAnnotations
}

export interface ModelContextClient {
  requestUserInteraction: (callback: () => Promise<any>) => Promise<any>
}

export interface ToolAnnotations {
  readOnlyHint?: boolean
}

export interface ModelContext {
  registerTool(tool: ModelContextTool): void
  unregisterTool(name: string): void
  provideContext(context: { tools: ModelContextTool[] }): void
  clearContext(): void
}

// Augment Navigator
declare global {
  interface Navigator {
    modelContext: ModelContext
  }
}

// Package-specific types
export interface WebMCPFormOptions {
  name: string
  description: string
  autosubmit?: boolean
}

export interface WebMCPParamOptions {
  description: string
  title?: string
}

export interface RegisteredTool {
  name: string
  description: string
  registeredAt: Date
  invocationCount: number
  lastInvokedAt: Date | null
}
