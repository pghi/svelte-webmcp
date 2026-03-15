import { describe, it, expect, beforeEach } from 'vitest'
import { webmcpForm } from '../src/lib/actions/webmcpForm.js'
import { webmcpParam } from '../src/lib/actions/webmcpParam.js'

describe('webmcpForm action', () => {
  let form: HTMLFormElement

  beforeEach(() => {
    form = document.createElement('form')
  })

  it('applies toolname and tooldescription attributes', () => {
    const result = webmcpForm(form, { name: 'search', description: 'Search the web' })
    expect(form.getAttribute('toolname')).toBe('search')
    expect(form.getAttribute('tooldescription')).toBe('Search the web')
    result?.destroy?.()
  })

  it('applies toolautosubmit when enabled', () => {
    const result = webmcpForm(form, { name: 'search', description: 'Search', autosubmit: true })
    expect(form.hasAttribute('toolautosubmit')).toBe(true)
    result?.destroy?.()
  })

  it('does not apply toolautosubmit when disabled', () => {
    const result = webmcpForm(form, { name: 'search', description: 'Search', autosubmit: false })
    expect(form.hasAttribute('toolautosubmit')).toBe(false)
    result?.destroy?.()
  })

  it('updates attributes on update', () => {
    const result = webmcpForm(form, { name: 'search', description: 'Search' })
    result?.update?.({ name: 'lookup', description: 'Lookup items', autosubmit: true })
    expect(form.getAttribute('toolname')).toBe('lookup')
    expect(form.getAttribute('tooldescription')).toBe('Lookup items')
    expect(form.hasAttribute('toolautosubmit')).toBe(true)
    result?.destroy?.()
  })

  it('removes attributes on destroy', () => {
    const result = webmcpForm(form, { name: 'search', description: 'Search', autosubmit: true })
    result?.destroy?.()
    expect(form.hasAttribute('toolname')).toBe(false)
    expect(form.hasAttribute('tooldescription')).toBe(false)
    expect(form.hasAttribute('toolautosubmit')).toBe(false)
  })

  it('toggles autosubmit on update', () => {
    const result = webmcpForm(form, { name: 'test', description: 'Test', autosubmit: true })
    expect(form.hasAttribute('toolautosubmit')).toBe(true)
    result?.update?.({ name: 'test', description: 'Test', autosubmit: false })
    expect(form.hasAttribute('toolautosubmit')).toBe(false)
    result?.destroy?.()
  })
})

describe('webmcpParam action', () => {
  it('applies toolparamdescription to input', () => {
    const input = document.createElement('input')
    const result = webmcpParam(input, { description: 'Enter search query' })
    expect(input.getAttribute('toolparamdescription')).toBe('Enter search query')
    result?.destroy?.()
  })

  it('applies toolparamtitle when provided', () => {
    const input = document.createElement('input')
    const result = webmcpParam(input, { description: 'Query', title: 'Search Term' })
    expect(input.getAttribute('toolparamtitle')).toBe('Search Term')
    result?.destroy?.()
  })

  it('does not apply toolparamtitle when not provided', () => {
    const input = document.createElement('input')
    const result = webmcpParam(input, { description: 'Query' })
    expect(input.hasAttribute('toolparamtitle')).toBe(false)
    result?.destroy?.()
  })

  it('updates attributes on update', () => {
    const input = document.createElement('input')
    const result = webmcpParam(input, { description: 'Old', title: 'Old Title' })
    result?.update?.({ description: 'New', title: 'New Title' })
    expect(input.getAttribute('toolparamdescription')).toBe('New')
    expect(input.getAttribute('toolparamtitle')).toBe('New Title')
    result?.destroy?.()
  })

  it('removes title on update when not provided', () => {
    const input = document.createElement('input')
    const result = webmcpParam(input, { description: 'Desc', title: 'Title' })
    result?.update?.({ description: 'Desc' })
    expect(input.hasAttribute('toolparamtitle')).toBe(false)
    result?.destroy?.()
  })

  it('cleans up all attributes on destroy', () => {
    const input = document.createElement('input')
    const result = webmcpParam(input, { description: 'Desc', title: 'Title' })
    result?.destroy?.()
    expect(input.hasAttribute('toolparamdescription')).toBe(false)
    expect(input.hasAttribute('toolparamtitle')).toBe(false)
  })

  it('works on select elements', () => {
    const select = document.createElement('select')
    const result = webmcpParam(select, { description: 'Choose option' })
    expect(select.getAttribute('toolparamdescription')).toBe('Choose option')
    result?.destroy?.()
  })

  it('works on textarea elements', () => {
    const textarea = document.createElement('textarea')
    const result = webmcpParam(textarea, { description: 'Enter text' })
    expect(textarea.getAttribute('toolparamdescription')).toBe('Enter text')
    result?.destroy?.()
  })
})
