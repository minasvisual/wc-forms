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

export function normalizeJson(data) {
  if (!data) return '';
  if (data.includes("'")) data = data.replace(/'/g, '"')
  return data
}

export function splitValues(value) {
  if (!value || typeof value !== 'string') return value
  if (value.includes(',')) return value.split(',')
}

export function get (obj, path, defaultValue = undefined) {
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