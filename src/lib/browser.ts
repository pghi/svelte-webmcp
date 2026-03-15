import type { ModelContext } from './types.js'

const isBrowser = typeof window !== 'undefined'

export const browser = isBrowser

export function getModelContext(): ModelContext | null {
  if (!isBrowser) return null
  if (!('modelContext' in navigator)) {
    console.warn(
      'svelte-webmcp: navigator.modelContext not available. ' +
      'Install @mcp-b/global polyfill or enable chrome://flags/#enable-webmcp-testing',
    )
    return null
  }
  return navigator.modelContext
}
