import { onMount, onDestroy } from 'svelte'
import { getModelContext } from './browser.js'

export function useWebMCPContext(name: string, getData: () => any): void {
  let registered = false
  const toolName = `context_${name}`

  function registerContext(data: any) {
    const ctx = getModelContext()
    if (!ctx) return

    if (registered) {
      ctx.unregisterTool(toolName)
    }

    ctx.registerTool({
      name: toolName,
      description: `Read-only context: ${name}`,
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => {
        return { content: [{ type: 'text', text: JSON.stringify(data) }] }
      },
    })
    registered = true
  }

  onMount(() => {
    registerContext(getData())
  })

  onDestroy(() => {
    if (!registered) return
    const ctx = getModelContext()
    ctx?.unregisterTool(toolName)
    registered = false
  })

  $effect(() => {
    if (!registered) return
    const data = getData()
    registerContext(data)
  })
}
