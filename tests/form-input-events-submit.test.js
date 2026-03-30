/**
 * @vitest-environment jsdom
 *
 * Ensures host `input` / `change` event `e.detail` stays aligned with the parsed
 * `submited` payload for each registered input type (same rules as formatTypeValue).
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import './polyfill-element-internals.js'
import { formatTypeValue } from '../src/helpers.js'
import '../src/index.js'

function mountInForm(innerHtml) {
  const form = document.createElement('form', { is: 'form-control' })
  const wrap = document.createElement('div')
  wrap.innerHTML = innerHtml.trim()
  while (wrap.firstChild) form.appendChild(wrap.firstChild)
  document.body.appendChild(form)
  return form
}

function getOutputType(formInputEl) {
  const marker = formInputEl.shadowRoot?.querySelector('[data-type]')
  return marker?.getAttribute('data-type') || formInputEl.getAttribute('type') || 'text'
}

/** Parsed submit value must equal formatTypeValue(output, lastChangeDetail). */
function expectChangeMatchesSubmit(formInputEl, fieldName, lastChangeDetail, submitDetail) {
  const out = getOutputType(formInputEl)
  expect(formatTypeValue(out, lastChangeDetail)).toEqual(submitDetail[fieldName])
}

/** After editing, last `input` and last `change` should both match submit (when both fire). */
function expectInputAndChangeMatchSubmit(formInputEl, fieldName, lastInput, lastChange, submitDetail) {
  const out = getOutputType(formInputEl)
  const sub = submitDetail[fieldName]
  expect(formatTypeValue(out, lastChange)).toEqual(sub)
  if (lastInput !== undefined && lastInput !== null) {
    expect(formatTypeValue(out, lastInput)).toEqual(sub)
  }
}

function submitForm(form) {
  let detail
  form.addEventListener('submited', (e) => {
    detail = e.detail
  })
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  return detail
}

function wireEvents(el) {
  let lastInput
  let lastChange
  el.addEventListener('input', (e) => {
    lastInput = e.detail
  })
  el.addEventListener('change', (e) => {
    lastChange = e.detail
  })
  return () => ({ lastInput, lastChange })
}

beforeEach(() => {
  document.body.innerHTML = ''
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('input / change e.detail matches submited payload', () => {
  test('text: last input and change align with submit', () => {
    const form = mountInForm(`
      <form-input name="t" type="text" label="T"></form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const inner = el.shadowRoot.querySelector('input')

    inner.value = 'hello'
    inner.dispatchEvent(new Event('input', { bubbles: true }))
    inner.dispatchEvent(new Event('change', { bubbles: true }))

    const detail = submitForm(form)
    const { lastInput, lastChange } = getLast()
    expectInputAndChangeMatchSubmit(el, 't', lastInput, lastChange, detail)
  })

  test('number: change detail formats to same value as submit', () => {
    const form = mountInForm(`
      <form-input name="n" type="number" label="N"></form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const inner = el.shadowRoot.querySelector('input')

    inner.value = '42'
    inner.dispatchEvent(new Event('input', { bubbles: true }))
    inner.dispatchEvent(new Event('change', { bubbles: true }))

    const detail = submitForm(form)
    const { lastInput, lastChange } = getLast()
    expect(detail.n).toBe(42)
    expectInputAndChangeMatchSubmit(el, 'n', lastInput, lastChange, detail)
  })

  test('email', () => {
    const form = mountInForm(`
      <form-input name="e" type="email" label="E"></form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const inner = el.shadowRoot.querySelector('input')
    inner.value = 'a@b.co'
    inner.dispatchEvent(new Event('input', { bubbles: true }))
    inner.dispatchEvent(new Event('change', { bubbles: true }))
    const detail = submitForm(form)
    const { lastInput, lastChange } = getLast()
    expectInputAndChangeMatchSubmit(el, 'e', lastInput, lastChange, detail)
  })

  test('textarea', () => {
    const form = mountInForm(`
      <form-input name="ta" type="textarea" label="Ta"></form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const inner = el.shadowRoot.querySelector('textarea')
    inner.value = 'line1\nline2'
    inner.dispatchEvent(new Event('input', { bubbles: true }))
    inner.dispatchEvent(new Event('change', { bubbles: true }))
    const detail = submitForm(form)
    const { lastInput, lastChange } = getLast()
    expectInputAndChangeMatchSubmit(el, 'ta', lastInput, lastChange, detail)
  })

  test('select', () => {
    const form = mountInForm(`
      <form-input name="sel" type="select" label="S">
        <option value="a">A</option>
        <option value="b" selected>B</option>
      </form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const inner = el.shadowRoot.querySelector('select')
    inner.value = 'a'
    inner.dispatchEvent(new Event('change', { bubbles: true }))
    const detail = submitForm(form)
    const { lastChange } = getLast()
    expectChangeMatchesSubmit(el, 'sel', lastChange, detail)
  })

  test('checkbox (boolean): checked state matches submit', () => {
    const form = mountInForm(`
      <form-input name="cb" type="checkbox" label="Cb"></form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const inner = el.shadowRoot.querySelector('input[type="checkbox"]')
    inner.checked = true
    inner.dispatchEvent(new Event('change', { bubbles: true }))
    const detail = submitForm(form)
    const { lastChange } = getLast()
    expectChangeMatchesSubmit(el, 'cb', lastChange, detail)
    expect(detail.cb).toBe(true)
  })

  test('radioboxes', () => {
    const form = mountInForm(`
      <form-input name="r" type="radioboxes" label="R"
        options="[{&quot;label&quot;:&quot;One&quot;,&quot;value&quot;:&quot;1&quot;},{&quot;label&quot;:&quot;Two&quot;,&quot;value&quot;:&quot;2&quot;}]">
      </form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]')
    radios[1].checked = true
    radios[1].dispatchEvent(new Event('change', { bubbles: true }))
    const detail = submitForm(form)
    const { lastChange } = getLast()
    expectChangeMatchesSubmit(el, 'r', lastChange, detail)
  })

  test('checkboxes (array)', () => {
    const form = mountInForm(`
      <form-input name="cs" type="checkboxes" label="Cs"
        options="[{&quot;label&quot;:&quot;A&quot;,&quot;value&quot;:&quot;a&quot;},{&quot;label&quot;:&quot;B&quot;,&quot;value&quot;:&quot;b&quot;}]">
      </form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const boxes = el.shadowRoot.querySelectorAll('input[type="checkbox"]')
    boxes[0].checked = true
    boxes[1].checked = true
    boxes[1].dispatchEvent(new Event('change', { bubbles: true }))
    const detail = submitForm(form)
    const { lastChange } = getLast()
    expectChangeMatchesSubmit(el, 'cs', lastChange, detail)
    expect(detail.cs).toEqual(['a', 'b'])
  })

  test('range: input and change align with submit', () => {
    const form = mountInForm(`
      <form-input name="rng" type="range" label="R" min="0" max="10" value="5"></form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const inner = el.shadowRoot.querySelector('input[type="range"]')
    inner.value = '8'
    inner.dispatchEvent(new Event('input', { bubbles: true }))
    inner.dispatchEvent(new Event('change', { bubbles: true }))
    const detail = submitForm(form)
    const { lastInput, lastChange } = getLast()
    expect(detail.rng).toBe(8)
    expectInputAndChangeMatchSubmit(el, 'rng', lastInput, lastChange, detail)
  })

  test('currency: last input and change after blur match submit', () => {
    const form = mountInForm(`
      <form-input name="cur" type="currency" label="Cur"></form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const inner = el.shadowRoot.querySelector('input')
    inner.value = '12345'
    inner.dispatchEvent(new Event('input', { bubbles: true }))
    inner.dispatchEvent(new Event('blur', { bubbles: true }))
    const detail = submitForm(form)
    const { lastInput, lastChange } = getLast()
    expect(detail.cur).toBe(123.45)
    expectInputAndChangeMatchSubmit(el, 'cur', lastInput, lastChange, detail)
  })

  test('hidden: submit matches static value (no host change event required)', () => {
    const form = mountInForm(`
      <form-input name="h" type="hidden" value="token-xyz"></form-input>
    `)
    const el = form.querySelector('form-input')
    const detail = submitForm(form)
    expect(detail.h).toBe('token-xyz')
    const out = getOutputType(el)
    expect(formatTypeValue(out, el.shadowRoot.querySelector('input').value)).toEqual(detail.h)
  })

  test('file: change detail is same File reference as submit', () => {
    const form = mountInForm(`
      <form-input name="doc" type="file" label="F"></form-input>
    `)
    const el = form.querySelector('form-input')
    let lastChange
    el.addEventListener('change', (e) => {
      lastChange = e.detail
    })
    const input = el.shadowRoot.querySelector('input[type="file"]')
    const file = new File(['x'], 'x.txt', { type: 'text/plain' })
    Object.defineProperty(input, 'files', { value: [file], configurable: true })
    input.dispatchEvent(new Event('change', { bubbles: true }))
    const detail = submitForm(form)
    expect(lastChange).toBeInstanceOf(File)
    expect(detail.doc).toBe(file)
    expectChangeMatchesSubmit(el, 'doc', lastChange, detail)
  })

  test('autocomplete: after selection, change matches submit', () => {
    const form = mountInForm(`
      <form-input name="ac" type="autocomplete" label="Ac">
        <option value="2">Two</option>
      </form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const inp = el.shadowRoot.querySelector('.wc-form-autocomplete-container input')
    inp.value = 'tw'
    inp.dispatchEvent(new Event('input', { bubbles: true }))
    const li = el.shadowRoot.querySelector('.wc-form-autocomplete-item')
    expect(li).toBeTruthy()
    li.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    const detail = submitForm(form)
    const { lastChange } = getLast()
    expectChangeMatchesSubmit(el, 'ac', lastChange, detail)
    // Host `input` while filtering is free text; only `change` after selection matches submit.
  })

  test('group: leaf change details match nested submit', () => {
    const form = mountInForm(`
      <form-input name="address" type="group" label="Addr">
        <form-input name="street" type="text" label="Street"></form-input>
        <form-input name="code" type="number" label="Code"></form-input>
      </form-input>
    `)
    const street = form.querySelector('form-input[name="street"]')
    const code = form.querySelector('form-input[name="code"]')
    let streetChange
    let codeChange
    street.addEventListener('change', (e) => { streetChange = e.detail })
    code.addEventListener('change', (e) => { codeChange = e.detail })

    const si = street.shadowRoot.querySelector('input')
    si.value = 'Main'
    si.dispatchEvent(new Event('change', { bubbles: true }))

    const ci = code.shadowRoot.querySelector('input')
    ci.value = '90210'
    ci.dispatchEvent(new Event('change', { bubbles: true }))

    const detail = submitForm(form)
    expect(detail.address.street).toBe('Main')
    expect(detail.address.code).toBe(90210)
    expectChangeMatchesSubmit(street, 'street', streetChange, { street: detail.address.street })
    expectChangeMatchesSubmit(code, 'code', codeChange, { code: detail.address.code })
  })

  test('color', () => {
    const form = mountInForm(`
      <form-input name="c" type="color" label="C"></form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const inner = el.shadowRoot.querySelector('input')
    inner.value = '#aabbcc'
    inner.dispatchEvent(new Event('input', { bubbles: true }))
    inner.dispatchEvent(new Event('change', { bubbles: true }))
    const detail = submitForm(form)
    const { lastInput, lastChange } = getLast()
    expectInputAndChangeMatchSubmit(el, 'c', lastInput, lastChange, detail)
  })

  test('date', () => {
    const form = mountInForm(`
      <form-input name="d" type="date" label="D"></form-input>
    `)
    const el = form.querySelector('form-input')
    const getLast = wireEvents(el)
    const inner = el.shadowRoot.querySelector('input')
    inner.value = '2026-03-30'
    inner.dispatchEvent(new Event('input', { bubbles: true }))
    inner.dispatchEvent(new Event('change', { bubbles: true }))
    const detail = submitForm(form)
    const { lastInput, lastChange } = getLast()
    expectInputAndChangeMatchSubmit(el, 'd', lastInput, lastChange, detail)
  })
})
