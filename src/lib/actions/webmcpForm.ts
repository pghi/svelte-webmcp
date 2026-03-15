import type { Action } from 'svelte/action'
import type { WebMCPFormOptions } from '../types.js'

export const webmcpForm: Action<HTMLFormElement, WebMCPFormOptions> = (
  node,
  options,
) => {
  function applyAttributes(opts: WebMCPFormOptions) {
    node.setAttribute('toolname', opts.name)
    node.setAttribute('tooldescription', opts.description)
    if (opts.autosubmit) {
      node.setAttribute('toolautosubmit', '')
    } else {
      node.removeAttribute('toolautosubmit')
    }
  }

  applyAttributes(options!)

  return {
    update(newOptions: WebMCPFormOptions) {
      applyAttributes(newOptions)
    },
    destroy() {
      node.removeAttribute('toolname')
      node.removeAttribute('tooldescription')
      node.removeAttribute('toolautosubmit')
    },
  }
}
