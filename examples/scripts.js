import { onMounted, onDestroy, field } from '../src/helpers.js'

function qsFormInput(name, root = document) {
  if (!root) return null
  const form = root.querySelector('form[is="form-control"]') || root.querySelector('form')
  if (form) {
    const scoped = form.querySelector(`form-input[name="${name}"]`)
    if (scoped) return scoped
  }
  return document.querySelector(`form-input[name="${name}"]`)
}

/**
 * Fills index.html demo form through the new `form-control[values]` API.
 */
function fillCompleteForm(form) {
  const textSample = 'abcdef'
  if (!form) return
  form.values = {
    hiddenValue: 'imhide',
    textField: textSample,
    emailField: 'demo@example.com',
    passwordField: textSample,
    selectField: '2',
    selectFieldHtml: '2',
    dateField: '2026-06-10',
    numberField: 42,
    radioboxesField: 'radio2',
    checkboxField: ['check2'],
    textareaField: 'Textarea de exemplo com mais de cinco caracteres para passar minlen e maxlen.',
    urlField: 'https://example.com',
    searchField: 'busca exemplo',
    colorField: '#ffffff',
    dateTimeField: '2026-06-10T14:30',
    booleanField: true,
    checkboxValueField: true,
    currencyField: 199.90,
    maskField: '123456',
    maskFieldUnmaskedReturn: '11987654321',
    customMaskField: '52998224725',
    vol: 72,
    price: 250.50,
    autocompleteField: 2,
    autocompleteHtmlField: 2,
    tags: ['demo', 'wc-forms'],
    address: {
      street: 'Paulista Avenue',
      number: 1000,
      city: 'sao-paulo'
    },
    users: [
      { name: 'Mike tyson', email: 'mikethetyson@email.com' },
      { name: 'Evander Holifield', email: 'theholifield@email.com' },
    ]
  }
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

onMounted((doc) => {
  console.log('onload')

  const form = doc.querySelector('form[is="form-control"]') || doc.querySelector('form')
  if (form) {
    field(form, {
      submit: (e) => console.log('submit', e.detail),
      submited: send,
    })
  }

  const textField = qsFormInput('textField', doc)
  if (textField) {
    field(textField, {
      input: (e) => console.log('input', e.detail),
      change: (e) => console.log('change', e.detail),
    })
  }

  const go = qsFormInput('go', doc)
  if (go) {
    field(go, {
      click: (e) => {
        console.log('Fill form button', e.detail)
        fillCompleteForm(form)
      }
    })
  }
})

onDestroy(() => {
  console.log('document unload cleanup')
})
