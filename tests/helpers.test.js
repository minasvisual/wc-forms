
import { test, expect, describe } from 'vitest'
import { dateRegex, formatTypeValue } from '../src/helpers.js'

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
