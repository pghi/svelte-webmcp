import { describe, it, expect, beforeEach } from 'vitest'
import {
  addToRegistry,
  removeFromRegistry,
  recordInvocation,
  getToolRegistry,
  getRegisteredToolCount,
} from '../src/lib/registry.svelte.js'

describe('registry', () => {
  beforeEach(() => {
    // Clear registry by removing all tools
    const registry = getToolRegistry()
    for (const name of registry.keys()) {
      removeFromRegistry(name)
    }
  })

  it('adds a tool to the registry', () => {
    addToRegistry('test-tool', { description: 'A test tool' })
    expect(getRegisteredToolCount()).toBe(1)

    const registry = getToolRegistry()
    const tool = registry.get('test-tool')
    expect(tool).toBeDefined()
    expect(tool!.name).toBe('test-tool')
    expect(tool!.description).toBe('A test tool')
    expect(tool!.invocationCount).toBe(0)
    expect(tool!.lastInvokedAt).toBeNull()
  })

  it('removes a tool from the registry', () => {
    addToRegistry('test-tool', { description: 'A test tool' })
    expect(getRegisteredToolCount()).toBe(1)

    removeFromRegistry('test-tool')
    expect(getRegisteredToolCount()).toBe(0)
  })

  it('records invocations', () => {
    addToRegistry('test-tool', { description: 'A test tool' })
    recordInvocation('test-tool')

    const tool = getToolRegistry().get('test-tool')
    expect(tool!.invocationCount).toBe(1)
    expect(tool!.lastInvokedAt).toBeInstanceOf(Date)
  })

  it('tracks multiple tools', () => {
    addToRegistry('tool-a', { description: 'Tool A' })
    addToRegistry('tool-b', { description: 'Tool B' })
    expect(getRegisteredToolCount()).toBe(2)

    removeFromRegistry('tool-a')
    expect(getRegisteredToolCount()).toBe(1)
    expect(getToolRegistry().has('tool-b')).toBe(true)
  })

  it('handles removing non-existent tool gracefully', () => {
    removeFromRegistry('nonexistent')
    expect(getRegisteredToolCount()).toBe(0)
  })

  it('handles recording invocation for non-existent tool gracefully', () => {
    recordInvocation('nonexistent')
    // Should not throw
  })
})
