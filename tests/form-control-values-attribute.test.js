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

describe('form-control values attribute', () => {
  test('values property accepts object and getter returns parsed data', () => {
    const form = document.createElement('form', { is: 'form-control' })
    form.innerHTML = `
      <form-input name="user" type="text" label="User"></form-input>
      <form-input name="skills" type="pills" label="Skills"></form-input>
    `
    document.body.appendChild(form)

    form.values = {
      user: 'Ulisses',
      skills: ['js', 'web-components'],
    }

    expect(form.getAttribute('values')).toBeTruthy()
    expect(form.values).toEqual({
      user: 'Ulisses',
      skills: ['js', 'web-components'],
    })

    let detail
    form.addEventListener('submited', (e) => { detail = e.detail })
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    expect(detail.user).toBe('Ulisses')
    expect(detail.skills).toEqual(['js', 'web-components'])
  })

  test('hydrates form-input fields from JSON object including group and pills', async () => {
    const form = document.createElement('form', { is: 'form-control' })
    form.innerHTML = `
      <form-input name="user" type="text" label="User"></form-input>
      <form-input name="age" type="number" label="Age"></form-input>
      <form-input name="agree" type="checkbox" label="Agree"></form-input>
      <form-input name="roles" type="checkboxes" label="Roles"
        options="['admin','editor','viewer']"></form-input>
      <form-input name="skills" type="pills" label="Skills"></form-input>
      <form-input type="group" name="address">
        <form-input name="street" type="text" label="Street"></form-input>
        <form-input name="number" type="number" label="Number"></form-input>
      </form-input>
    `

    document.body.appendChild(form)

    form.setAttribute('values', JSON.stringify({
      user: 'Ulisses',
      age: 34,
      agree: true,
      roles: ['admin', 'viewer'],
      skills: ['js', 'web-components'],
      address: {
        street: 'Main St',
        number: 333,
      },
    }))
    await new Promise((resolve) => setTimeout(resolve, 0))

    let detail
    form.addEventListener('submited', (e) => {
      detail = e.detail
    })
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(detail.user).toBe('Ulisses')
    expect(detail.age).toBe(34)
    expect(detail.agree).toBe(true)
    expect(detail.roles).toEqual(['admin', 'viewer'])
    expect(detail.skills).toEqual(['js', 'web-components'])
    expect(detail.address.street).toBe('Main St')
    expect(detail.address.number).toBe(333)
  })

  test('reset() clears form-input content and removes values attribute', async () => {
    const form = document.createElement('form', { is: 'form-control' })
    form.innerHTML = `
      <form-input name="user" type="text" label="User"></form-input>
      <form-input name="agree" type="checkbox" label="Agree"></form-input>
      <form-input name="roles" type="checkboxes" label="Roles"
        options="['admin','editor','viewer']"></form-input>
      <form-input name="skills" type="pills" label="Skills"></form-input>
    `
    document.body.appendChild(form)

    form.setAttribute('values', JSON.stringify({
      user: 'Ulisses',
      agree: true,
      roles: ['admin', 'viewer'],
      skills: ['js', 'web-components'],
    }))
    await new Promise((resolve) => setTimeout(resolve, 0))

    form.reset()

    expect(form.hasAttribute('values')).toBe(false)

    let detail
    form.addEventListener('submited', (e) => {
      detail = e.detail
    })
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(detail.user).toBeUndefined()
    expect(detail.agree).toBeUndefined()
    expect(detail.roles).toEqual([])
    expect(detail.skills).toEqual([])
  })

  test('values property does not get replaced by submit payload', () => {
    const form = document.createElement('form', { is: 'form-control' })
    form.innerHTML = `
      <form-input name="user" type="text" label="User"></form-input>
    `
    document.body.appendChild(form)

    form.values = { user: 'Initial' }
    const input = form.querySelector('form-input[name="user"]').shadowRoot.querySelector('input')
    input.value = 'Changed'
    input.dispatchEvent(new Event('change', { bubbles: true }))

    let detail
    form.addEventListener('submited', (e) => { detail = e.detail })
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(detail.user).toBe('Changed')
    expect(form.values).toEqual({ user: 'Initial' })
  })
})
