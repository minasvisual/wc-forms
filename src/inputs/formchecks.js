import { renderAttributes, normalizeJson } from '../helpers.js'

export class FormChecks {
  constructor({ el, shadow, internals }) {
    this.itype = el.getAttribute('type')
    this.name = el.getAttribute('name')
    this.help = el.getAttribute('help')
    this.label = el.getAttribute('label')
    this.options = el.getAttribute('options')
    this.error = ''
    this.internals = internals
    const template = document.createElement("template");

    if (!this.options || !this.isJson(this.options))
      throw new Error('No options received');

    template.innerHTML = ` 
      <div class="wc-form-outer">
        <slot name="before"></slot>
        <slot name="label"><label class="wc-form-label">${this.label} </label></slot>
        <div class="wc-form-wrapper">
          <div class="wc-form-checks">
            <slot name="prefix"></slot>
            <slot name="input">${this.getChecks()}</slot>
            <slot name="suffix"></slot>
          </div>  
          <slot name="help">${this.help ? `<small>${this.help}</small>` : ''}</slot>
          <slot name="errors"><small class="wc-errors hidden"></small></slot>
        </div>
        <slot name="after"></slot>
      </div>
    `

    shadow.appendChild(template.content.cloneNode(true));
    this.erroritem = shadow.querySelector('.wc-errors');
    this.formitem = document.createElement('input')
    this.inputs = shadow.querySelectorAll('input')
  }

  onMounted() {
    [...this.inputs].map(inpt => {
      inpt.addEventListener('change', (evt) => this.emitValue(evt))
    })
  }
  onDestroy() {
    [...this.inputs].map(inpt => {
      inpt.removeEventListener('change', (evt) => this.emitValue(evt))
    })
  }

  isJson(data) {
    try {
      return JSON.parse(normalizeJson(data))
    } catch (error) {
      return false
    }
  }

  getChecks() {
    let options = this.isJson(this.options)
    let optsHtml = ''
    for (const [index, item] of options.entries()) {
      optsHtml += `
        <label class="wc-form-check" for="${this.name}_${index}">
          <input type="${this.itype}" name="${this.name}" value="${item.value || index}" id="${this.name}_${index}" />
          <span >${item.label || item}</span>
        </label>
       `
    }
    return optsHtml
  }

  emitValue(e) {
    this.formitem.value = e.target.value
    this.internals.setFormValue(e.target.value)
    this.formitem.dispatchEvent(new Event('change'));
  }

  setError(error) {
    if (!error) {
      this.erroritem.innerHTML = ''
      this.erroritem.classList.toggle('hidden')
      return;
    }
    this.erroritem.innerHTML = error
    this.erroritem.classList.toggle('hidden')
  }
}

export class FormChecksRadio extends FormChecks {
  emitValue(e) {
    this.formitem.value = e.target.value
    this.internals.setFormValue(e.target.value)
    this.formitem.dispatchEvent(new Event('change'));
  }
}

export class FormChecksBox extends FormChecks {
  emitValue(e) {
    let checks = [...this.inputs].filter(inpt => inpt.checked)
    let values = checks.map(inpt => inpt.value)
    this.formitem.value = values
    this.internals.setFormValue(values)
    this.formitem.dispatchEvent(new Event('change'));
  }
}