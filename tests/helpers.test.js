
import { test, expect, describe } from 'vitest'
import { dateRegex } from '../src/helpers.js'

describe('Helpers  test - dateRegex', () => { 
  test('should return a dateRegex function', async () => {
    const sut = dateRegex  
    expect(dateRegex.test('2024-01-01')).toBe(true) 
    expect(dateRegex.test('2024-01-01T12:00')).toBe(true) 
    expect(dateRegex.test('2024-01-01T12:00:00')).toBe(true) 
    expect(dateRegex.test('2024-01-01T12:00:00.000Z')).toBe(false) 
  }) 
 
})
