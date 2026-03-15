import { createMockModelContext } from './mocks/modelContext.js'

const mockContext = createMockModelContext()

Object.defineProperty(globalThis, 'navigator', {
  value: {
    ...globalThis.navigator,
    modelContext: mockContext,
  },
  writable: true,
  configurable: true,
})

// Export for tests to access
export { mockContext }
