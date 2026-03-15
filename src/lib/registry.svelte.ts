import type { RegisteredTool } from './types.js'

let tools = $state<Map<string, RegisteredTool>>(new Map())

export function addToRegistry(name: string, options: { description: string }) {
  tools.set(name, {
    name,
    description: options.description,
    registeredAt: new Date(),
    invocationCount: 0,
    lastInvokedAt: null,
  })
  tools = new Map(tools)
}

export function removeFromRegistry(name: string) {
  tools.delete(name)
  tools = new Map(tools)
}

export function recordInvocation(name: string) {
  const tool = tools.get(name)
  if (tool) {
    tool.invocationCount++
    tool.lastInvokedAt = new Date()
    tools = new Map(tools)
  }
}

export function getToolRegistry(): ReadonlyMap<string, RegisteredTool> {
  return tools
}

export function getRegisteredToolCount(): number {
  return tools.size
}
