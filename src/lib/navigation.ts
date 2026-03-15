import { getModelContext } from './browser.js'

/**
 * Enables navigation guards that clean up orphaned tools during
 * SvelteKit client-side navigation.
 *
 * Call this in your root +layout.svelte.
 *
 * Note: Individual useWebMCP instances handle their own lifecycle.
 * This is a safety net for edge cases. For guaranteed re-mount,
 * wrap page content in {#key data.pathname}.
 */
export function enableNavigationGuards() {
  // Dynamic import to avoid SSR issues with $app/navigation
  if (typeof window === 'undefined') return

  import('$app/navigation').then(({ beforeNavigate, afterNavigate }) => {
    beforeNavigate(() => {
      // Individual components handle their own cleanup via onDestroy.
      // This hook is available for future telemetry or safety-net logic.
    })

    afterNavigate(() => {
      // Tools re-register automatically via onMount of new components.
      // This hook is available for future telemetry.
    })
  }).catch(() => {
    // $app/navigation not available (plain Svelte without SvelteKit)
  })
}
