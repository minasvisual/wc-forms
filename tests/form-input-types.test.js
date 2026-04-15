/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import './polyfill-element-internals.js'
import '../src/index.js'

function mountFormInput(html) {
  const wrap = document.createElement('div')
  wrap.innerHTML = html.trim()
  document.body.appendChild(wrap)
  const el = wrap.querySelector('form-input')
  return el
}

function createFormControl() {
  return document.createElement('form', { is: 'form-control' })
}

beforeEach(() => {
  document.body.innerHTML = ''
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('form-input default types (component smoke)', () => {
  test('text', () => {
    const el = mountFormInput(
      `<form-input name="t" type="text" label="T"></form-input>`
    )
    const input = el.shadowRoot.querySelector('input')
    expect(input).toBeTruthy()
    expect(input.type).toBe('text')
    expect(input.getAttribute('placeholder')).toBe('T')
  })

  test('number', () => {
    const el = mountFormInput(
      `<form-input name="n" type="number" label="N"></form-input>`
    )
    expect(el.shadowRoot.querySelector('input').type).toBe('number')
  })

  test('email', () => {
    const el = mountFormInput(
      `<form-input name="e" type="email" label="E"></form-input>`
    )
    expect(el.shadowRoot.querySelector('input').type).toBe('email')
  })

  test('url', () => {
    const el = mountFormInput(
      `<form-input name="u" type="url" label="U"></form-input>`
    )
    expect(el.shadowRoot.querySelector('input').type).toBe('url')
  })

  test('color', () => {
    const el = mountFormInput(
      `<form-input name="c" type="color" label="C"></form-input>`
    )
    expect(el.shadowRoot.querySelector('input').type).toBe('color')
  })

  test('date', () => {
    const el = mountFormInput(
      `<form-input name="d" type="date" label="D"></form-input>`
    )
    expect(el.shadowRoot.querySelector('input').type).toBe('date')
  })

  test('datetime-local', () => {
    const el = mountFormInput(
      `<form-input name="dt" type="datetime-local" label="DT"></form-input>`
    )
    expect(el.shadowRoot.querySelector('input').type).toBe('datetime-local')
  })

  test('password', () => {
    const el = mountFormInput(
      `<form-input name="p" type="password" label="P"></form-input>`
    )
    expect(el.shadowRoot.querySelector('input').type).toBe('password')
  })

  test('search', () => {
    const el = mountFormInput(
      `<form-input name="s" type="search" label="S"></form-input>`
    )
    expect(el.shadowRoot.querySelector('input').type).toBe('search')
  })

  test('select', () => {
    const el = mountFormInput(`
      <form-input name="sel" type="select" label="Sel">
        <option value="a">A</option>
        <option value="b">B</option>
      </form-input>
    `)
    expect(el.shadowRoot.querySelector('select')).toBeTruthy()
  })

  test('checkbox', () => {
    const el = mountFormInput(
      `<form-input name="cb" type="checkbox" label="Cb"></form-input>`
    )
    expect(el.shadowRoot.querySelector('input[type="checkbox"]')).toBeTruthy()
  })

  test('radioboxes', () => {
    const el = mountFormInput(`
      <form-input name="r" type="radioboxes" label="R"
        options="[{&quot;label&quot;:&quot;One&quot;,&quot;value&quot;:&quot;1&quot;},{&quot;label&quot;:&quot;Two&quot;,&quot;value&quot;:&quot;2&quot;}]">
      </form-input>
    `)
    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]')
    expect(radios.length).toBe(2)
  })

  test('checkboxes', () => {
    const el = mountFormInput(`
      <form-input name="cs" type="checkboxes" label="Cs"
        options="[{&quot;label&quot;:&quot;A&quot;,&quot;value&quot;:&quot;a&quot;},{&quot;label&quot;:&quot;B&quot;,&quot;value&quot;:&quot;b&quot;}]">
      </form-input>
    `)
    const boxes = el.shadowRoot.querySelectorAll('input[type="checkbox"]')
    expect(boxes.length).toBe(2)
  })

  test('textarea', () => {
    const el = mountFormInput(
      `<form-input name="ta" type="textarea" label="Ta"></form-input>`
    )
    expect(el.shadowRoot.querySelector('textarea')).toBeTruthy()
    expect(el.shadowRoot.querySelector('textarea').getAttribute('placeholder')).toBe('Ta')
  })

  test('autocomplete', () => {
    const el = mountFormInput(`
      <form-input name="ac" type="autocomplete" label="Ac">
        <option value="x">X</option>
      </form-input>
    `)
    expect(el.shadowRoot.querySelector('.wc-form-autocomplete-container input')).toBeTruthy()
  })

  test('pills renders tag input container', () => {
    const el = mountFormInput(
      `<form-input name="tags" type="pills" label="Tags"></form-input>`
    )
    expect(el.shadowRoot.querySelector('.wc-form-pills')).toBeTruthy()
    expect(el.shadowRoot.querySelector('.wc-form-pill-input')).toBeTruthy()
  })

  test('button exposes native button and forwards click to host', () => {
    const el = mountFormInput(
      `<form-input name="btn" type="button" label="Hit"></form-input>`
    )
    const b = el.shadowRoot.querySelector('button')
    expect(b.type).toBe('button')
    let fired = 0
    el.addEventListener('click', () => { fired += 1 })
    b.click()
    expect(fired).toBe(1)
  })

  test('submit triggers form requestSubmit', () => {
    const form = createFormControl()
    const sub = document.createElement('form-input')
    sub.setAttribute('type', 'submit')
    sub.setAttribute('label', 'Send')
    form.appendChild(sub)
    document.body.appendChild(form)

    let called = false
    form.requestSubmit = () => { called = true }

    sub.shadowRoot.querySelector('button[type="submit"]').click()
    expect(called).toBe(true)
  })

  test('file wires input type file', () => {
    const el = mountFormInput(
      `<form-input name="f" type="file" label="F"></form-input>`
    )
    expect(el.shadowRoot.querySelector('input[type="file"]')).toBeTruthy()
  })

  test('file forwards native attributes and syncs accept after change', () => {
    const el = mountFormInput(
      `<form-input name="f" type="file" label="F" accept="image/png" multiple></form-input>`
    )
    const inner = el.shadowRoot.querySelector('input[type="file"]')
    expect(inner.getAttribute('accept')).toBe('image/png')
    expect(inner.hasAttribute('multiple')).toBe(true)
    el.setAttribute('accept', '.pdf,.png')
    expect(inner.getAttribute('accept')).toBe('.pdf,.png')
    el.removeAttribute('multiple')
    expect(inner.hasAttribute('multiple')).toBe(false)
  })

  test('hidden', () => {
    const el = mountFormInput(
      `<form-input name="h" type="hidden" value="csrf-token"></form-input>`
    )
    const inp = el.shadowRoot.querySelector('input[type="hidden"]')
    expect(inp).toBeTruthy()
    expect(inp.value).toBe('csrf-token')
  })

  test('range wires input type range', () => {
    const el = mountFormInput(
      `<form-input name="r" type="range" label="R" min="0" max="10" value="5"></form-input>`
    )
    const r = el.shadowRoot.querySelector('input[type="range"]')
    expect(r).toBeTruthy()
    expect(r.value).toBe('5')
    expect(el.shadowRoot.querySelector('[part="range-min"]')?.textContent?.trim()).toBe('0')
    expect(el.shadowRoot.querySelector('[part="range-max"]')?.textContent?.trim()).toBe('10')
    const popup = el.shadowRoot.querySelector('[part="range-value-popup"]')
    expect(popup?.textContent?.trim()).toBe('5')
  })

  test('currency uses decimal text input and prefix', () => {
    const el = mountFormInput(
      `<form-input name="cur" type="currency" label="Cur"></form-input>`
    )
    const inp = el.shadowRoot.querySelector('input')
    expect(inp.type).toBe('text')
    expect(inp.getAttribute('inputmode')).toBe('decimal')
    expect(el.shadowRoot.textContent).toContain('R$')
    expect(inp.getAttribute('placeholder')).toBe('Cur')
  })

  test('no label does not render null and has empty placeholder', () => {
    const el = mountFormInput(
      `<form-input name="noLabel" type="text"></form-input>`
    )
    const html = el.shadowRoot.innerHTML
    expect(html.includes('null')).toBe(false)
    const input = el.shadowRoot.querySelector('input')
    expect(input.getAttribute('placeholder') === null || input.getAttribute('placeholder') === '').toBe(true)
  })

  test('group type nests leaf values in submit detail', () => {
    document.body.innerHTML = ''

    const form = document.createElement('form', { is: 'form-control' })
    const group = document.createElement('form-input')
    group.setAttribute('type', 'group')
    group.setAttribute('name', 'address')
    group.innerHTML = `
      <form-input name="street" type="text" label="Street"></form-input>
      <form-input name="number" type="number" label="Number"></form-input>
    `

    form.appendChild(group)
    document.body.appendChild(form)

    const street = group.querySelector('form-input[name="street"]')
    const number = group.querySelector('form-input[name="number"]')

    street.shadowRoot.querySelector('input').value = 'Main St'
    street.shadowRoot.querySelector('input').dispatchEvent(
      new Event('change', { bubbles: true, cancelable: true })
    )

    number.shadowRoot.querySelector('input').value = '333'
    number.shadowRoot.querySelector('input').dispatchEvent(
      new Event('change', { bubbles: true, cancelable: true })
    )

    let detail
    form.addEventListener('submited', (e) => {
      detail = e.detail
    })

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(detail.address).toBeTruthy()
    expect(detail.address.street).toBe('Main St')
    expect(detail.address.number).toBe(333)
  })

  test('repeater type inserts template and has repeater container', () => {
    const el = mountFormInput(`
      <form-input name="users" type="repeater" label="Users">
        <form-input name="name" type="text" label="Name"></form-input>
      </form-input>
    `)
    const container = el.shadowRoot.querySelector('.wc-form-repeater')
    expect(container).toBeTruthy()
    // Empty state lives in slotted light DOM (repeater-ui), not under shadow .wc-form-repeater
    expect(el.querySelector('.wc-form-repeater-empty')).toBeTruthy()
  })

  test('pills type submits an array value', () => {
    const form = createFormControl()
    form.innerHTML = `
      <form-input name="tags" type="pills" label="Tags"></form-input>
    `
    document.body.appendChild(form)

    const el = form.querySelector('form-input')
    const input = el.shadowRoot.querySelector('.wc-form-pill-input')
    input.value = 'web components'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: ',', bubbles: true }))
    input.value = 'forms'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    let detail
    form.addEventListener('submited', (e) => {
      detail = e.detail
    })

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(detail.tags).toEqual(['web components', 'forms'])
  })
})

describe('form-input file submit payload', () => {
  test('submited detail contains File for single file field', () => {
    const form = createFormControl()
    const fin = document.createElement('form-input')
    fin.setAttribute('name', 'doc')
    fin.setAttribute('type', 'file')
    form.appendChild(fin)
    document.body.appendChild(form)

    const input = fin.shadowRoot.querySelector('input[type="file"]')
    const file = new File(['hello'], 'note.txt', { type: 'text/plain' })
    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    })
    input.dispatchEvent(new Event('change', { bubbles: true }))

    let detail
    form.addEventListener('submited', (e) => {
      detail = e.detail
    })
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(detail).toBeDefined()
    expect(detail.doc).toBeInstanceOf(File)
    expect(detail.doc.name).toBe('note.txt')
  })
})
