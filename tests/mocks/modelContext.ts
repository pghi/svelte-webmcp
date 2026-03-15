export function createMockModelContext() {
  const tools = new Map<string, any>()

  return {
    registerTool(tool: any) {
      tools.set(tool.name, tool)
    },
    unregisterTool(name: string) {
      tools.delete(name)
    },
    provideContext(context: any) {
      tools.clear()
      for (const tool of context.tools || []) {
        tools.set(tool.name, tool)
      }
    },
    clearContext() {
      tools.clear()
    },
    // Test helpers
    _getTools() { return tools },
    _getTool(name: string) { return tools.get(name) },
    async _invokeTool(name: string, input: any) {
      const tool = tools.get(name)
      if (!tool) throw new Error(`Tool ${name} not found`)
      return tool.execute(input, { requestUserInteraction: async (cb: any) => cb() })
    },
  }
}
