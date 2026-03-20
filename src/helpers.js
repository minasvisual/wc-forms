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

export function formatTypeValue(type, value) {
  if (type === 'checkboxes' || type === 'array') {
    if (['', null, undefined, NaN].includes(value)) return [];
    if (Array.isArray(value)) return value.map(String);
    return String(value).split(',');
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
  for (let el of Array.from(formElement.elements)) {
    let name = el.getAttribute('name');
    if (!name) continue;
    let type = el.getAttribute('data-type') || el.getAttribute('type');
    if (['button', 'submit'].includes(type)) continue;

    let value = rawValues[name];
    values[name] = formatTypeValue(type, value);
  }
  return values;
}