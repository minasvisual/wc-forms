/**
 * jsdom's ElementInternals and FormData lack full form-associated custom element support.
 * Used only by tests (import before src/index.js).
 */
function ensureStates(internals) {
  if (internals.states && typeof internals.states.has === 'function') return
  const s = new Set()
  internals.states = {
    has: (k) => s.has(k),
    add: (k) => { s.add(k) },
    delete: (k) => { s.delete(k) },
  }
}

function patchInternalsObject(internals, hostEl) {
  ensureStates(internals)

  if (typeof internals.setFormValue !== 'function') {
    internals.setFormValue = function (value) {
      internals._wcSubmissionValue = value
    }
  }

  if (!Object.getOwnPropertyDescriptor(internals, 'value')) {
    Object.defineProperty(internals, 'value', {
      get() {
        return internals._wcSubmissionValue
      },
      enumerable: true,
      configurable: true,
    })
  }

  if (typeof internals.checkValidity !== 'function') {
    internals.checkValidity = function () { return true }
  }
  if (typeof internals.reportValidity !== 'function') {
    internals.reportValidity = function () { return true }
  }
  if (typeof internals.setValidity !== 'function') {
    internals.setValidity = function () {}
  }
  if (!Object.getOwnPropertyDescriptor(internals, 'validity')) {
    Object.defineProperty(internals, 'validity', {
      get() { return { valid: true, valueMissing: false } },
    })
  }
  if (!Object.getOwnPropertyDescriptor(internals, 'validationMessage')) {
    Object.defineProperty(internals, 'validationMessage', {
      get() { return '' },
    })
  }
  if (!Object.getOwnPropertyDescriptor(internals, 'form')) {
    Object.defineProperty(internals, 'form', {
      get() {
        let n = hostEl
        while (n) {
          if (n.tagName === 'FORM') return n
          const root = n.getRootNode && n.getRootNode()
          n = n.parentElement || (root && root.host) || null
        }
        return null
      },
    })
  }
}

const origAttach = typeof HTMLElement !== 'undefined' && HTMLElement.prototype.attachInternals
if (origAttach) {
  HTMLElement.prototype.attachInternals = function () {
    const internals = origAttach.call(this)
    patchInternalsObject(internals, this)
    return internals
  }
}

const OriginalFormData = globalThis.FormData
if (typeof OriginalFormData === 'function' && !OriginalFormData.__wcFormsPatched) {
  function augmentFormDataFromFormInputs(form, fd) {
    if (!(form instanceof globalThis.HTMLFormElement)) return
    const list = form.querySelectorAll('form-input')
    for (const el of list) {
      const name = el.getAttribute('name')
      if (!name || !el.internals) continue
      const v = el.internals._wcSubmissionValue
      if (v === null || v === undefined) continue
      if (v instanceof OriginalFormData) {
        for (const [k, val] of v.entries()) fd.append(k, val)
      } else {
        fd.append(name, v)
      }
    }
  }

  function FormDataPolyfill(...args) {
    const form = args[0]
    const fd = form instanceof globalThis.HTMLFormElement
      ? new OriginalFormData(...args)
      : new OriginalFormData()
    if (form instanceof globalThis.HTMLFormElement) {
      augmentFormDataFromFormInputs(form, fd)
    }
    return fd
  }

  FormDataPolyfill.__wcFormsPatched = true
  Object.setPrototypeOf(FormDataPolyfill, OriginalFormData)
  Object.setPrototypeOf(FormDataPolyfill.prototype, OriginalFormData.prototype)
  globalThis.FormData = FormDataPolyfill
}
