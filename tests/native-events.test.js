/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import './polyfill-element-internals.js'
import '../src/index.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('native host events', () => {
  test('form-input dispatches Event (not CustomEvent) for input and change', async () => {
    const wrap = document.createElement('div')
    wrap.innerHTML = '<form-input name="t" type="text" label="T"></form-input>'
    document.body.appendChild(wrap)
    const el = wrap.querySelector('form-input')
    const inner = el.shadowRoot.querySelector('input')

    const inputs = []
    const changes = []
    el.addEventListener('input', (e) => {
      // Host .value is live (ElementInternals); assert synchronously while state matches this event.
      expect(e.target.value).toBe(e.detail)
      inputs.push(e)
    })
    el.addEventListener('change', (e) => {
      expect(e.target.value).toBe(e.detail)
      changes.push(e)
    })

    inner.value = 'a'
    inner.dispatchEvent(new Event('input', { bubbles: true }))
    inner.value = 'ab'
    inner.dispatchEvent(new Event('change', { bubbles: true }))

    expect(inputs.length).toBe(1)
    expect(changes.length).toBe(1)
    expect(inputs[0] instanceof Event).toBe(true)
    expect(inputs[0] instanceof CustomEvent).toBe(false)
    expect(inputs[0].detail).toBe('a')
    expect(changes[0] instanceof CustomEvent).toBe(false)
    expect(changes[0].detail).toBe('ab')
  })

  test('form-control submited uses native Event with detail, valid, errors', () => {
    const form = document.createElement('form', { is: 'form-control' })
    document.body.appendChild(form)

    const seen = []
    const sent = []
    const sentMeta = []
    form.addEventListener('submited', (e) => {
      seen.push(e)
    })
    form.addEventListener('sent', (e) => {
      sent.push(e)
    })
    form.addEventListener('sentMeta', (e) => {
      sentMeta.push(e)
    })

    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    )

    expect(seen.length).toBe(1)
    expect(seen[0] instanceof CustomEvent).toBe(false)
    expect(seen[0].detail).toEqual({})
    expect(seen[0].valid).toBe(true)
    expect(seen[0].errors).toEqual({})
    expect(sent.length).toBe(1)
    expect(sent[0] instanceof CustomEvent).toBe(false)
    expect(sent[0].detail).toEqual({})
    expect(sentMeta.length).toBe(1)
    expect(sentMeta[0] instanceof CustomEvent).toBe(false)
    expect(sentMeta[0].detail).toMatchObject({
      source: 'submited',
      valid: true,
      errors: {},
    })
  })

  test('form-control reset emits reseted native event with detail', () => {
    const form = document.createElement('form', { is: 'form-control' })
    document.body.appendChild(form)
    const seen = []

    form.addEventListener('reseted', (e) => {
      seen.push(e)
    })

    form.dispatchEvent(new Event('reset', { bubbles: true, cancelable: true }))

    expect(seen.length).toBe(1)
    expect(seen[0] instanceof CustomEvent).toBe(false)
    expect(seen[0].detail).toMatchObject({
      source: 'form-control.reset',
    })
  })
})
