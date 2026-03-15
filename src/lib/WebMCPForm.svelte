<script lang="ts">
  import type { Snippet } from 'svelte'
  import { webmcpForm } from './actions/webmcpForm.js'

  interface Props {
    name: string
    description: string
    autosubmit?: boolean
    action?: string
    method?: 'get' | 'post' | 'dialog' | 'GET' | 'POST' | 'DIALOG'
    children: Snippet
    [key: string]: any
  }

  let {
    name,
    description,
    autosubmit = false,
    action: formAction,
    method = 'POST',
    children,
    ...restProps
  }: Props = $props()
</script>

<form
  use:webmcpForm={{ name, description, autosubmit }}
  action={formAction}
  {method}
  {...restProps}
>
  {@render children()}
</form>
