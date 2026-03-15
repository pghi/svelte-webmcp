<script lang="ts">
  import { setContext } from 'svelte'
  import { onMount } from 'svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    client: any
    transport: any
    children: Snippet
  }

  let { client, transport, children }: Props = $props()

  let isConnected = $state(false)
  let tools = $state<any[]>([])

  onMount(async () => {
    await client.connect(transport)
    isConnected = true
    const toolList = await client.listTools()
    tools = toolList.tools || []
  })

  setContext('mcp-client', {
    get client() { return client },
    get isConnected() { return isConnected },
    get tools() { return tools },
  })
</script>

{@render children()}
