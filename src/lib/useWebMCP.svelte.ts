import { onMount, onDestroy } from 'svelte'
import { getModelContext } from './browser.js'
import { zodToJsonSchema } from './schema.js'
import { addToRegistry, removeFromRegistry, recordInvocation } from './registry.svelte.js'
import type { ZodType } from 'zod'

interface UseWebMCPOptions<T extends Record<string, ZodType>> {
  name: string
  description: string
  inputSchema: T
  handler: (input: { [K in keyof T]: T[K]['_output'] }) => Promise<any>
  annotations?: {
    readOnlyHint?: boolean
  }
}

interface UseWebMCPReturn {
  readonly isExecuting: boolean
  readonly error: Error | null
  readonly lastResult: any
  readonly isRegistered: boolean
}

function validateInput<T extends Record<string, ZodType>>(
  schema: T,
  input: Record<string, unknown>,
): { [K in keyof T]: T[K]['_output'] } {
  const result: Record<string, unknown> = {}
  for (const [key, zodSchema] of Object.entries(schema)) {
    result[key] = zodSchema.parse(input[key])
  }
  return result as any
}

export function useWebMCP<T extends Record<string, ZodType>>(
  options: UseWebMCPOptions<T>,
): UseWebMCPReturn {
  let isExecuting = $state(false)
  let error = $state<Error | null>(null)
  let lastResult = $state<any>(null)
  let isRegistered = $state(false)

  const jsonSchema = zodToJsonSchema(options.inputSchema)

  function register() {
    const ctx = getModelContext()
    if (!ctx) return

    ctx.registerTool({
      name: options.name,
      description: options.description,
      inputSchema: jsonSchema,
      annotations: options.annotations,
      execute: async (input, client) => {
        isExecuting = true
        error = null
        try {
          const validated = validateInput(options.inputSchema, input)
          recordInvocation(options.name)
          const result = await options.handler(validated)
          lastResult = result
          return result
        } catch (e) {
          error = e instanceof Error ? e : new Error(String(e))
          throw e
        } finally {
          isExecuting = false
        }
      },
    })

    isRegistered = true
    addToRegistry(options.name, options)
  }

  function unregister() {
    const ctx = getModelContext()
    if (!ctx || !isRegistered) return
    ctx.unregisterTool(options.name)
    isRegistered = false
    removeFromRegistry(options.name)
  }

  onMount(() => register())
  onDestroy(() => unregister())

  return {
    get isExecuting() { return isExecuting },
    get error() { return error },
    get lastResult() { return lastResult },
    get isRegistered() { return isRegistered },
  }
}
