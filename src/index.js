import { renderAttributes, extractValidations } from './helpers.js'
import { Validate } from './validation.js'
import { Config } from './config.js'

class FormComponent extends HTMLElement {
  static formAssociated = true;
  constructor() {
    super();
    this.internals = this.attachInternals();
    this.attachShadow({ mode: 'open' });
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
    this.formitem.addEventListener('change', (e) => {
      this.internals.setFormValue(this.formitem.value)
      this.emitEvent('change', this.formitem.value)
      this.validate()
    });

    if (this.instance?.onMounted)
      this.instance?.onMounted()

    if (this.instance?.onDestroy)
      this.instance?.onDestroy()
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

  validate() {
    this.instance.setError(false)
    this.errors = {}
    let value = this.formitem.value
    let validAttrs = extractValidations(this.getAttribute('validations'))
    for (let attr of validAttrs) {
      let vdt = new Validate(attr)
      if (vdt.validate(value, this.formitem, this.getFormValues()))
        continue;
      this.errors[attr] = vdt.errors
    }
    if (Object.keys(this.errors).length > 0)
      this.instance.setError(Object.values(this.errors).join('<br>'))
  }

  get value() {
    return 'moo';
  }
}

customElements.define('form-input', FormComponent);

