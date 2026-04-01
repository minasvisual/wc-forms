import { FormText } from './inputs/forminput.js'
import { FormSelect } from './inputs/formselect.js'
import { FormTextarea, } from './inputs/formtext.js'
import { FormCheckBox, FormChecksBoxes, FormChecksRadio } from './inputs/formchecks.js'
import { FormAutocomplete } from './inputs/formautocomplete.js'
import { FormButton } from './inputs/formbutton.js'
import { FormSubmit } from './inputs/formsubmit.js'
import { FormFile } from './inputs/formfile.js'
import { FormRange } from './inputs/formrange.js'
import { FormCurrency } from './inputs/formcurrency.js'
import { FormHidden } from './inputs/formhidden.js'
import { FormGroup } from './inputs/formgroup.js'
import { FormPills } from './inputs/formpills.js'
import { splitValues, get, dateRegex, emailRegex, isValidNumber } from './helpers.js'
import english from './lang/en.js'

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
export const languages = {
  en: english
}

export const t = (key, params = [], fallback = '') => {
  let msg = (Config && Config.languages && Config.languages[Config.lang])
    ? Config.languages[Config.lang][key] 
    : languages.en[key] || fallback || key;
  
  if (!msg) return key;
  
  return msg.replace(/\{(\d+)\}/g, (match, index) => {
    return String(params[index]);
  });
}

export const validations = {

  required: {
    message: () => t('required'),
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
    message: () => t('email'),
    handle: ({ value }) => {
      return value && typeof value === 'string' && emailRegex.test(value)
    }
  },
  url: {
    message: () => t('url'),
    handle: ({ value }) => {
      if (!value || typeof value !== 'string') return false
      try {
        // Accept full absolute URLs only, matching the placeholder/documentation intent.
        let parsed = new URL(value)
        return ['http:', 'https:'].includes(parsed.protocol)
      } catch (error) {
        return false
      }
    }
  },
  minlen: {
    message: (params) => t('minlen', [get(params, '[0]', 1)]),
    handle: ({ value, params }) => {
      if (!get(params, '[0]')) throw new Error('Parameter 1 not found')
      return value && (value.length >= parseInt(params[0] || 1))
    }
  },
  maxlen: {
    message: (params, value, values) => t('maxlen', [get(params, '[0]', 255)]),
    handle: ({ value, params }) => {
      return value && (value.length <= parseInt(get(params, '[0]', '255')))
    }
  },
  confirm: {
    message: (params) => t('confirm', [get(params, '[0]')]),
    handle: ({ value, params = [], values }) => {
      if (!get(params, '[0]')) throw new Error('Parameter to match not found')
      return value && get(params, '[0]') && (value === values[get(params, '[0]')])
    }
  },
  isdate: {
    message: () => t('isdate'),
    handle: ({ value }) => {
      return value && typeof value === 'string' && dateRegex.test(value)
    }
  },
  isafter: {
    message: (params = [], value, values) => t('isafter', [get(params, '[0]')]),
    handle: ({ value, params = [], values }) => {
      if (!get(params, '[0]')) throw new Error('Parameter 1 not found')
      return value && typeof value === 'string' && dateRegex.test(value) && new Date(value) > new Date(params[0])
    }
  },
  isbefore: {
    message: (params = [], value, values) => t('isbefore', [get(params, '[0]')]),
    handle: ({ value, params = [], values }) => {
      if (!get(params, '[0]')) throw new Error('Parameter 1 not found')
      return value && typeof value === 'string' && dateRegex.test(value) && new Date(value) < new Date(params[0])
    }
  },
  isnumber: {
    message: () => t('isnumber'),
    handle: ({ value, params }) => {
      return value && typeof Number(value) === 'number' && !Number.isNaN(Number(value))
    }
  },
  startwith: {
    message: (params, value) => t('startwith', [value]),
    handle: ({ value, params }) => {
      if (!get(params, '[0]')) throw new Error('Parameter 1 not found')
      return value && value.toLowerCase().startsWith(params[0].toLowerCase())
    }
  },
  endswith: {
    message: (params = [], value) => t('endswith', [value]),
    handle: ({ value, params }) => {
      return value && value.toLowerCase().endsWith(params[0].toLowerCase())
    }
  },
  in: {
    message: (params = [], value) => t('in', [params?.join(',')]),
    handle: ({ value, params }) => {
      let isarr = Array.isArray(value);
      params = params.map(String)
      if (isarr) return value.some(v => params.includes(String(v)))
      if (value && String(value).includes(',')) {
        return splitValues(String(value)).some(v => params.includes(v));
      } else {
        return value && params.includes(String(value));
      }
    }
  },
  notin: {
    message: (params = [], value) => t('notin', [params?.join(',')]),
    handle: ({ value, params }) => {
      if (params.length === 0) throw new Error('Parameters is required')
      if (value && value.includes(','))
        return !splitValues(value).some(v => splitValues(params).includes(v))
      else
        return value && !splitValues(params).includes(value)
    }
  },
  max: {
    message: (params = [], value) => t('max', [get(params, '[0]')]),
    handle: ({ value, params }) => {
      if (!get(params, '[0]') || !isValidNumber(value)) throw new Error('Parameter 1 not found')
      if (!isValidNumber(value)) throw new Error('Value must be a number')
      return value && Number(value) <= Number(params[0])
    }
  },
  min: {
    message: (params = [], value) => t('min', [get(params, '[0]')]),
    handle: ({ value, params }) => {
      if (!get(params, '[0]') || !isValidNumber(value)) throw new Error('Parameter 1 not found')
      if (!isValidNumber(value)) throw new Error('Value must be a number')
      return value && Number(value) >= Number(params[0])
    }
  },
  istrue: {
    message: () => t('istrue', [], 'This field must be true'),
    handle: ({ value }) => {
      return value && (value === 'true' || value === true)
    }
  },
  isfalse: {
    message: () => t('isfalse', [], 'This field must be false'),
    handle: ({ value }) => {
      return value && (value === 'false' || value === false)
    }
  },
  alphanumeric: {
    message: () => t('alphanumeric', [], 'This field must contain only latin letters and numbers'),
    handle: ({ value }) => {
      if (!value || typeof value !== 'string') return false
      return /^[\p{Script=Latin}\p{Mark}\d]+$/u.test(value)
    }
  },
  alpha: {
    message: () => t('alpha', [], 'This field must contain only latin letters'),
    handle: ({ value }) => {
      if (!value || typeof value !== 'string') return false
      return /^[\p{Script=Latin}\p{Mark}]+$/u.test(value)
    }
  },
  regex: {
    message: (params = []) => t('regex', [get(params, '[0]', '')], 'This field does not match required pattern'),
    handle: ({ value, params = [] }) => {
      if (!get(params, '[0]')) throw new Error('Parameter 1 not found')
      if (!value || typeof value !== 'string') return false
      try {
        const rx = new RegExp(params[0])
        return rx.test(value)
      } catch (error) {
        return false
      }
    }
  },
  passwordstrength: {
    message: (params = []) => t('passwordstrength', [params.join(',')], 'This field does not meet password strength requirements'),
    handle: ({ value, params = [] }) => {
      if (!value || typeof value !== 'string') return false
      if (!params.length) throw new Error('Parameters is required')
      const required = params.map(String)
      for (const rule of required) {
        if (rule === 'A' && !/[A-Z]/.test(value)) return false
        if (rule === '0' && !/\d/.test(value)) return false
        if (rule === '$' && !/[^\p{Script=Latin}\p{Mark}\d]/u.test(value)) return false
      }
      return true
    }
  },
  slug: {
    message: () => t('slug', [], 'This field must be a valid slug'),
    handle: ({ value }) => {
      if (!value || typeof value !== 'string') return false
      return /^[\p{Script=Latin}\p{Mark}\d_.-]+$/u.test(value)
    }
  },
  contains: {
    message: (params = []) => t('contains', [get(params, '[0]', '')], 'This field must contain required characters'),
    handle: ({ value, params = [] }) => {
      if (!get(params, '[0]')) throw new Error('Parameter 1 not found')
      if (!value || typeof value !== 'string') return false
      const requiredChars = String(params[0]).split('').filter(Boolean)
      return requiredChars.every((ch) => value.includes(ch))
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
  pills: {
    output: 'array',
    source: FormPills,
  },
  textarea: {
    output: 'text',
    source: FormTextarea,
  },
  autocomplete: {
    output: 'text',
    source: FormAutocomplete,
  },
  button: {
    output: 'button',
    source: FormButton,
  },
  submit: {
    output: 'submit',
    source: FormSubmit,
  },
  file: {
    output: 'file',
    source: FormFile,
  },
  range: {
    output: 'number',
    source: FormRange,
  },
  currency: {
    output: 'currency',
    source: FormCurrency,
  },
  hidden: {
    output: 'hidden',
    source: FormHidden,
  },
  group: {
    output: 'group',
    source: FormGroup,
  },
}

export const masks = {
  'pattern': 'maskPattern',
  'currency': 'maskMoney',
  'number': 'maskNumber',
  'alpha': 'maskAlphaNum',
}

export const Config = {
  lang: 'en',
  basePath: '/src',
  stylesURL: '',
  stylesText: '',
  validations,
  inputs,
  masks,
  languages,
  setLanguage(name) {
    if (!name) throw new Error('Language name is required')
    this.lang = name
  },
  registerMask(name, rule) {
    if (!name) throw new Error('Name is required')
    if (!rule || typeof rule !== 'function') throw new Error('Rule is required as object')
    this.masks[name] = rule
  },
  registerValidation(name, rule) {
    if (!name) throw new Error('Name is required')
    if (!rule || typeof rule !== 'object') throw new Error('Rule is required as object')
    if (!rule.message || typeof rule.message !== 'function') throw new Error('Rule message must be a function')
    if (!rule.handle || typeof rule.handle !== 'function') throw new Error('Rule handle must be a function')
    this.validations[name] = rule
  },
  registerInput(name, classObj, options = {}) {
    if (!name) throw new Error('Name is required')
    if (!classObj || typeof classObj !== 'function') throw new Error('Rule is required as object')
    this.inputs[name] = {
      output: options?.output || 'text',
      source: classObj
    }
  },
  registerLanguage(name, messages) {
    if (!name) throw new Error('Language name is required')
    if (!messages || typeof messages !== 'object') throw new Error('Messages is required as object')
    this.languages[name] = messages
  }
}
