/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { bindWcFormsAngularSubmit } from '../src/angular.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('angular adapter submit binding', () => {
  test('submit-fallback invalid emits sentMeta only', () => {
    const form = document.createElement('form')
    document.body.appendChild(form)
    form.checkValidity = vi.fn(() => false)
    form.reportValidity = vi.fn(() => false)

    const sent = []
    const sentMeta = []
    const cleanup = bindWcFormsAngularSubmit(form, {
      sent: (payload) => sent.push(payload),
      sentMeta: (meta) => sentMeta.push(meta),
    })

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    cleanup()

    expect(sent).toHaveLength(0)
    expect(sentMeta).toHaveLength(1)
    expect(sentMeta[0]).toMatchObject({
      source: 'submit-fallback',
      valid: false,
    })
    expect(form.reportValidity).toHaveBeenCalledTimes(1)
  })

  test('submit-fallback valid emits sent and sentMeta', () => {
    const form = document.createElement('form')
    document.body.appendChild(form)
    form.checkValidity = vi.fn(() => true)
    form.reportValidity = vi.fn(() => true)

    const sent = []
    const sentMeta = []
    const cleanup = bindWcFormsAngularSubmit(form, {
      sent: (payload) => sent.push(payload),
      sentMeta: (meta) => sentMeta.push(meta),
    })

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    cleanup()

    expect(sent).toHaveLength(1)
    expect(sent[0]).toEqual({})
    expect(sentMeta).toHaveLength(1)
    expect(sentMeta[0]).toMatchObject({
      source: 'submit-fallback',
      valid: true,
      errors: {},
    })
  })

  test('submited invalid emits sentMeta and skips sent', () => {
    const form = document.createElement('form')
    document.body.appendChild(form)

    const sent = []
    const sentMeta = []
    const cleanup = bindWcFormsAngularSubmit(form, {
      sent: (payload) => sent.push(payload),
      sentMeta: (meta) => sentMeta.push(meta),
    })

    const submited = new Event('submited', { bubbles: true, cancelable: true })
    Object.defineProperty(submited, 'valid', { value: false, enumerable: true })
    Object.defineProperty(submited, 'errors', { value: { username: 'required' }, enumerable: true })

    form.dispatchEvent(submited)
    cleanup()

    expect(sent).toHaveLength(0)
    expect(sentMeta).toHaveLength(1)
    expect(sentMeta[0]).toMatchObject({
      source: 'submited',
      valid: false,
      errors: { username: 'required' },
    })
  })
})
