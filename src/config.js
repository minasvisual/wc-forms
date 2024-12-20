import { FormText } from './inputs/forminput.js'
import { FormSelect } from './inputs/formselect.js'
import { FormTextarea, } from './inputs/formtext.js'
import { FormCheckBox, FormChecksBoxes, FormChecksRadio } from './inputs/formchecks.js' 
import { splitValues, get, dateRegex, emailRegex, isValidNumber } from './helpers.js' 

/**
 * Validations object
 * @namespace validations
 * @prop {Object} required - required validation
 * @prop {Object} email - email validation
 * @prop {Object} isdate - check if is a date
 * @prop {Object} isafter - check if is after a date
 * @prop {Object} isbefore - check if is before a date
 * @prop {Object} isnumber - check if is a number
 * @prop {Object} minlen - check if is greater than a min length
 * @prop {Object} maxlen - check if is lesser than a max length
 * @prop {Object} confirm - check if is equal to other field
 * @prop {Object} in - check if is a value in an array
 * 
 * @example
 * {
 *   required: {
 *     message: () => 'This field is required',
 *     handle: ({ value, params }) => {
 *       return ![null, undefined, NaN, ''].includes(value)
 *     }
 *   },
 *   email: {
 *     message: () => 'This should be an valid email',
 *     handle: ({ value, params }) => {
 *       return emailRegex.test(value)
 *     }
 *   }
 * }
 */
export const validations = {

  required: {
    message: () => 'This field is required',
    /**
     * @function handle
     * @description Check if the value is not empty (not null, undefined, NaN, or empty string)
     * @param {Object} - object with the value to check and the parameters of the validation
     * @param {any} value - the value to check
     * @param {string[]} params - the parameters of the validation
     * @returns {boolean} - true if the value is not empty, false otherwise
     */
    handle: ({ value }) => {
      return ![null, undefined, NaN, ''].includes(value) 
    }
  },
  email: {
    message: () => 'This should be an valid email', 
    handle: ({ value }) => {
      return value && typeof value === 'string' && emailRegex.test(value)
    }
  },
  minlen: {
    message: (params) => `This field must be at least ${get(params, '[0]', 1)} characters`,
    handle: ({ value, params }) => {
      if(!get(params, '[0]')) throw new Error('Parameter 1 not found')
      return value && (value.length >= parseInt(params[0] || 1))
    }
  },
  maxlen: {
    message: (params, value, values) => `This field must be maximum ${get(params, '[0]', 255)} characters`,
    handle: ({ value, params }) => {   
      return value && ( value.length <= parseInt(get(params, '[0]', '255')) )
    }
  },
  confirm: {
    message: (params) => `This field must be equal to ${get(params, '[0]')} field`,
    handle: ({ value, params = [], values }) => {
      if(!get(params, '[0]')) throw new Error('Parameter to match not found')
      return value && get(params, '[0]') && (value === values[get(params, '[0]')])
    }
  },
  isdate: {
    message: () => 'This field must be a valid date',
    handle: ({ value }) => {
      return value && typeof value === 'string' && dateRegex.test(value)
    }
  },
  isafter: {
    message: (params = [], value, values) => `This field must be after ${get(params, '[0]')}`,
    handle: ({ value, params = [], values }) => {
      if(!get(params, '[0]')) throw new Error('Parameter 1 not found')
      return value && typeof value === 'string' && dateRegex.test(value) && new Date(value) > new Date(params[0])
    }
  },
  isbefore: {
    message: (params = [], value, values) => `This field must be before ${get(params, '[0]')}`,
    handle: ({ value, params = [], values }) => {
      if(!get(params, '[0]')) throw new Error('Parameter 1 not found')
      return value && typeof value === 'string' && dateRegex.test(value) && new Date(value) < new Date(params[0])
    }
  },
  isnumber: {
    message: () => 'This field must be a valid number',
    handle: ({ value, params }) => { 
      return value && typeof Number(value) === 'number' && !Number.isNaN(Number(value))
    }
  },
  startwith: {
    message: (params, value) => `This field must start with ${value}`,
    handle: ({ value, params }) => {
      if(!get(params, '[0]')) throw new Error('Parameter 1 not found')
      return value && value.toLowerCase().startsWith(params[0].toLowerCase())
    }
  },
  endswith: {
    message: (params = [], value) => `This field must ends with ${value}`,
    handle: ({ value, params }) => {
      return value && value.toLowerCase().endsWith(params[0].toLowerCase())
    }
  },
  in: {
    message: (params = [], value) => `This field must contains ${params?.join(',')}`,
    handle: ({ value, params }) => {
      if(params.length === 0) throw new Error('Parameters is required')
      if(value && value.includes(',')) 
        return  splitValues(value).some(v => splitValues(params).includes(v))
      else  
        return value && splitValues(params).includes(value)
    }
  },
  notin: {
    message: (params = [], value) => `This field must not contains ${params.join(',')}`,
    handle: ({ value, params }) => {
      if(params.length === 0) throw new Error('Parameters is required')
      if(value && value.includes(',')) 
        return  !splitValues(value).some(v => splitValues(params).includes(v))
      else  
        return value && !splitValues(params).includes(value)
    }
  },
  max: {
    message: (params = [], value) => `This field must be less than ${get(params, '[0]')}`,
    handle: ({ value, params }) => {
      if( !get(params, '[0]') || !isValidNumber(value) ) throw new Error('Parameter 1 not found')
      if( !isValidNumber(value) ) throw new Error('Value must be a number')
      return value && Number(value) <= Number(params[0])
    }
  },
  min: {
    message: (params = [], value) => `This field must be greater than ${get(params, '[0]')}`,
    handle: ({ value, params }) => {
      if( !get(params, '[0]') || !isValidNumber(value) ) throw new Error('Parameter 1 not found')
      if( !isValidNumber(value) ) throw new Error('Value must be a number')
      return value && Number(value) >= Number(params[0])
    }
  },
  istrue : {
    message: () => 'This field must be true',
    handle: ({ value }) => {
      return value && (value === 'true' || value === true)
    }
  },
  isfalse : {
    message: () => 'This field must be false',
    handle: ({ value }) => {
      return value && (value === 'false' || value === false)
    }
  }
}
 
export const inputs = {
  text: {
    output: 'text',
    source: FormText, 
  },
  number: {
    output: 'number',
    source: FormText,
  },
  email: {
    output: 'text',
    source: FormText,
  },
  url: {
    output: 'text',
    source: FormText,
  },
  color: {
    output: 'text',
    source: FormText,
  },
  date: {
    output: 'text',
    source: FormText,
  },
  'datetime-local': {
    source: FormText,
  }, 
  password: {
    output: 'text',
    source: FormText,
  },
  search: {
    output: 'text',
    source: FormText,
  },
  select: {
    output: 'text',
    source: FormSelect,
  },
  checkbox: {
    output: 'text',
    source: FormCheckBox,
  },
  radioboxes: {
    output: 'text',
    source: FormChecksRadio,
  },
  checkboxes: {
    output: 'array',
    source: FormChecksBoxes,
  },
  textarea: {
    output: 'text',
    source: FormTextarea,
  }, 
}

export const masks = {
  'pattern': 'maskPattern',
  'currency': 'maskMoney',
  'number': 'maskNumber', 
  'alpha': 'maskAlphaNum',
}

export const Config = {
  basePath: '/src',
  validations, 
  inputs,
  masks,
  registerMask(name, rule) {
    if(!name) throw new Error('Name is required')
    if(!rule || typeof rule !== 'function') throw new Error('Rule is required as object')
    this.masks[name] = rule
  },
  registerValidation(name, rule) {
    if(!name) throw new Error('Name is required')
    if(!rule || typeof rule !== 'object') throw new Error('Rule is required as object')
    if(!rule.message || typeof rule.message !== 'function') throw new Error('Rule message must be a function')
    if(!rule.handle || typeof rule.handle !== 'function') throw new Error('Rule handle must be a function')
    this.validations[name] = rule
  },
  registerInput(name, classObj, options = {}) { 
    if(!name) throw new Error('Name is required')
    if(!classObj || typeof classObj !== 'function') throw new Error('Rule is required as object') 
    this.inputs[name] = { 
      output: options?.output || 'text', 
      source: classObj 
    }
  }
}