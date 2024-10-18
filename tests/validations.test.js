
import { test, expect, describe } from 'vitest'
import { Config } from '../src/config.js'

describe('Config validations - Required', () => { 
  test('should return a validation function', async () => {
    const sut = Config.validations.required.handle
    const message = Config.validations.required.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: 'value' })).toBe(true)
    expect(sut({ value: '' })).toBe(false)
    expect(message({})).toBe('This field is required')
  }) 
 
})

describe('Config validations - Email', () => { 
  test('should test validation email', async () => {
    const sut = Config.validations.email.handle
    const message = Config.validations.email.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: 'test@domain.com' })).toBe(true)
    expect(sut({ value: 'test@subdomain.domain.com' })).toBe(true)
    expect(sut({ value: 'test@domain.com.br' })).toBe(true)
    expect(sut({ value: 'test@subdomain.subdomain.domain.com' })).toBe(false)
    expect(sut({ value: 'test' })).toBe(false)
    expect(message({})).toBe('This should be an valid email')
  }) 
 
})

describe('Config validations - Min Length', () => { 
  test('should test max length validation', async () => {
    const sut = Config.validations.minlen.handle
    const message = Config.validations.minlen.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: '12345', params: ['5'] })).toBe(true)
    expect(sut({ value: '12345', params: ['6'] })).toBe(false)
    expect(message([])).toBe( `This field must be at least 1 characters`)
    expect(message(['5'])).toBe( `This field must be at least 5 characters`)
  }) 
})

describe('Config validations - Max Length', () => { 
  test('should test max length validation', async () => {
    const sut = Config.validations.maxlen.handle
    const message = Config.validations.maxlen.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: '12345', params: ['5'] })).toBe(true)
    expect(sut({ value: '12345', params: ['4'] })).toBe(false)
    expect(message([])).toBe( `This field must be maximum 255 characters`)
    expect(message(['5'])).toBe( `This field must be maximum 5 characters`)
  }) 
})

describe('Config validations - Confirm', () => { 
  test('should test confirm validation', async () => {
    const sut = Config.validations.confirm.handle
    const message = Config.validations.confirm.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: '123mudar', params: ['password2'], values: { password2: '123mudar' } })).toBe(true)
    expect(sut({ value: '12345', params: ['4'], values: { password2: '123MUDAR'} })).toBe(false)
    expect(message([])).toBe( `This field must be equal to undefined field`) 
    expect(message(['password2'])).toBe( `This field must be equal to password2 field`)
  }) 
})

describe('Config validations - Is date', () => { 
  test('should test isdate validation', async () => {
    const sut = Config.validations.isdate.handle
    const message = Config.validations.isdate.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: '2024-01-01' })).toBe(true)
    expect(sut({ value: '2024-01-01T12:00' })).toBe(true)
    expect(sut({ value: '2024-01-01T12:00:00' })).toBe(true)
    expect(sut({ value: '12345abc' })).toBe(false)
    expect(sut({ value: 'abc' })).toBe(false)
    expect(message({})).toBe('This field must be a valid date')
  }) 
 
})

describe('Config validations - Is After', () => { 
  test('should test isafter validation', async () => {
    const sut = Config.validations.isafter.handle
    const message = Config.validations.isafter.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: '2020-01-01', params: ['2020-01-02'] })).toBe(false)
    expect(sut({ value: '2020-01-02', params: ['2020-01-02'] })).toBe(false)
    expect(sut({ value: '2020-01-03', params: ['2020-01-02'] })).toBe(true)
    expect(message([])).toBe( `This field must be after undefined`)
    expect(message(['2020-01-01'])).toBe( `This field must be after 2020-01-01`)
  }) 
})

describe('Config validations - Is Before', () => { 
  test('should test isbefore validation', async () => {
    const sut = Config.validations.isbefore.handle
    const message = Config.validations.isbefore.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: '2020-01-01', params: ['2020-01-02'] })).toBe(true)
    expect(sut({ value: '2020-01-02', params: ['2020-01-02'] })).toBe(false)
    expect(message([])).toBe( `This field must be before undefined`)
    expect(message(['2020-01-01'])).toBe( `This field must be before 2020-01-01`)
  }) 
})

describe('Config validations - Is Number', () => { 
  test('should test isnumber validation', async () => {
    const sut = Config.validations.isnumber.handle
    const message = Config.validations.isnumber.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: '12345' })).toBe(true)
    expect(sut({ value: '12345.12' })).toBe(true)
    expect(sut({ value: '12345abc' })).toBe(false)
    expect(sut({ value: 'abc' })).toBe(false)
    expect(message({})).toBe('This field must be a valid number')
  }) 
 
})

describe('Config validations - Starts With', () => { 
  test('should test startswith validation', async () => {
    const sut = Config.validations.startwith.handle
    const message = Config.validations.startwith.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: 'hello world', params: ['hello'] })).toBe(true)
    expect(sut({ value: 'Hello world', params: ['hello'] })).toBe(true)
    expect(sut({ value: 'world hello', params: ['hello'] })).toBe(false)
    expect(message([])).toBe(`This field must start with undefined`)
    expect(message([], 'hello')).toBe(`This field must start with hello`)
  })  
})

describe('Config validations - Ends With', () => { 
  test('should test endswith validation', async () => {
    const sut = Config.validations.endswith.handle
    const message = Config.validations.endswith.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: 'hello world', params: ['world'] })).toBe(true)
    expect(sut({ value: 'Hello World', params: ['world'] })).toBe(true)
    expect(sut({ value: 'world hello', params: ['world'] })).toBe(false)
    expect(message([])).toBe(`This field must ends with undefined`)
    expect(message([], 'hello')).toBe(`This field must ends with hello`)
  })  
})

describe('Config validations - IN', () => { 
  test('should test In validation', async () => {
    const sut = Config.validations.in.handle
    const message = Config.validations.in.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: 'apple', params: ['apple','banana','orange'] })).toBe(true) 
    expect(sut({ value: 'apple,banana', params: ['apple','banana','orange'] })).toBe(true) 
    expect(sut({ value: 'watermelon,apple', params: ['apple','banana','orange'] })).toBe(true) 
    expect(sut({ value: 'watermelon', params: ['apple','banana','orange'] })).toBe(false) 
    expect(sut({ value: 'watermelon,lemon', params: ['apple','banana','orange'] })).toBe(false) 
    expect(message([])).toBe(`This field must contains `)
    expect(message(['hello'])).toBe(`This field must contains hello`)
    expect(message(['lemon','watermelon'])).toBe(`This field must contains lemon,watermelon`)
  })  
})

describe('Config validations - NotIn', () => { 
  test('should test NotIn validation', async () => {
    const sut = Config.validations.notin.handle
    const message = Config.validations.notin.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: 'lemon', params: ['apple','banana','orange'] })).toBe(true) 
    expect(sut({ value: 'lemon,watermelon', params: ['apple','banana','orange'] })).toBe(true) 
    expect(sut({ value: 'apple', params: ['apple','banana','orange'] })).toBe(false) 
    expect(sut({ value: 'apple,orange', params: ['apple','banana','orange'] })).toBe(false) 
    expect(message([])).toBe(`This field must not contains `)
    expect(message(['lemon','watermelon'])).toBe(`This field must not contains lemon,watermelon`)
  })  
})

describe('Config validations - Max and Min', () => {
  test('should test max validation', async () => {
    const sut = Config.validations.max.handle
    const message = Config.validations.max.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: '5', params: ['10'] })).toBe(true)
    expect(sut({ value: '15', params: ['10'] })).toBe(false)
    expect(message([])).toBe('This field must be less than undefined')
    expect(message(['10'])).toBe('This field must be less than 10')
  })

  test('should test min validation', async () => {
    const sut = Config.validations.min.handle
    const message = Config.validations.min.message
    expect(typeof sut).toBe('function')
    expect(sut({ value: '15', params: ['10'] })).toBe(true)
    expect(sut({ value: '5', params: ['10'] })).toBe(false)
    expect(message([])).toBe('This field must be greater than undefined')
    expect(message(['10'])).toBe('This field must be greater than 10')
  })
})

// describe('registerValidation test', () => {
//   it('should register new validation', () => {
//     const name = 'test'
//     const rule = {
//       message: (params, value, values) => `This field must quals ${value}`,
//       handle: ({ value, params }) => value == params[0]
//     }
//     Config.registerValidation(name, rule)
//     expect(Config.validations[name]).toEqual(rule)
//   })

//   it('should throw an error if no name is provided', () => {
//     expect(() => Config.registerValidation(undefined, {})).toThrowError('Name is required')
//   })

//   it('should throw an error if no rule is provided', () => {
//     expect(() => Config.registerValidation('name', undefined)).toThrowError('Rule is required as object')
//   })

//   it('should throw an error if rule message is not a function', () => {
//     expect(() => Config.registerValidation('name', { message: 'message' })).toThrowError('Rule message must be a function')
//   })

//   it('should throw an error if rule handle is not a function', () => {
//     expect(() => Config.registerValidation('name', { message: () => 'message', handle: 'handle' })).toThrowError('Rule handle must be a function')
//   })
// }) 