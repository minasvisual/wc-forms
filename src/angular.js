import { collectFormControls, getFormInputPathKey, getFormValues, syncFormInputValidations } from './helpers.js'

/**
 * Angular adapter for wc-forms-kit.
 *
 * Purpose:
 * - Keep Angular usage simple: users bind a single `(sent)` output on form submit.
 * - Internally bridge native `submited` when available, with `submit` fallback parsing.
 */

function emitToAngularTarget(target, payload) {
  if (!target) return
  if (typeof target === 'function') {
    target(payload)
    return
  }
  if (typeof target.emit === 'function') {
    target.emit(payload)
  }
}

function toBridgePayload(node, nativeEvent) {
  return {
    nativeEvent,
    detail: nativeEvent?.detail,
    value: node?.value,
    name: node?.getAttribute?.('name') || '',
    type: node?.getAttribute?.('type') || '',
  }
}

function resolveFormFromEvent(nativeEvent, fallbackElement) {
  const source = nativeEvent?.target
  if (source?.tagName === 'FORM') return source
  if (source?.closest) {
    const closestForm = source.closest('form')
    if (closestForm) return closestForm
  }
  if (fallbackElement?.tagName === 'FORM') return fallbackElement
  if (fallbackElement?.closest) return fallbackElement.closest('form')
  return null
}

function getByPath(obj, pathKey) {
  if (!pathKey || !obj || typeof obj !== 'object') return undefined
  const parts = String(pathKey).split('.')
  let current = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object' || !(part in current)) return undefined
    current = current[part]
  }
  return current
}

function toArray(value) {
  if (Array.isArray(value)) return value.map(String)
  if (value == null || value === '') return []
  return String(value).split(',').map((item) => item.trim()).filter(Boolean)
}

function collectValidationErrors(form) {
  if (!form) return {}
  const errors = {}
  const controls = collectFormControls(form)
  for (const el of controls) {
    const name = el?.getAttribute?.('name')
    if (!name) continue
    const type = el?.getAttribute?.('data-type') || el?.getAttribute?.('type')
    if (['button', 'submit', 'group'].includes(type)) continue
    if (typeof el?.checkValidity === 'function' && !el.checkValidity()) {
      const key = getFormInputPathKey(el, form) || name
      errors[key] = el.validationMessage
    }
  }
  return errors
}

function emitSentMeta(outputs, meta) {
  emitToAngularTarget(outputs.sentMeta, meta)
}

function emitSent(outputs, form, nativeEvent, source) {
  if (!form) return
  const payload = getFormValues(form)
  emitToAngularTarget(outputs.sent, payload)
  emitToAngularTarget(outputs.sentDetail, payload)
  emitSentMeta(outputs, {
    source,
    valid: source === 'submited' ? !!nativeEvent?.valid : true,
    errors: source === 'submited' ? (nativeEvent?.errors || {}) : {},
    nativeEvent,
  })
}

/**
 * Binds wc-forms native events to callbacks/EventEmitters.
 *
 * @param {HTMLElement} element - `form-input` or `form[is="form-control"]`
 * @param {Object} outputs
 * @returns {Function} cleanup
 */
export function bindWcFormsAngularOutputs(element, outputs = {}) {
  if (!element || typeof element.addEventListener !== 'function') {
    return () => {}
  }

  const bindings = [
    {
      nativeEventName: 'input',
      fullPayloadOutput: 'wcfInputEvent',
      detailOnlyOutput: 'wcfInput',
      legacyDetailOutput: 'wcfInputDetail',
    },
    {
      nativeEventName: 'change',
      fullPayloadOutput: 'wcfChangeEvent',
      detailOnlyOutput: 'wcfChange',
      legacyDetailOutput: 'wcfChangeDetail',
    },
    {
      nativeEventName: 'submited',
      fullPayloadOutput: 'wcfSubmited',
      detailOnlyOutput: 'wcfSubmitedDetail',
    },
  ]

  const listeners = bindings.map((binding) => {
    const listener = (nativeEvent) => {
      const payload = toBridgePayload(element, nativeEvent)
      emitToAngularTarget(outputs[binding.fullPayloadOutput], payload)
      emitToAngularTarget(outputs[binding.detailOnlyOutput], payload.detail)
      if (binding.legacyDetailOutput) {
        emitToAngularTarget(outputs[binding.legacyDetailOutput], payload.detail)
      }
    }
    element.addEventListener(binding.nativeEventName, listener)
    return { name: binding.nativeEventName, listener }
  })

  return () => {
    listeners.forEach(({ name, listener }) => {
      element.removeEventListener(name, listener)
    })
  }
}

/**
 * Binds submit behavior for Angular users that want a single `(sent)` output.
 * - Prefers wc-forms `submited` event when available.
 * - Falls back to native `submit` + `getFormValues(form)`.
 */
export function bindWcFormsAngularSubmit(element, outputs = {}) {
  if (!element || typeof element.addEventListener !== 'function') {
    return () => {}
  }

  let handledBySubmited = false

  const onSubmited = (nativeEvent) => {
    handledBySubmited = true
    const form = resolveFormFromEvent(nativeEvent, element)
    if (nativeEvent?.valid === false) {
      emitSentMeta(outputs, {
        source: 'submited',
        valid: false,
        errors: nativeEvent?.errors || {},
        nativeEvent,
      })
      return
    }
    emitSent(outputs, form, nativeEvent, 'submited')
  }

  const onSubmit = (nativeEvent) => {
    // If wc-forms dispatched `submited`, skip duplicate fallback emission.
    if (handledBySubmited) {
      handledBySubmited = false
      return
    }
    if (typeof nativeEvent?.preventDefault === 'function') nativeEvent.preventDefault()
    const form = resolveFormFromEvent(nativeEvent, element)
    if (!form) return
    syncFormInputValidations(form)
    const isValid = typeof form.checkValidity === 'function' ? form.checkValidity() : true
    if (!isValid) {
      if (typeof form.reportValidity === 'function') form.reportValidity()
      emitSentMeta(outputs, {
        source: 'submit-fallback',
        valid: false,
        errors: collectValidationErrors(form),
        nativeEvent,
      })
      return
    }
    emitSent(outputs, form, nativeEvent, 'submit-fallback')
  }

  const onReset = (nativeEvent) => {
    if (typeof nativeEvent?.preventDefault === 'function') nativeEvent.preventDefault()
    const form = resolveFormFromEvent(nativeEvent, element)
    if (!form) return
    resetFormValues(form)
    emitToAngularTarget(outputs.reseted, { nativeEvent })
  }

  element.addEventListener('submited', onSubmited)
  element.addEventListener('submit', onSubmit)
  element.addEventListener('reset', onReset)

  return () => {
    element.removeEventListener('submited', onSubmited)
    element.removeEventListener('submit', onSubmit)
    element.removeEventListener('reset', onReset)
  }
}

/**
 * Angular-friendly form hydration helper.
 * Works even when `<form is="form-control">` is not upgraded as a customized built-in.
 */
export function setFormValues(formElement, valuesObj = {}) {
  if (!formElement || typeof formElement.querySelectorAll !== 'function') return
  if (!valuesObj || typeof valuesObj !== 'object') return

  const controls = collectFormControls(formElement)
  for (const el of controls) {
    if (el?.localName !== 'form-input') continue

    const type = el.getAttribute('type')
    if (['button', 'submit', 'group', 'file'].includes(type)) continue

    const name = el.getAttribute('name')
    if (!name) continue

    const pathKey = getFormInputPathKey(el, formElement) || name
    const nextValue = getByPath(valuesObj, pathKey)
    if (nextValue === undefined) continue

    if (type === 'checkbox') {
      const checkbox = el.shadowRoot?.querySelector?.('input[type="checkbox"]')
      if (!checkbox) continue
      checkbox.checked = !!nextValue
      checkbox.dispatchEvent(new Event('change', { bubbles: true }))
      continue
    }

    if (type === 'radioboxes') {
      const radios = el.shadowRoot?.querySelectorAll?.('input[type="radio"]') || []
      radios.forEach((radio) => {
        radio.checked = String(radio.value) === String(nextValue)
      })
      const trigger = Array.from(radios).find((radio) => radio.checked) || radios[0]
      if (trigger) trigger.dispatchEvent(new Event('change', { bubbles: true }))
      continue
    }

    if (type === 'checkboxes') {
      const checks = el.shadowRoot?.querySelectorAll?.('input[type="checkbox"]') || []
      const values = toArray(nextValue)
      checks.forEach((check) => {
        check.checked = values.includes(String(check.value))
      })
      const trigger = checks[checks.length - 1] || checks[0]
      if (trigger) trigger.dispatchEvent(new Event('change', { bubbles: true }))
      continue
    }

    if (type === 'autocomplete' || type === 'pills' || type === 'repeater') {
      if (!el.formitem) continue
      el.formitem.value = nextValue
      if (type === 'pills' || type === 'repeater') {
        el.formitem.dispatchEvent(new Event('input', { bubbles: true }))
      }
      el.formitem.dispatchEvent(new Event('change', { bubbles: true }))
      continue
    }

    if (!el.formitem) continue
    el.formitem.value = nextValue == null ? '' : String(nextValue)
    if (type === 'range') {
      el.formitem.dispatchEvent(new Event('input', { bubbles: true }))
    } else if (type === 'currency') {
      el.formitem.dispatchEvent(new Event('input', { bubbles: true }))
      el.formitem.dispatchEvent(new Event('blur', { bubbles: true }))
      continue
    }
    el.formitem.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

/**
 * Resets form-input controls with the same type-aware behavior used by form-control.
 * Useful when `form` customized built-ins are not upgraded by the host framework.
 */
export function resetFormValues(formElement) {
  if (!formElement || typeof formElement.querySelectorAll !== 'function') return

  const controls = collectFormControls(formElement)
  for (const el of controls) {
    if (el?.localName !== 'form-input') continue
    const type = el.getAttribute('type')
    if (['button', 'submit', 'group'].includes(type)) continue

    if (type === 'checkbox') {
      const checkbox = el.shadowRoot?.querySelector?.('input[type="checkbox"]')
      if (!checkbox) continue
      checkbox.checked = false
      checkbox.dispatchEvent(new Event('change', { bubbles: true }))
      continue
    }

    if (type === 'checkboxes') {
      const checks = el.shadowRoot?.querySelectorAll?.('input[type="checkbox"]') || []
      checks.forEach((check) => { check.checked = false })
      const trigger = checks[checks.length - 1] || checks[0]
      if (trigger) trigger.dispatchEvent(new Event('change', { bubbles: true }))
      continue
    }

    if (type === 'radioboxes') {
      const radios = el.shadowRoot?.querySelectorAll?.('input[type="radio"]') || []
      radios.forEach((radio) => { radio.checked = false })
      if (el.formitem) el.formitem.dispatchEvent(new Event('change', { bubbles: true }))
      continue
    }

    if (type === 'pills' || type === 'repeater') {
      if (!el.formitem) continue
      el.formitem.value = []
      el.formitem.dispatchEvent(new Event('input', { bubbles: true }))
      el.formitem.dispatchEvent(new Event('change', { bubbles: true }))
      continue
    }

    if (type === 'autocomplete') {
      if (!el.formitem) continue
      el.formitem.value = ''
      el.formitem.dispatchEvent(new Event('change', { bubbles: true }))
      continue
    }

    if (!el.formitem) continue
    el.formitem.value = ''
    if (type === 'file') {
      el.formitem.dispatchEvent(new Event('change', { bubbles: true }))
      continue
    }
    if (type === 'currency') {
      el.formitem.dispatchEvent(new Event('input', { bubbles: true }))
      el.formitem.dispatchEvent(new Event('blur', { bubbles: true }))
      continue
    }
    if (type === 'range') {
      el.formitem.dispatchEvent(new Event('input', { bubbles: true }))
    }
    el.formitem.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

/**
 * Runtime Angular directive factory.
 *
 * Why a factory?
 * - Avoid a hard dependency on `@angular/core` for non-Angular consumers.
 * - Works with CDN/ESM Angular demos and regular Angular apps.
 *
 * @param {Object} ngCore - object with Angular core symbols (pass `ChangeDetectorRef` for zoneless apps)
 * @returns {{ WcFormInputEventsDirective: any, WcFormControlEventsDirective: any }}
 */
export function createWcFormsAngularDirectives(ngCore) {
  const {
    Directive,
    Output,
    EventEmitter,
    ElementRef,
    inject,
    ChangeDetectorRef,
  } = ngCore || {}

  if (!Directive || !Output || !EventEmitter || !ElementRef || !inject) {
    throw new Error(
      'createWcFormsAngularDirectives requires Directive, Output, EventEmitter, ElementRef, and inject from @angular/core'
    )
  }

  class WcFormInputEventsDirective {
    elementRef = inject(ElementRef)
    cdr = ChangeDetectorRef ? inject(ChangeDetectorRef, { optional: true }) : null
    // New API names
    wcfInput = new EventEmitter()
    wcfChange = new EventEmitter()
    wcfInputEvent = new EventEmitter()
    wcfChangeEvent = new EventEmitter()
    // Backward-compatible aliases
    wcfInputDetail = new EventEmitter()
    wcfChangeDetail = new EventEmitter()
    _cleanup = () => {}

    ngOnInit() {
      const touch = () => this.cdr?.markForCheck?.()
      this._cleanup = bindWcFormsAngularOutputs(this.elementRef.nativeElement, {
        wcfInput: (d) => {
          this.wcfInput.emit(d)
          touch()
        },
        wcfChange: (d) => {
          this.wcfChange.emit(d)
          touch()
        },
        wcfInputEvent: (d) => {
          this.wcfInputEvent.emit(d)
          touch()
        },
        wcfChangeEvent: (d) => {
          this.wcfChangeEvent.emit(d)
          touch()
        },
        wcfInputDetail: (d) => {
          this.wcfInputDetail.emit(d)
          touch()
        },
        wcfChangeDetail: (d) => {
          this.wcfChangeDetail.emit(d)
          touch()
        },
      })
    }

    ngOnDestroy() {
      this._cleanup()
    }
  }

  Directive({
    selector: 'form-input[wcForm], form-input[wcfEvents]',
    standalone: true,
  })(WcFormInputEventsDirective)
  Output()(WcFormInputEventsDirective.prototype, 'wcfInput')
  Output()(WcFormInputEventsDirective.prototype, 'wcfChange')
  Output()(WcFormInputEventsDirective.prototype, 'wcfInputEvent')
  Output()(WcFormInputEventsDirective.prototype, 'wcfChangeEvent')
  // legacy outputs
  Output()(WcFormInputEventsDirective.prototype, 'wcfInputDetail')
  Output()(WcFormInputEventsDirective.prototype, 'wcfChangeDetail')

  class WcFormControlEventsDirective {
    elementRef = inject(ElementRef)
    cdr = ChangeDetectorRef ? inject(ChangeDetectorRef, { optional: true }) : null
    wcfSubmited = new EventEmitter()
    wcfSubmitedDetail = new EventEmitter()
    sent = new EventEmitter()
    sentDetail = new EventEmitter()
    sentMeta = new EventEmitter()
    reseted = new EventEmitter()
    _cleanup = () => {}
    _cleanupSubmit = () => {}

    ngOnInit() {
      const touch = () => this.cdr?.markForCheck?.()
      this._cleanup = bindWcFormsAngularOutputs(this.elementRef.nativeElement, {
        wcfSubmited: (d) => {
          this.wcfSubmited.emit(d)
          touch()
        },
        wcfSubmitedDetail: (d) => {
          this.wcfSubmitedDetail.emit(d)
          touch()
        },
      })
      this._cleanupSubmit = bindWcFormsAngularSubmit(this.elementRef.nativeElement, {
        sent: (p) => {
          this.sent.emit(p)
          touch()
        },
        sentDetail: (p) => {
          this.sentDetail.emit(p)
          touch()
        },
        sentMeta: (m) => {
          this.sentMeta.emit(m)
          touch()
        },
        reseted: (r) => {
          this.reseted.emit(r)
          touch()
        },
      })
    }

    ngOnDestroy() {
      this._cleanup()
      this._cleanupSubmit()
    }
  }

  Directive({
    selector: 'form[wcForm], form[wcfEvents]',
    standalone: true,
  })(WcFormControlEventsDirective)
  Output()(WcFormControlEventsDirective.prototype, 'wcfSubmited')
  Output()(WcFormControlEventsDirective.prototype, 'wcfSubmitedDetail')
  Output()(WcFormControlEventsDirective.prototype, 'sent')
  Output()(WcFormControlEventsDirective.prototype, 'sentDetail')
  Output()(WcFormControlEventsDirective.prototype, 'sentMeta')
  Output()(WcFormControlEventsDirective.prototype, 'reseted')

  return {
    WcFormInputEventsDirective,
    WcFormControlEventsDirective,
  }
}
