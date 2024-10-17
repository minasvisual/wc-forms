export function renderAttributes(el, exclude = []) {
  let attributes = ''
  for (const a of el.attributes) {
    if (exclude.includes(a.nodeName)) continue;
    attributes += `${a.nodeName}="${a.value}" `
  }
  return attributes
}

export function extractValidations(validString) {
  return (typeof validString === 'string' ? validString.split("|") : [])
}

export function templateString(str, obj) {
  return str.replace(/\{(.*?)\}/g, (match, key) => {
    return obj[key] !== undefined ? obj[key] : match;
  });
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

export const dateRegex = /^[1-2]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d)?$/;

export const emailRegex = /^([a-z]){1,}([a-z0-9._-]){1,}([@]){1}([a-z]){2,}([.]){1}([a-z]){2,}([.]?){1}([a-z]?){2,}$/i;