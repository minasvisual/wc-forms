import { isValidNumber, extractValidations, get, getFormValues, getFormValuesNested, getFormInputPathKey, syncFormInputValidations, collectFormControls } from './helpers.js'
import { Validate } from './validation.js'
import Masks from './mask.js'
import { Config } from './config.js'
import { defaultStyles } from './style-content.js'

const BaseHTMLElement = typeof HTMLElement !== 'undefined' ? HTMLElement : class {};

/** Dispatches a native DOM Event with optional `detail` and extra enumerable properties (same pattern as `submited` valid/errors). */
function dispatchNativeEvent(target, type, detail, extraProps) {
  const evt = new Event(type, { bubbles: true, cancelable: true, composed: true })
  if (detail !== undefined) {
    Object.defineProperty(evt, 'detail', { value: detail, enumerable: true, configurable: true })
  }
  if (extraProps) {
    for (const key of Object.keys(extraProps)) {
      Object.defineProperty(evt, key, { value: extraProps[key], enumerable: true, configurable: true })
    }
  }
  return target.dispatchEvent(evt)
}

class FormComponent extends BaseHTMLElement {
  static formAssociated = true;
  
  static get observedAttributes() {
    return [
      'value',
      'checked',
      'accept',
      'multiple',
      'capture',
      'required',
      'disabled',
      'name',
      'autocomplete',
      'tabindex',
      'webkitdirectory'
    ]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return
    const fileNative = new Set([
      'accept',
      'multiple',
      'capture',
      'required',
      'disabled',
      'name',
      'autocomplete',
      'tabindex',
      'webkitdirectory'
    ])
    if (!fileNative.has(name)) return
    if (this.getAttribute('type') !== 'file' || !this.formitem) return
    if (newValue === null) this.formitem.removeAttribute(name)
    else this.formitem.setAttribute(name, newValue)
  }

  checkValidity() {
    return this.internals.checkValidity();
  }
  
  reportValidity() {
    return this.internals.reportValidity();
  }
  
  get validity() {
    return this.internals.validity;
  }
  
  get validationMessage() {
    return this.internals.validationMessage;
  }

  get value() { 
    return this.internals.value;
  }
  
  get checked() {
    return this.internals.states.has('--checked');
  }
 
  set checked(flag) {
    if (flag) {
      this.internals.states.add('--checked');
    } else {
      this.internals.states.delete('--checked');
    }  
  }
  constructor() {
    super();
    this.internals = this.attachInternals();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
  }
  connectedCallback() {
    this.itype = this.getAttribute('type')
    // todo: create adapters 
    const inputs = Config.inputs
    const InputSource = inputs[this.itype] ?? inputs.text
    if (!InputSource) throw new Error(`Input type not found: ${this.itype}`)
    this.instance = new InputSource.source({
      el: this,
      shadow: this.shadowRoot,
      internals: this.internals
    })

    this.shadowRoot.appendChild(this.addStyles())
    this.formitem = this.instance.formitem
    if (!['button', 'submit', 'file', 'currency', 'group'].includes(this.itype)) {
      this.formitem.value = this.getAttribute('value')
    }
    this.formitem.setAttribute('data-type', InputSource.output)
    this.setAttribute('data-type', InputSource.output)

    // Seed internals so the initial value attribute is reflected in FormData on submit
    const skipInitialFormValue = ['checkbox', 'button', 'submit', 'file', 'currency', 'group'].includes(this.itype)
    if (!skipInitialFormValue) {
      const initialValue = this.unmaskIt(this.getAttribute('value'))
      if (initialValue !== null && initialValue !== undefined) {
        const name = this.getAttribute('name')
        let parsed;
        try { parsed = JSON.parse(initialValue); } catch { parsed = initialValue; }
        if (Array.isArray(parsed)) {
          const fd = new FormData();
          parsed.forEach(v => fd.append(name, String(v)));
          this.internals.setFormValue(parsed.length ? fd : null);
        } else {
          this.internals.setFormValue(initialValue);
        }
      }
    }
    this.maskIt(InputSource)
    if (this.itype === 'file') {
      this.formitem.addEventListener('change', (e) => {
        // Prevent native change from bubbling; host will emit its own `change`.
        e.stopPropagation();
        const input = e.target
        const files = input.files
        const name = this.getAttribute('name')
        if (!files || files.length === 0) {
          this.internals.setFormValue(null)
          this.emitEvent('change', undefined)
        } else if (input.hasAttribute('multiple')) {
          const fd = new FormData()
          for (let i = 0; i < files.length; i++) {
            fd.append(name, files[i])
          }
          this.internals.setFormValue(fd)
          this.emitEvent('change', Array.from(files))
        } else {
          this.internals.setFormValue(files[0])
          this.emitEvent('change', files[0])
        }
        this.validate()
      })
    } else if (this.itype !== 'currency' && this.itype !== 'group') {
      const handleFormItemValueUpdate = (e, emitType) => {
        // Prevent native input/change from bubbling; host will emit its own event.
        e.stopPropagation();
        let valueRaw = this.unmaskIt(e.target.value)
        this.formitem.value = e.target.value
        if (this.itype === 'range') {
          const v = this.formitem.value
          if (v === '' || v == null) valueRaw = undefined
          else {
            const n = Number(v)
            valueRaw = Number.isFinite(n) ? n : undefined
          }
        }

        // Only update internals form value if the raw value is defined.
        // Composite inputs (like checkboxes) call setFormValue themselves via emitValue.
        if (valueRaw !== undefined) {
          if (Array.isArray(valueRaw)) {
            const outputType = this.getAttribute('data-type');
            if (outputType === 'json' || outputType === 'object') {
              this.internals.setFormValue(JSON.stringify(valueRaw));
            } else {
              let fd = new FormData();
              valueRaw.forEach(v => fd.append(this.getAttribute('name'), v));
              this.internals.setFormValue(valueRaw.length ? fd : null);
            }
          } else {
            this.internals.setFormValue(valueRaw);
          }
        }

        this.emitEvent(emitType, valueRaw)
        this.validate()
      }
      if (this.itype === 'range' || this.itype === 'pills') {
        this.formitem.addEventListener('input', (e) => handleFormItemValueUpdate(e, 'input'))
      }
      console.debug('ATTACHING LISTENER TO', this.formitem.tagName, this.formitem.className); this.formitem.addEventListener('change', (e) => handleFormItemValueUpdate(e, 'change'))
    }

    if (this.instance?.onMounted)
      this.instance?.onMounted()

    if (this.instance?.onDestroy)
      this.instance?.onDestroy()

    this.handleSubmit()
  }

  disconnectedCallback() {
  }

  addStyles() {
    let style = document.createElement('style')
    Object.assign(style, {
      type: 'text/css',
    })
    if (Config.stylesText) {
      style.appendChild(document.createTextNode(Config.stylesText));
    } else if (Config.stylesURL) {
      style.appendChild(document.createTextNode(`@import "${Config.stylesURL}";`));
    } else {
      style.appendChild(document.createTextNode(defaultStyles));
    }
    return style
  }

  /**
   * Keeps ElementInternals in sync with the inner control so `form-input.value` and `event.target.value`
   * match the current UI state (not only after `change`). Required for `input` events fired while typing.
   */
  syncInternalsFromFormItem() {
    if (!this.formitem || ['file', 'group', 'button', 'submit', 'currency'].includes(this.itype)) return
    let valueRaw = this.unmaskIt(this.formitem.value)
    if (this.itype === 'range') {
      const v = this.formitem.value
      if (v === '' || v == null) valueRaw = undefined
      else {
        const n = Number(v)
        valueRaw = Number.isFinite(n) ? n : undefined
      }
    }
    if (valueRaw !== undefined) {
      if (Array.isArray(valueRaw)) {
        const outputType = this.getAttribute('data-type');
        if (outputType === 'json' || outputType === 'object') {
          this.internals.setFormValue(JSON.stringify(valueRaw));
        } else {
          const fd = new FormData()
          valueRaw.forEach(v => fd.append(this.getAttribute('name'), v))
          this.internals.setFormValue(valueRaw.length ? fd : null)
        }
      } else {
        this.internals.setFormValue(valueRaw)
      }
    }
  }

  emitEvent(type, detail) {
    if (type === 'input') {
      this.syncInternalsFromFormItem()
    }
    dispatchNativeEvent(this, type, detail)
  }

  getFormValues() {
    return getFormValues(this.internals.form)
  }

  handleSubmit(){
    const form = this.internals.form
    if (!form) return
    let submitElement = form.querySelector('button:not([type="button"])') 
    if(!submitElement) return;
    submitElement.addEventListener('click', e => { 
      this.validate()
      if (Object.keys(this.errors).length > 0)
        e.stopPropagation()
    })
  }

  validate() {
    this.instance.setError(false)
    this.errors = {}
    let name = this.getAttribute('name')
    let formValues = this.internals.form ? this.getFormValues() : {}
    let value = formValues[name] !== undefined ? formValues[name] : this.formitem.value
    let validAttrs = extractValidations(this.getAttribute('validations')) 
    if (!validAttrs || !validAttrs.length) return; 
    for (let attr of validAttrs) { 
      this.internals.setValidity({ valueMissing: false }, [], this.formitem)
      let vdt = new Validate(attr)
      if (vdt.validate(value, this.formitem, formValues))
        continue;
      this.errors[attr] = vdt.errors
      this.internals.setValidity({ valueMissing: true }, vdt.errors, this.formitem)
    }
    if (Object.keys(this.errors).length > 0)
      this.instance.setError(Object.values(this.errors).join('<br>'))
  }

  maskIt(InputSource) {    
    this.hasMask = this.getAttribute('mask') !== null 
    if(InputSource.output !== 'text' || !this.hasMask) return; 
 
    let instMask = Masks(this.formitem)
    let mask = this.getAttribute('mask')
    let format = this.getAttribute('mask:format') ?? 'pattern'
    let maskFn = get(Config.masks, format)
    if( !maskFn ) return;  

    if( typeof maskFn !== 'function' )
      instMask[maskFn](mask);
    else
      maskFn(this.formitem, instMask, mask); 
  }

  unmaskIt(value) {   
    const hasUnmask = this.getAttribute('unmask') !== null
    if(hasUnmask) { 
      return value ? value.replace(/\D/g, '') : value
    }
    return value
  }
}
 
const BaseHTMLFormElement = typeof HTMLFormElement !== 'undefined' ? HTMLFormElement : class {};

class FormWrapper extends BaseHTMLFormElement {
  static get observedAttributes() {
    return ['values']
  }

  constructor() {
    super()  
  }

  get values() {
    const raw = this.getAttribute('values')
    if (!raw) return {}
    try {
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch (error) {
      return {}
    }
  }

  set values(nextValues) {
    if (nextValues == null) {
      this.removeAttribute('values')
      return
    }
    if (typeof nextValues !== 'object') return
    try {
      this.setAttribute('values', JSON.stringify(nextValues))
    } catch (error) {
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== 'values' || oldValue === newValue) return
    this.applyValuesFromAttribute()
  }

  connectedCallback() {
    this.addEventListener('reset', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.reset(e)
    })

    this.addEventListener("submit", (e) => {
      e.preventDefault()
      e.stopPropagation()
      const form = e.target
      syncFormInputValidations(form)

      this.submitedValues = getFormValuesNested(form)
      this.isValid = true 
      this.errors = {} 

      for (let el of collectFormControls(form)) {
        let name = el.getAttribute('name')
        if (!name) continue;
        let type = el.getAttribute('data-type') || el.getAttribute('type') 
        if( ['button','submit','group'].includes(type) ) continue;
          
        if(!el.checkValidity()) {
          this.isValid = false
          const errorKey = getFormInputPathKey(el, form) || name
          this.errors[errorKey] = el.validationMessage 
        }
      } 
 
      this.emitEvent(e)
    })

    this.applyValuesFromAttribute()
  }

  emitEvent(nativeEvent) {
    dispatchNativeEvent(this, 'submited', this.submitedValues, { valid: this.isValid, errors: this.errors })
    dispatchNativeEvent(this, 'sent', this.submitedValues)
    dispatchNativeEvent(this, 'sentMeta', {
      source: 'submited',
      valid: this.isValid,
      errors: this.errors,
      nativeEvent,
    })
  }

  reset(nativeEvent) {
    this.removeAttribute('values')
    this.resetValues()
    dispatchNativeEvent(this, 'reseted', {
      source: 'form-control.reset',
      nativeEvent,
    })
  }

  applyValuesFromAttribute({ retry = true } = {}) {
    const valuesAttr = this.getAttribute('values')
    if (!valuesAttr) return
    let parsed
    try {
      parsed = JSON.parse(valuesAttr)
    } catch (error) {
      return
    }
    if (!parsed || typeof parsed !== 'object') return
    this.setValues(parsed)
    if (retry) this.hydrateValuesWhenReady(parsed)
  }

  hydrateValuesWhenReady(valuesObj, retries = 8) {
    const formInputs = Array.from(this.querySelectorAll('form-input'))
    const allReady = formInputs.every((el) => {
      const type = el.getAttribute('type')
      if (type === 'group') return true
      return !!el.formitem
    })
    if (allReady || retries <= 0) {
      this.setValues(valuesObj)
      return
    }
    setTimeout(() => this.hydrateValuesWhenReady(valuesObj, retries - 1), 0)
  }

  setValues(valuesObj = {}) {
    if (!valuesObj || typeof valuesObj !== 'object') return

    const getByPath = (obj, pathKey) => {
      if (!pathKey) return undefined
      const parts = String(pathKey).split('.')
      let current = obj
      for (const part of parts) {
        if (current == null || typeof current !== 'object' || !(part in current)) return undefined
        current = current[part]
      }
      return current
    }

    const toArray = (value) => {
      if (Array.isArray(value)) return value.map(String)
      if (value == null || value === '') return []
      return String(value).split(',').map((item) => item.trim()).filter(Boolean)
    }

    const controls = collectFormControls(this)
    for (const el of controls) {
      if (el?.localName !== 'form-input') continue
      const type = el.getAttribute('type')
      const outputType = el.getAttribute('data-type') || type
      if (['button', 'submit', 'group', 'file'].includes(type)) continue

      const name = el.getAttribute('name')
      if (!name) continue
      const pathKey = getFormInputPathKey(el, this) || name
      const nextValue = getByPath(valuesObj, pathKey)
      if (nextValue === undefined) continue

      if (type === 'checkbox') {
        const checkbox = el.shadowRoot?.querySelector('input[type="checkbox"]')
        if (!checkbox) continue
        checkbox.checked = !!nextValue
        checkbox.dispatchEvent(new Event('change', { bubbles: true }))
        continue
      }

      if (type === 'radioboxes') {
        const radios = el.shadowRoot?.querySelectorAll('input[type="radio"]') || []
        radios.forEach((radio) => {
          radio.checked = String(radio.value) === String(nextValue)
        })
        const trigger = Array.from(radios).find((radio) => radio.checked) || radios[0]
        if (trigger) trigger.dispatchEvent(new Event('change', { bubbles: true }))
        continue
      }

      if (type === 'checkboxes') {
        const checks = el.shadowRoot?.querySelectorAll('input[type="checkbox"]') || []
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
      const valueToWrite = nextValue == null ? '' : String(nextValue)
      el.formitem.value = valueToWrite

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

  resetValues() {
    const controls = collectFormControls(this)
    for (const el of controls) {
      if (el?.localName !== 'form-input') continue
      const type = el.getAttribute('type')
      if (['button', 'submit', 'group'].includes(type)) continue

      if (type === 'checkbox') {
        const checkbox = el.shadowRoot?.querySelector('input[type="checkbox"]')
        if (!checkbox) continue
        checkbox.checked = false
        checkbox.dispatchEvent(new Event('change', { bubbles: true }))
        continue
      }

      if (type === 'checkboxes') {
        const checks = el.shadowRoot?.querySelectorAll('input[type="checkbox"]') || []
        checks.forEach((check) => { check.checked = false })
        const trigger = checks[checks.length - 1] || checks[0]
        if (trigger) trigger.dispatchEvent(new Event('change', { bubbles: true }))
        continue
      }

      if (type === 'radioboxes') {
        const radios = el.shadowRoot?.querySelectorAll('input[type="radio"]') || []
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
}

if (typeof customElements !== 'undefined') {
  customElements.define('form-input', FormComponent);
}

// Proxy properties passed by frameworks dynamically to Attributes, 
// ensuring perfect integration across Vue, React, Svelte, etc.
const proxyProps = [
  'validations', 'mask', 'unmask', 'type', 'name', 
  'label', 'help', 'options', 'value', 'checked',
  'multiple', 'min', 'max', 'step'
];

for (let prop of proxyProps) {
  // If no setter exists (or if it doesn't exist at all), proxy it to setAttribute
  const descriptor = Object.getOwnPropertyDescriptor(FormComponent.prototype, prop);
  if (!descriptor || !descriptor.set) {
    Object.defineProperty(FormComponent.prototype, prop, {
      get() {
        if (descriptor && descriptor.get) return descriptor.get.call(this);
        return this.getAttribute(prop);
      },
      set(value) {
        if (typeof value === 'boolean' || prop === 'checked') {
          if (value) this.setAttribute(prop, '');
          else this.removeAttribute(prop);
        } else if (value && typeof value === 'object') {
          this.setAttribute(prop, JSON.stringify(value));
        } else {
          this.setAttribute(prop, value);
        }
        
        if (this.formitem) {
          if (prop === 'checked' && this.formitem.checked !== undefined) {
             this.formitem.checked = value;
          } else {
             this.formitem[prop] = value;
          }
        }
      },
      enumerable: true,
      configurable: true
    });
  }
}

function addEventProxy(prototype, eventName) {
  const camelName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
  const lowerName = `on${eventName}`;

  [camelName, lowerName].forEach(prop => {
    Object.defineProperty(prototype, prop, {
      enumerable: true,
      configurable: true,
      set(fn) {
        if (this[`_listener_${prop}`]) {
          this.removeEventListener(eventName, this[`_listener_${prop}`]);
        }
        this[`_listener_${prop}`] = fn;
        if (typeof fn === 'function') {
          this.addEventListener(eventName, fn);
        }
      },
      get() {
        return this[`_listener_${prop}`];
      }
    });
  });
}

addEventProxy(FormComponent.prototype, 'change');
addEventProxy(FormComponent.prototype, 'input');
addEventProxy(FormComponent.prototype, 'click');
addEventProxy(FormWrapper.prototype, 'submited');
addEventProxy(FormWrapper.prototype, 'sent');
addEventProxy(FormWrapper.prototype, 'sentMeta');
addEventProxy(FormWrapper.prototype, 'reseted');

if (typeof customElements !== 'undefined') {
  customElements.define("form-control",FormWrapper,{ extends: 'form' })
}