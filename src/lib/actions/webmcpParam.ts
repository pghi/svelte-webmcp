import type { Action } from 'svelte/action'
import type { WebMCPParamOptions } from '../types.js'

export const webmcpParam: Action<HTMLElement, WebMCPParamOptions> = (
  node,
  options,
) => {
  function applyAttributes(opts: WebMCPParamOptions) {
    node.setAttribute('toolparamdescription', opts.description)
    if (opts.title) {
      node.setAttribute('toolparamtitle', opts.title)
    } else {
      node.removeAttribute('toolparamtitle')
    }
  }

  applyAttributes(options!)

  return {
    update(newOptions: WebMCPParamOptions) {
      applyAttributes(newOptions)
    },
    destroy() {
      node.removeAttribute('toolparamdescription')
      node.removeAttribute('toolparamtitle')
    },
  }
}
