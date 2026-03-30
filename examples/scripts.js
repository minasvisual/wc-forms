/**
 * Helpers to sync shadow internals where host .value alone is not enough.
 */
function qsFormInput(name) {
  return document.querySelector(`form-input[name="${name}"]`)
}

function dispatchChangeOnFormItem(el) {
  if (el && el.formitem) {
    el.formitem.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

function setSelectValue(name, value) {
  const el = qsFormInput(name)
  if (!el) return
  const sel = el.shadowRoot && el.shadowRoot.querySelector('select')
  if (!sel) return
  sel.value = String(value)
  sel.dispatchEvent(new Event('change', { bubbles: true }))
}

function setRadioGroupValue(name, value) {
  const el = qsFormInput(name)
  if (!el) return
  const radio = el.shadowRoot && el.shadowRoot.querySelector(`input[type="radio"][value="${value}"]`)
  if (!radio) return
  radio.checked = true
  radio.dispatchEvent(new Event('change', { bubbles: true }))
}

function setCheckboxGroupValues(name, selectedValues) {
  const el = qsFormInput(name)
  if (!el) return
  const boxes = el.shadowRoot && el.shadowRoot.querySelectorAll('input[type="checkbox"]')
  boxes.forEach((cb) => {
    const want = selectedValues.includes(cb.value)
    if (cb.checked !== want) {
      cb.checked = want
      cb.dispatchEvent(new Event('change', { bubbles: true }))
    }
  })
}

function setSingleCheckbox(name, checked) {
  const el = qsFormInput(name)
  if (!el) return
  const cb = el.shadowRoot && el.shadowRoot.querySelector('.wc-form-checks input[type="checkbox"], input[type="checkbox"]')
  if (!cb) return
  if (cb.checked !== checked) {
    cb.checked = checked
    cb.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

function setTextLikeValue(name, value) {
  const el = qsFormInput(name)
  if (!el) return
  el.value = value
  dispatchChangeOnFormItem(el)
}

function setCurrencyField(name, digitsString) {
  const el = qsFormInput(name)
  if (!el) return
  el.value = digitsString
  const inp = el.shadowRoot && el.shadowRoot.querySelector('input[inputmode="decimal"], input.wc-form-input')
  if (inp) {
    inp.dispatchEvent(new Event('focus', { bubbles: true }))
    inp.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

function setMaskedText(name, rawValue) {
  const el = qsFormInput(name)
  if (!el) return
  el.value = rawValue
  const inp = el.shadowRoot && el.shadowRoot.querySelector('input.wc-form-input, input[part=input], input')
  if (!inp) return
  inp.value = rawValue
  inp.dispatchEvent(new Event('input', { bubbles: true }))
  inp.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: '0', keyCode: 48 }))
  dispatchChangeOnFormItem(el)
}

function setRangeValue(name, value) {
  const el = qsFormInput(name)
  if (!el) return
  el.setAttribute('value', String(value))
  const inp = el.shadowRoot && el.shadowRoot.querySelector('input[type="range"]')
  if (inp) {
    inp.value = String(value)
    inp.dispatchEvent(new Event('input', { bubbles: true }))
    inp.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

/**
 * Fills index.html demo form with values that satisfy all validations.
 * - textField: minlen 5
 * - passwordField: confirm:textField (must equal textField)
 * - selectField: in:2,3,5
 * - dateField / dateTimeField: between 2026-01-01 and 2026-12-31
 * - numberField: min 5 max 100
 * - radioboxesField: in:radio2,radio3
 * - checkboxField: in:check2
 * - colorField: custom:#ffffff
 */
function fillCompleteForm() {
  const textSample = 'abcdef'
  setTextLikeValue('hiddenValue', 'imhide')
  setTextLikeValue('textField', textSample)
  setTextLikeValue('emailField', 'demo@example.com')
  setTextLikeValue('passwordField', textSample)

  setSelectValue('selectField', '2')

  setTextLikeValue('dateField', '2026-06-10')
  setTextLikeValue('numberField', '42')

  setRadioGroupValue('radioboxesField', 'radio2')
  setCheckboxGroupValues('checkboxField', ['check2'])

  setTextLikeValue(
    'textareaField',
    'Textarea de exemplo com mais de cinco caracteres para passar minlen e maxlen.'
  )
  setTextLikeValue('urlField', 'https://example.com')
  setTextLikeValue('searchField', 'busca exemplo')
  setTextLikeValue('colorField', '#ffffff')
  setTextLikeValue('dateTimeField', '2026-06-10T14:30')

  setSingleCheckbox('booleanField', true)
  setSingleCheckbox('checkboxValueField', true)

  setCurrencyField('currencyField', '19990')
  setMaskedText('maskField', '123456')
  setMaskedText('maskFieldUnmaskedReturn', '11987654321')
  setMaskedText('customMaskField', '52998224725')

  setRangeValue('vol', 72)
  setCurrencyField('price', '25050')

  setTextLikeValue('autocompleteField', '2')
  setTextLikeValue('autocompleteHtmlField', '2')
}

function send(e) {
  e.preventDefault()
  const form = e.target
  const values = Object.fromEntries(new FormData(form))
  console.log('Submited validation', e.valid)
  console.log('Submited validation errors', e.errors)
  console.log('Submited data parsed', e.detail)
  console.log('Submited by event', values)
  alert('Sent! See the console.')
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('onload')

  const form = document.querySelector('form')
  if (form) {
    form.addEventListener('submit', () => console.log('submit'))
    form.addEventListener('submited', send)
  }

  const textField = qsFormInput('textField')
  if (textField) {
    textField.addEventListener('typing', (e) => console.log('typing', e.detail))
    textField.addEventListener('change', (e) => console.log('change', e.detail))
  }

  const go = qsFormInput('go')
  if (go) {
    go.addEventListener('click', (e) => {
      console.log('Fill form button', e.detail)
      fillCompleteForm()
    })
  }
})
