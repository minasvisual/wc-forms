import { isValidNumber, extractValidations, get } from './helpers.js'
import { Validate } from './validation.js'
import Masks from './mask.js'
import { Config } from './config.js'

class FormComponent extends HTMLElement {
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
    this.maskIt(InputSource)
    this.formitem.addEventListener('change', (e) => { 
      let valueRaw =this.unmaskIt(e.target.value)
      this.formitem.value = e.target.value
      this.internals.setFormValue(valueRaw)
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
    style.appendChild(
      document.createTextNode(
        `@import "${Config.basePath}/style.css";`
      )
    );
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
    return Object.fromEntries(new FormData(this.internals.form));
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
    let value = this.formitem.value
    let validAttrs = extractValidations(this.getAttribute('validations')) 
    if (!validAttrs || !validAttrs.length) return; 
    for (let attr of validAttrs) { 
      this.internals.setValidity({ valueMissing: false }, [], this.formitem)
      let vdt = new Validate(attr)
      if (vdt.validate(value, this.formitem, this.getFormValues()))
        continue;
      if (this.itype === 'date')
        console.log('date', value, vdt)
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
 
class FormWrapper extends HTMLFormElement {
  constructor() {
    super()  
  }
  connectedCallback() {
    this.addEventListener("submit", (e) => {
      e.preventDefault()
      e.stopPropagation()
      const form = e.target
      let rawValues = Object.fromEntries(new FormData(form)) 
      this.isValid = true 
      this.errors = {} 
      this.values = {} 
      for (let el of form.elements){
        let name = el.getAttribute('name')
        let value = rawValues[name]
        let type = el.getAttribute('data-type') || el.getAttribute('type') 
        if( ['button','submit'].includes(type) ) continue;
          
        this.values[name] = this.format(type, value)  
        if(!el.checkValidity()) {
          this.isValid = false
          this.errors[name] = el.validationMessage 
        }
      } 
 
      this.emitEvent()
    })
  }
  format(type, value){ 
    if(['',null,undefined,NaN].includes(value)) return undefined
    if(isValidNumber(value)) return Number(value)
    if(value === 'true' || value === 'false') return value === 'true'
    if(value === 'null' ) return null
    if(type === 'number') return Number(value)
    if(type === 'currency') return Number(value)
    if(type === 'radioboxes' && value?.includes(',')) return value.split(',')
    if(type === 'checkboxes' && value?.includes(',')) return value.split(',')
    if(type === 'array' && value?.includes(',')) return value.split(',')
    if(type === 'object' && value?.includes(',')) return value.split(',')
    return value
  }

  emitEvent(values) {  
    const evt = new CustomEvent('submited', { detail:this.values })
    Object.defineProperties(evt, { valid: { value: this.isValid }, errors:{ value:this.errors} })
    this.dispatchEvent(evt)
  }


}

customElements.define('form-input', FormComponent);

customElements.define("form-control",FormWrapper,{ extends: 'form' })