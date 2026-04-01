/**
 * @vitest-environment jsdom
 *
 * Ensures a “no app JS” usage path: values from HTML only, submit via a real
 * <button type="submit"> click (native submit flow). The `submited` payload
 * must match `getFormValuesNested(form)`, i.e. the same object you get from
 * FormData + registered controls (what a server would reconstruct with the
 * same parsing rules).
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import './polyfill-element-internals.js'
import { getFormValuesNested } from '../src/helpers.js'
import '../src/index.js'

function mountInForm(innerHtml) {
  const form = document.createElement('form', { is: 'form-control' })
  const wrap = document.createElement('div')
  wrap.innerHTML = innerHtml.trim()
  while (wrap.firstChild) form.appendChild(wrap.firstChild)
  document.body.appendChild(form)
  return form
}

beforeEach(() => {
  document.body.innerHTML = ''
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('native submit: e.detail matches FormData-derived getFormValuesNested', () => {
  test('flat fields: attribute-only values and submit button click', () => {
    const form = mountInForm(`
      <form-input name="title" type="text" value="Hello" label="Title"></form-input>
      <form-input name="count" type="number" value="42" label="Count"></form-input>
      <button type="submit">Send</button>
    `)

    let detail
    form.addEventListener('submited', (e) => {
      detail = e.detail
    })

    form.querySelector('button[type="submit"]').click()

    expect(detail).toEqual({ title: 'Hello', count: 42 })
    expect(detail).toEqual(getFormValuesNested(form))
  })

  test('nested group: same parity after native submit', () => {
    const form = mountInForm(`
      <form-input name="profile" type="group" label="Profile">
        <form-input name="city" type="text" value="São Paulo" label="City"></form-input>
      </form-input>
      <button type="submit">Send</button>
    `)

    let detail
    form.addEventListener('submited', (e) => {
      detail = e.detail
    })

    form.querySelector('button[type="submit"]').click()

    expect(detail).toEqual({ profile: { city: 'São Paulo' } })
    expect(detail).toEqual(getFormValuesNested(form))
  })
})
