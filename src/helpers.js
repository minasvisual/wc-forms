export function renderAttributes(el, exclude = []) {
  let attributes = ''
  for (const a of el.attributes) {
    if (exclude.includes(a.nodeName)) continue;
    attributes += `${a.nodeName}="${a.value}" `
  }
  return attributes
}

export function extractValidations(validString) {
  return (validString && typeof validString === 'string' ? validString.split("|") : [])
}

export function templateString(str, obj) {
  return str.replace(/\{(.*?)\}/g, (match, key) => {
    return obj[key] !== undefined ? obj[key] : match;
  });
}

export function jsonToString(data) {
  if (!data) return '';
  if (typeof data === 'string') return data;
  return JSON.stringify(data).replace(/"/g, "'");
}

export function normalizeJson(data) {
  if (!data) return '';
  if (data.includes("'")) data = data.replace(/'/g, '"')
  return data
}

export function splitValues(value) {
  if (!value || typeof value !== 'string') return value
  if (value.includes(',')) return value.split(',')
}

export function get(obj, path, defaultValue = undefined) {
  const travel = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}


export function isValidNumber(value) {
  return typeof Number(value) === 'number' && !Number.isNaN(Number(value))
}

export const dateRegex = /^[1-2]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d(:[01]\d)?)?$/;

export const emailRegex = /^([a-z]){1,}([a-z0-9._-]){1,}([@]){1}([a-z]){2,}([.]){1}([a-z]){2,}([.]?){1}([a-z]?){2,}$/i;

/** One token from HTML `accept`: MIME, `maintype/*`, or leading-dot extension. */
export function fileMatchesAcceptToken(file, token) {
  if (!file || typeof token !== 'string') return false
  const t = token.trim().toLowerCase()
  if (!t) return false
  if (t.startsWith('.')) {
    const name = String(file.name || '').toLowerCase()
    return name.endsWith(t)
  }
  const mt = String(file.type || '').toLowerCase()
  if (t.endsWith('/*')) {
    const main = t.slice(0, -2)
    return mt.startsWith(`${main}/`)
  }
  return mt === t
}

/** OR semantics: file matches if it matches any token. */
export function fileMatchesAnyAcceptToken(file, tokens) {
  if (!tokens || !tokens.length) return false
  return tokens.some((tok) => fileMatchesAcceptToken(file, tok))
}

export function formatTypeValue(type, value) {
  if (type === 'checkboxes' || type === 'array') {
    if (['', null, undefined, NaN].includes(value)) return [];
    if (Array.isArray(value)) return value.map(String);
    return String(value).split(',');
  }

  if (type === 'file') {
    if (value === undefined || value === null || value === '') return undefined
    if (Array.isArray(value)) {
      const files = value.filter((v) => typeof File !== 'undefined' && v instanceof File)
      if (files.length === 0) return undefined
      return files.length === 1 ? files[0] : files
    }
    if (typeof File !== 'undefined' && value instanceof File) return value
    return value
  }

  if (type === 'range') {
    if (['', null, undefined, NaN].includes(value)) return undefined
    const n = Number(value)
    return Number.isFinite(n) ? n : undefined
  }

  if (type === 'hidden') {
    if (['', null, undefined, NaN].includes(value)) return undefined
    return String(value)
  }

  if (['', null, undefined, NaN].includes(value)) return undefined;
  if (type === 'radioboxes' && value?.includes(',')) return String(value).split(',');
  if (type === 'object' && value?.includes(',')) return String(value).split(',');

  if (isValidNumber(value)) return Number(value);
  if (value === 'true' || value === 'false') return value === 'true';
  if (value === 'null') return null;
  if (type === 'number') return Number(value);
  if (type === 'currency') return Number(value);
  return value;
}

export function resolveLabel(el) {
  return el?.getAttribute?.('label') ?? ''
}

export function resolvePlaceholder(el, fallbackLabel = '') {
  if (!el || typeof el.getAttribute !== 'function') return ''
  const explicit = el.getAttribute('placeholder')
  if (explicit !== null && explicit !== undefined) return explicit
  return fallbackLabel || ''
}

/** Listed controls plus <form-input> hosts (not always present in form.elements). */
export function collectFormControls(formElement) {
  if (!formElement || !formElement.querySelectorAll) return new Set()
  return new Set([
    ...Array.from(formElement.elements),
    ...formElement.querySelectorAll('form-input'),
  ])
}

/** Applies Config-driven rules to ElementInternals so checkValidity/reportValidity work. */
export function syncFormInputValidations(formElement) {
  if (!formElement || !formElement.querySelectorAll) return
  for (const fi of formElement.querySelectorAll('form-input')) {
    if (typeof fi.validate === 'function') fi.validate()
  }
}

export function getFormValues(formElement) {
  if (!formElement || !(formElement instanceof HTMLFormElement)) throw new Error('Valid Form Element is required');
  let fd = new FormData(formElement);
  
  let rawValues = {};
  for (let [key, val] of fd.entries()) {
    if (rawValues.hasOwnProperty(key)) {
       if (!Array.isArray(rawValues[key])) rawValues[key] = [rawValues[key]];
       rawValues[key].push(val);
    } else {
       rawValues[key] = val;
    }
  }

  let values = {};
  const controls = collectFormControls(formElement)
  for (let el of controls) {
    let name = el.getAttribute('name');
    if (!name) continue;
    let type = el.getAttribute('data-type') || el.getAttribute('type');
    if (['button', 'submit', 'group'].includes(type)) continue;

    let value = rawValues[name];
    values[name] = formatTypeValue(type, value);
  }
  return values;
}

export function getFormInputGroupPath(el, formElement) {
  const segments = []
  if (!el) return segments
  let node = el.parentElement
  while (node && node !== formElement && node.tagName !== 'FORM') {
    if (node.localName === 'form-input' && node.getAttribute('type') === 'group') {
      const name = node.getAttribute('name')
      if (name) segments.unshift(name)
    }
    node = node.parentElement
  }
  return segments
}

export function getFormInputPathKey(el, formElement) {
  const leafName = el?.getAttribute?.('name')
  if (!leafName) return null
  const groupSegments = getFormInputGroupPath(el, formElement)
  if (!groupSegments.length) return leafName
  return `${groupSegments.join('.')}.${leafName}`
}

function setNested(obj, pathSegments, leafKey, value) {
  if (!pathSegments.length) {
    obj[leafKey] = value
    return
  }
  let cur = obj
  for (let i = 0; i < pathSegments.length; i++) {
    const k = pathSegments[i]
    if (i === pathSegments.length - 1) {
      cur[k] = cur[k] || {}
      cur[k][leafKey] = value
      return
    }
    cur[k] = cur[k] || {}
    cur = cur[k]
  }
}

/**
 * Builds a nested values object for submit payloads when `type="group"` is used.
 * Notes:
 * - This keeps validation logic flat (leaf values) and only nests the final submit `detail`.
 * - Collisions between leaf fields with the same name across different groups are not fully
 *   disambiguated (existing behavior is already name-based).
 */
export function getFormValuesNested(formElement) {
  const flat = getFormValues(formElement)
  const nested = {}
  const controls = collectFormControls(formElement)

  for (let el of controls) {
    const leafName = el.getAttribute('name')
    if (!leafName) continue
    const type = el.getAttribute('data-type') || el.getAttribute('type')
    if (['button', 'submit', 'group'].includes(type)) continue

    const groupSegments = getFormInputGroupPath(el, formElement)
    const value = flat[leafName]
    setNested(nested, groupSegments, leafName, value)
  }

  return nested
}

export function onMounted(callback) {
  if (typeof callback !== 'function') return () => {}
  if (typeof document === 'undefined') return () => {}

  const run = () => callback(document)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true })
    return () => document.removeEventListener('DOMContentLoaded', run)
  }

  run()
  return () => {}
}

export function onDestroy(callback) {
  if (typeof callback !== 'function') return () => {}
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {}

  const run = () => callback(document)
  const destroyEvent = 'pagehide'
  window.addEventListener(destroyEvent, run)
  return () => window.removeEventListener(destroyEvent, run)
}

export function field(el, config = {}) {
  if (!el || typeof config !== 'object') {
    return { destroy: () => {}, dispose: () => {} }
  }

  const listeners = []
  const isEventKey = (key, value) => typeof value === 'function' && (`on${key}` in el)
  const destroyEvent = 'pagehide'

  const destroy = () => {
    for (const [key, fn] of listeners) {
      el.removeEventListener(key, fn)
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener(destroyEvent, destroy)
    }
  }

  for (const [key, value] of Object.entries(config)) {
    if (key === 'classes') {
      if (Array.isArray(value)) {
        const classes = value.map(String).filter(Boolean)
        if (classes.length) el.classList.add(...classes)
      }
      continue
    }

    if (isEventKey(key, value)) {
      el.addEventListener(key, value)
      listeners.push([key, value])
      continue
    }

    if (key in el) {
      try { el[key] = value } catch (error) {}
    }

    if (value !== undefined && value !== null && typeof value !== 'function') {
      try { el.setAttribute(key, String(value)) } catch (error) {}
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener(destroyEvent, destroy)
  }
  return { el, destroy, dispose: destroy }
}