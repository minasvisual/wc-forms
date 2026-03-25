import { isValidNumber, extractValidations, get, getFormValues } from './helpers.js'
import { Validate } from './validation.js'
import Masks from './mask.js'
import { Config } from './config.js'
import { defaultStyles } from './style-content.js'

const BaseHTMLElement = typeof HTMLElement !== 'undefined' ? HTMLElement : class {};

class FormComponent extends BaseHTMLElement {
  static formAssociated = true;
  
  static get observedAttributes() {
    return ["value", "checked"];
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
    this.formitem.value = this.getAttribute('value')
    this.formitem.setAttribute('data-type', InputSource.output)

    // Seed internals so the initial value attribute is reflected in FormData on submit
    if (this.itype !== 'checkbox') {
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
    this.formitem.addEventListener('change', (e) => { 
      let valueRaw = this.unmaskIt(e.target.value)
      this.formitem.value = e.target.value
      
      // Only update internals form value if the raw value is defined.
      // Composite inputs (like checkboxes) call setFormValue themselves via emitValue.
      if (valueRaw !== undefined) {
        if (Array.isArray(valueRaw)) {
          let fd = new FormData();
          valueRaw.forEach(v => fd.append(this.getAttribute('name'), v));
          this.internals.setFormValue(valueRaw.length ? fd : null);
        } else {
          this.internals.setFormValue(valueRaw);
        }
      }
      
      this.emitEvent('change', valueRaw)
      this.validate() 
    });

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

  emitEvent(type, detail) {
    let data = {
      bubbles: true,
      cancelable: true,
      detail
    }
    this.dispatchEvent(new CustomEvent(type, data))
  }

  getFormValues() {
    return getFormValues(this.internals.form)
  }

  handleSubmit(){
    let submitElement = this.internals.form.querySelector('button:not([type="button"])') 
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
  constructor() {
    super()  
  }
  connectedCallback() {
    this.addEventListener("submit", (e) => {
      e.preventDefault()
      e.stopPropagation()
      const form = e.target
      this.values = getFormValues(form)
      this.isValid = true 
      this.errors = {} 

      for (let el of form.elements){
        let name = el.getAttribute('name')
        if (!name) continue;
        let type = el.getAttribute('data-type') || el.getAttribute('type') 
        if( ['button','submit'].includes(type) ) continue;
          
        if(!el.checkValidity()) {
          this.isValid = false
          this.errors[name] = el.validationMessage 
        }
      } 
 
      this.emitEvent()
    })
  }

  emitEvent(values) {  
    const evt = new CustomEvent('submited', { detail:this.values })
    Object.defineProperties(evt, { valid: { value: this.isValid }, errors:{ value:this.errors} })
    this.dispatchEvent(evt)
  }
}

if (typeof customElements !== 'undefined') {
  customElements.define('form-input', FormComponent);
}

// Proxy properties passed by frameworks dynamically to Attributes, 
// ensuring perfect integration across Vue, React, Svelte, etc.
const proxyProps = [
  'validations', 'mask', 'unmask', 'type', 'name', 
  'label', 'help', 'options', 'value', 'checked'
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
addEventProxy(FormWrapper.prototype, 'submited');

if (typeof customElements !== 'undefined') {
  customElements.define("form-control",FormWrapper,{ extends: 'form' })
}