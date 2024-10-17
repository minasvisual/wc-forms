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