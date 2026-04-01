
/**
 * @vitest-environment jsdom
 */
import { test, expect, describe, vi } from 'vitest'
import { dateRegex, formatTypeValue, onMounted, onDestroy, field } from '../src/helpers.js'

describe('Helpers  test - dateRegex', () => { 
  test('should return a dateRegex function', async () => {
    const sut = dateRegex  
    expect(dateRegex.test('2024-01-01')).toBe(true) 
    expect(dateRegex.test('2024-01-01T12:00')).toBe(true) 
    expect(dateRegex.test('2024-01-01T12:00:00')).toBe(true) 
    expect(dateRegex.test('2024-01-01T12:00:00.000Z')).toBe(false) 
  }) 
 
})

describe('formatTypeValue', () => {
  test('file returns File instance', () => {
    const f = new File(['x'], 'a.txt', { type: 'text/plain' })
    expect(formatTypeValue('file', f)).toBe(f)
  })

  test('file with two Files returns array', () => {
    const a = new File(['1'], 'a.txt')
    const b = new File(['2'], 'b.txt')
    expect(formatTypeValue('file', [a, b])).toEqual([a, b])
  })

  test('range coerces to number', () => {
    expect(formatTypeValue('range', '7')).toBe(7)
    expect(formatTypeValue('range', '')).toBeUndefined()
  })

  test('hidden keeps string', () => {
    expect(formatTypeValue('hidden', '42')).toBe('42')
    expect(formatTypeValue('hidden', '')).toBeUndefined()
  })
})

describe('onMounted', () => {
  test('calls callback with document (immediate when ready)', () => {
    const cb = vi.fn()
    onMounted(cb)
    expect(cb).toHaveBeenCalled()
    expect(cb).toHaveBeenCalledWith(document)
  })
})

describe('onDestroy', () => {
  test('calls callback on pagehide and supports unsubscribe', () => {
    const cb = vi.fn()
    const off = onDestroy(cb)
    window.dispatchEvent(new Event('pagehide'))
    expect(cb).toHaveBeenCalledTimes(1)
    off()
    window.dispatchEvent(new Event('pagehide'))
    expect(cb).toHaveBeenCalledTimes(1)
  })
})

describe('field helper', () => {
  test('applies properties/attrs/classes and binds events', () => {
    const input = document.createElement('input')
    const onInput = vi.fn()

    const ctl = field(input, {
      value: 'abc',
      placeholder: 'Type',
      classes: ['x', 'y'],
      input: onInput,
    })

    expect(input.value).toBe('abc')
    expect(input.getAttribute('placeholder')).toBe('Type')
    expect(input.classList.contains('x')).toBe(true)
    expect(input.classList.contains('y')).toBe(true)

    input.dispatchEvent(new Event('input'))
    expect(onInput).toHaveBeenCalledTimes(1)
    expect(typeof ctl.destroy).toBe('function')
  })

  test('auto-removes listeners on pagehide', () => {
    const input = document.createElement('input')
    const onInput = vi.fn()
    const ctl = field(input, { input: onInput })

    input.dispatchEvent(new Event('input'))
    expect(onInput).toHaveBeenCalledTimes(1)

    window.dispatchEvent(new Event('pagehide'))
    input.dispatchEvent(new Event('input'))
    expect(onInput).toHaveBeenCalledTimes(1)

    ctl.destroy()
  })
})
