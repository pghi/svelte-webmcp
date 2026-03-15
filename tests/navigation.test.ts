import { describe, it, expect } from 'vitest'
import { enableNavigationGuards } from '../src/lib/navigation.js'

describe('enableNavigationGuards', () => {
  it('does not throw when called in browser environment', () => {
    // In jsdom environment, window is defined but $app/navigation is not
    // The function should handle this gracefully
    expect(() => enableNavigationGuards()).not.toThrow()
  })
})
