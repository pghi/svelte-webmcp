# Svelte WebMCP

WebMCP integration for Svelte 5 and SvelteKit — tool registration, Zod validation, and declarative forms for AI agents.

`svelte-webmcp` brings the [W3C WebMCP](https://webmachinelearning.github.io/webmcp/) standard to Svelte, offering feature parity with [`@mcp-b/react-webmcp`](https://github.com/nichochar/webmcp) (React) and `webmcp-rails` (Rails), plus Svelte-native patterns like runes, actions, and snippets.

## Features

- **Imperative API** — Register tools with `useWebMCP()` and expose read-only context with `useWebMCPContext()`
- **Declarative API** — Annotate existing HTML forms with `use:webmcpForm` and `use:webmcpParam` actions, or use the `<WebMCPForm>` component
- **Client API** — Consume tools from external MCP providers via `<McpClientProvider>` and `useMcpClient()`
- **Zod validation** — Define input schemas with Zod; automatic conversion to JSON Schema v7
- **SSR safe** — All browser APIs are guarded; works with SvelteKit SSR out of the box
- **TypeScript-first** — Full type inference from Zod schemas to handler parameters
- **Svelte 5 native** — Built with runes (`$state`, `$effect`, `$props`), snippets, and actions
- **Zero runtime dependencies** — Only peer dependencies: `svelte`, `zod`, and optionally `@mcp-b/global`

## Installation

```bash
npm install svelte-webmcp zod
```

### Peer dependencies

| Package | Required | Purpose |
|---------|----------|---------|
| `svelte` ^5.0.0 | Yes | Svelte 5 runtime |
| `zod` ^3.25.0 | Yes | Schema definition and validation |
| `@mcp-b/global` ^1.0.0 | No | Polyfill for `navigator.modelContext` in browsers without native support |
| `@modelcontextprotocol/sdk` | No | Only needed if using `<McpClientProvider>` to consume external tools |

If your target browser doesn't support WebMCP natively, install the polyfill:

```bash
npm install @mcp-b/global
```

Then import it once at your app entry point:

```ts
import '@mcp-b/global'
```

## Quick start

### Register a tool (imperative)

```svelte
<script lang="ts">
  import { useWebMCP } from 'svelte-webmcp'
  import { z } from 'zod'

  const search = useWebMCP({
    name: 'search',
    description: 'Search the product catalog',
    inputSchema: {
      query: z.string().describe('Search term'),
      limit: z.number().optional(),
    },
    async handler({ query, limit }) {
      const results = await fetch(`/api/search?q=${query}&limit=${limit ?? 10}`)
      return results.json()
    },
  })
</script>

{#if search.isExecuting}
  <p>Searching...</p>
{/if}

{#if search.error}
  <p>Error: {search.error.message}</p>
{/if}
```

### Annotate a form (declarative)

```svelte
<script lang="ts">
  import { webmcpForm, webmcpParam } from 'svelte-webmcp'
</script>

<form
  use:webmcpForm={{ name: 'contact', description: 'Submit a contact form', autosubmit: true }}
  action="/api/contact"
  method="POST"
>
  <input
    use:webmcpParam={{ description: 'Full name of the person', title: 'Name' }}
    name="name"
    type="text"
  />
  <input
    use:webmcpParam={{ description: 'Email address for reply' }}
    name="email"
    type="email"
  />
  <textarea
    use:webmcpParam={{ description: 'Message body' }}
    name="message"
  ></textarea>
  <button type="submit">Send</button>
</form>
```

This renders standard HTML with WebMCP attributes that AI agents can discover:

```html
<form toolname="contact" tooldescription="Submit a contact form" toolautosubmit>
  <input toolparamdescription="Full name of the person" toolparamtitle="Name" name="name" />
  <!-- ... -->
</form>
```

## API reference

### `useWebMCP(options)`

Registers a tool with `navigator.modelContext` on component mount and unregisters on destroy.

```ts
import { useWebMCP } from 'svelte-webmcp'

const tool = useWebMCP({
  name: string,
  description: string,
  inputSchema: Record<string, ZodType>,
  handler: (validatedInput) => Promise<any>,
  annotations?: { readOnlyHint?: boolean },
})
```

**Options**

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Unique tool identifier |
| `description` | `string` | Natural-language description for AI agents |
| `inputSchema` | `Record<string, ZodType>` | Zod schemas for each parameter — converted to JSON Schema v7 automatically |
| `handler` | `(input) => Promise<any>` | Async function called when an agent invokes the tool. Input is validated against the Zod schema before reaching the handler |
| `annotations` | `{ readOnlyHint?: boolean }` | Optional W3C tool annotations |

**Return value**

| Property | Type | Description |
|----------|------|-------------|
| `isExecuting` | `boolean` | `true` while the handler is running |
| `error` | `Error \| null` | Last error from validation or handler execution |
| `lastResult` | `any` | Return value of the last successful invocation |
| `isRegistered` | `boolean` | `true` after successful registration with `navigator.modelContext` |

All return properties are reactive (backed by Svelte 5 runes).

---

### `useWebMCPContext(name, getData)`

Registers read-only context that AI agents can query but not invoke as an action.

```ts
import { useWebMCPContext } from 'svelte-webmcp'

let cartItems = $state([{ id: 1, name: 'Widget', qty: 2 }])

useWebMCPContext('cart', () => cartItems)
```

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Context identifier (registered as `context_{name}`) |
| `getData` | `() => any` | Getter function returning the current data. Use a getter so `$effect` can track reactive dependencies and re-register when data changes |

The context tool is registered with `readOnlyHint: true` and returns data as JSON text content.

---

### `webmcpForm` (Svelte action)

Applies WebMCP tool attributes to an existing `<form>` element.

```svelte
<form use:webmcpForm={{ name: 'search', description: 'Search products', autosubmit: true }}>
  <!-- inputs -->
</form>
```

**Options**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `string` | — | Sets the `toolname` attribute |
| `description` | `string` | — | Sets the `tooldescription` attribute |
| `autosubmit` | `boolean` | `false` | When `true`, sets the `toolautosubmit` attribute |

Attributes are cleaned up when the action is destroyed, and updated reactively when options change.

---

### `webmcpParam` (Svelte action)

Applies WebMCP parameter attributes to form inputs.

```svelte
<input use:webmcpParam={{ description: 'Search query', title: 'Query' }} name="q" />
<select use:webmcpParam={{ description: 'Sort order' }} name="sort">
  <option>relevance</option>
  <option>price</option>
</select>
<textarea use:webmcpParam={{ description: 'Additional notes' }} name="notes"></textarea>
```

**Options**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `description` | `string` | — | Sets the `toolparamdescription` attribute |
| `title` | `string` | — | Sets the `toolparamtitle` attribute (omitted if not provided) |

Works on any HTML element: `<input>`, `<select>`, `<textarea>`, etc.

---

### `<WebMCPForm>` (component)

A component wrapper as an alternative to the `webmcpForm` action. Useful when you prefer a component-based approach.

```svelte
<script lang="ts">
  import { WebMCPForm, webmcpParam } from 'svelte-webmcp'
</script>

<WebMCPForm name="feedback" description="Submit user feedback" autosubmit>
  <input use:webmcpParam={{ description: 'Rating from 1-5' }} name="rating" type="number" />
  <textarea use:webmcpParam={{ description: 'Comments' }} name="comments"></textarea>
  <button type="submit">Submit</button>
</WebMCPForm>
```

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Tool name |
| `description` | `string` | — | Tool description |
| `autosubmit` | `boolean` | `false` | Enable auto-submit |
| `action` | `string` | — | Form action URL |
| `method` | `'get' \| 'post' \| 'dialog' \| ...` | `'POST'` | Form method |

Additional HTML attributes are spread onto the underlying `<form>` element.

---

### `<McpClientProvider>` and `useMcpClient()`

For consuming tools from external MCP providers (not registering your own).

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import { McpClientProvider } from 'svelte-webmcp'
  import { Client } from '@modelcontextprotocol/sdk/client/index.js'
  import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

  const client = new Client({ name: 'my-app', version: '1.0.0' })
  const transport = new StreamableHTTPClientTransport({ url: 'https://mcp.example.com' })
</script>

<McpClientProvider {client} {transport}>
  <slot />
</McpClientProvider>
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { useMcpClient } from 'svelte-webmcp'

  const mcp = useMcpClient()
</script>

{#if mcp.isConnected}
  <p>Connected! {mcp.tools.length} tools available.</p>
  <ul>
    {#each mcp.tools as tool}
      <li>{tool.name}: {tool.description}</li>
    {/each}
  </ul>
{:else}
  <p>Connecting...</p>
{/if}
```

**`useMcpClient()` return value**

| Property | Type | Description |
|----------|------|-------------|
| `client` | `Client` | The MCP client instance |
| `isConnected` | `boolean` | `true` after `client.connect()` resolves |
| `tools` | `any[]` | Tools discovered via `client.listTools()` |

Requires `@modelcontextprotocol/sdk` as a dependency in your project.

---

### `getToolRegistry()` / `getRegisteredToolCount()`

Access the reactive registry of all tools registered via `useWebMCP` on the current page.

```ts
import { getToolRegistry, getRegisteredToolCount } from 'svelte-webmcp'

const registry = getToolRegistry() // ReadonlyMap<string, RegisteredTool>
const count = getRegisteredToolCount() // number
```

Each entry in the registry contains:

```ts
interface RegisteredTool {
  name: string
  description: string
  registeredAt: Date
  invocationCount: number
  lastInvokedAt: Date | null
}
```

Useful for debugging, DevTools integrations, or building a tool inspector panel.

---

### `enableNavigationGuards()`

Safety net for SvelteKit client-side navigation. Call once in your root `+layout.svelte`:

```svelte
<script lang="ts">
  import { enableNavigationGuards } from 'svelte-webmcp'

  enableNavigationGuards()
</script>

<slot />
```

Individual `useWebMCP` instances handle their own lifecycle via `onMount`/`onDestroy`. This function provides an additional hook point for edge cases. For guaranteed component re-mount on navigation, wrap your page content with `{#key}`:

```svelte
<!-- +page.svelte -->
<script lang="ts">
  let { data } = $props()
</script>

{#key data.pathname}
  <MyToolComponent />
{/key}
```

---

### `getModelContext()`

Low-level access to `navigator.modelContext` with SSR safety.

```ts
import { getModelContext } from 'svelte-webmcp'

const ctx = getModelContext() // ModelContext | null
```

Returns `null` during SSR or when `navigator.modelContext` is not available (with a console warning).

## Zod schema support

The `inputSchema` in `useWebMCP` accepts a record of Zod schemas. These are automatically converted to JSON Schema v7 for the W3C WebMCP spec.

Supported Zod types:

| Zod type | JSON Schema output |
|----------|-------------------|
| `z.string()` | `{ type: 'string' }` |
| `z.number()` | `{ type: 'number' }` |
| `z.boolean()` | `{ type: 'boolean' }` |
| `z.enum(['a', 'b'])` | `{ type: 'string', enum: ['a', 'b'] }` |
| `z.array(z.string())` | `{ type: 'array', items: { type: 'string' } }` |
| `z.object({ ... })` | `{ type: 'object', properties: { ... } }` |
| `z.string().optional()` | `{ type: 'string' }` (removed from `required`) |
| `z.string().describe('...')` | `{ type: 'string', description: '...' }` |

Required vs optional fields are tracked automatically. Descriptions from `.describe()` are preserved at every nesting level.

## TypeScript

All W3C WebMCP types are exported for use in your own code:

```ts
import type {
  ModelContext,
  ModelContextTool,
  ModelContextClient,
  ToolAnnotations,
  WebMCPFormOptions,
  WebMCPParamOptions,
  RegisteredTool,
} from 'svelte-webmcp'
```

The package also augments the global `Navigator` interface with `modelContext: ModelContext`.

## SSR considerations

All browser-dependent code is guarded behind runtime checks. During SSR:

- `getModelContext()` returns `null`
- `useWebMCP()` skips registration (no-op until `onMount` in the browser)
- `useWebMCPContext()` skips registration (same)
- Svelte actions (`webmcpForm`, `webmcpParam`) only run in the browser by design
- `enableNavigationGuards()` is a no-op on the server

No special configuration is needed for SvelteKit SSR.

## Project structure

```
svelte-webmcp/
├── src/lib/
│   ├── index.ts                  # Public API re-exports
│   ├── types.ts                  # W3C WebMCP TypeScript definitions
│   ├── browser.ts                # SSR-safe navigator.modelContext access
│   ├── schema.ts                 # Zod → JSON Schema v7 conversion
│   ├── registry.svelte.ts        # Reactive tool registry
│   ├── useWebMCP.svelte.ts       # Core tool registration hook
│   ├── useWebMCPContext.svelte.ts # Read-only context hook
│   ├── McpClientProvider.svelte   # Client provider component
│   ├── useMcpClient.svelte.ts    # Client consumption hook
│   ├── WebMCPForm.svelte         # Form wrapper component
│   ├── navigation.ts             # SvelteKit navigation guards
│   └── actions/
│       ├── index.ts
│       ├── webmcpForm.ts         # Form action
│       └── webmcpParam.ts        # Param action
├── tests/
│   ├── setup.ts                  # Vitest setup with mock modelContext
│   ├── mocks/modelContext.ts     # Mock navigator.modelContext
│   ├── schema.test.ts            # Zod → JSON Schema tests
│   ├── registry.test.ts          # Registry tests
│   ├── actions.test.ts           # Action attribute tests
│   └── navigation.test.ts        # Navigation guard tests
├── package.json
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run check

# Build the package
npm run build
```

## License

MIT
