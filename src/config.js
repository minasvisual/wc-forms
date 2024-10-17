import { FormText } from './inputs/forminput.js'
import { FormSelect } from './inputs/formselect.js'
import { FormTextarea } from './inputs/formtext.js'
import { FormChecksBox, FormChecksRadio } from './inputs/formchecks.js'
import { splitValues } from './helpers.js'

export const validations = {
  required: {
    message: () => 'This field is required',
    handle: ({ value, params }) => {
      return value && value.length > 0
    }
  },
  email: {
    message: () => 'This should be an valid email',
    handle: ({ value, params }) => {
      let reg = /^([a-z]){1,}([a-z0-9._-]){1,}([@]){1}([a-z]){2,}([.]){1}([a-z]){2,}([.]?){1}([a-z]?){2,}$/i;
      return value && typeof value === 'string' && reg.test(value)
    }
  },
  minlen: {
    message: (params, value, values) => `This field must be at least ${params[0]} characters`,
    handle: ({ value, params }) => {
      return value && (value.length >= parseInt(params[0] || 1))
    }
  },
  maxlen: {
    message: (params, value, values) => `This field must be maximum ${params[0]} characters`,
    handle: ({ value, params }) => {
      return value && (value.length <= parseInt(params[0] || 255))
    }
  },
  confirm: {
    message: (params, value, values) => `This field must be equal to ${params[0]} field`,
    handle: ({ value, params, values }) => {
      return value && params[0] && (value === values[params[0]])
    }
  },
  isdate: {
    message: () => 'This field must be a valid date',
    handle: ({ value, params }) => {
      let reg = /^([1-2][0-1][0-9][0-9])-([0-1][0-9])-([0-9]{2})$/i;
      return value && typeof value === 'string' && reg.test(value)
    }
  },
  isafter: {
    message: (params, value, values) => `This field must be after ${params[0]}`,
    handle: ({ value, params, values }) => {
      let reg = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/i;
      return value && typeof value === 'string' && reg.test(value) && new Date(value) > new Date(params[0])
    }
  },
  isbefore: {
    message: (params, value, values) => `This field must be before ${params[0]}`,
    handle: ({ value, params, values }) => {
      let reg = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/i;
      return value && typeof value === 'string' && reg.test(value) && new Date(value) < new Date(params[0])
    }
  },
  isnumber: {
    message: () => 'This field must be a valid number',
    handle: ({ value, params }) => {
      return value && typeof Number(value) === 'number'
    }
  },
  startwith: {
    message: (params, value) => `This field must start with ${value}`,
    handle: ({ value, params }) => {
      return value && value.startsWith(params[0])
    }
  },
  endswith: {
    message: (params, value) => `This field must ends with ${value}`,
    handle: ({ value, params }) => {
      return value && value.endsWith(params[0])
    }
  },
  in: {
    message: (params, value) => `This field must contains ${params.join(',')}`,
    handle: ({ value, params }) => { 
      return value && (splitValues(params).includes(value) || splitValues(value).includes(params)) 
    }
  },
  notin: {
    message: (params, value) => `This field must not contains ${params.join(',')}`,
    handle: ({ value, params }) => {
      return value && !params.includes(value)
    }
  },
  max: {
    message: (params, value) => `This field must be less than ${params[0]}`,
    handle: ({ value, params }) => {
      return value && Number(value) <= Number(params[0])
    }
  },
  min: {
    message: (params, value) => `This field must be greater than ${params[0]}`,
    handle: ({ value, params }) => {
      return value && Number(value) >= Number(params[0])
    }
  }
}

export const inputs = {
  text: {
    source: FormText,
  },
  number: {
    source: FormText,
  },
  email: {
    source: FormText,
  },
  url: {
    source: FormText,
  },
  color: {
    source: FormText,
  },
  date: {
    source: FormText,
  },
  'datetime-local': {
    source: FormText,
  }, 
  password: {
    source: FormText,
  },
  search: {
    source: FormText,
  },
  select: {
    source: FormSelect,
  },
  radio: {
    source: FormChecksRadio,
  },
  checkbox: {
    source: FormChecksBox,
  },
  textarea: {
    source: FormTextarea,
  }
}