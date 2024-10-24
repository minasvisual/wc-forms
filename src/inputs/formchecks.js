import { renderAttributes, normalizeJson } from '../helpers.js'

export class FormChecks {
  constructor({ el, shadow, internals }) {
    this.itype = el.getAttribute('type')
    this.name = el.getAttribute('name')
    this.help = el.getAttribute('help')
    this.label = el.getAttribute('label')
    this.options = el.getAttribute('options')
    this.inputvalue = el.value || ''
    this.error = ''
    this.internals = internals
    const template = document.createElement("template");
 
    if (!this.options || !this.isJson(this.options))
      throw new Error('No options received');

    template.innerHTML = ` 
      <div class="wc-form-outer">
        <slot name="before"></slot>
        <slot name="label">${ this.label ? `<label class="wc-form-label">${this.label} </label>`:'' }</slot>
        <div class="wc-form-wrapper">
          <div class="wc-form-checks" tabindex="0">
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
    this.formitem = shadow.querySelector('.wc-form-checks') 
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
    let itype = this.itype === 'radioboxes' ? 'radio' : 'checkbox'
    for (const [index, item] of options.entries()) {
      optsHtml += `
        <label class="wc-form-check" for="${this.name}_${index}">
          <input type="${itype}" name="${this.name}" value="${item.value || index}" id="${this.name}_${index}" ${this.isChecked(item, index)} />
          <span >${item.label || item}</span>
        </label>
       `
    }
    return optsHtml
  }

  isChecked(item, index){
    return (item.value || index) === this.inputvalue ? 'checked' : ''
  }

  emitValue(e) {
    this.formitem.value = e.target.value
    this.internals.states.add('--checked');
    this.internals.setFormValue('on', '--checked'); 
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

export class FormChecksBoxes extends FormChecks {
  emitValue(e) {
    let checks = [...this.inputs].filter(inpt => inpt.checked)
    let values = checks.map(inpt => inpt.value)
    this.formitem.value = values
    this.internals.setFormValue(values)
    this.formitem.dispatchEvent(new Event('change'));
  }
}

export class FormCheckBox {
  constructor({ el, shadow, internals }) {
    this.itype = el.getAttribute('type')
    this.name = el.getAttribute('name')
    this.help = el.getAttribute('help')
    this.label = el.getAttribute('label') 
    this.checked = el.getAttribute('checked') 
    this.defaultValue = el.getAttribute('value')
    this.isBoolean = !this.defaultValue
    this.error = ''
    this.internals = internals
    const template = document.createElement("template"); 

    template.innerHTML = ` 
      <div class="wc-form-outer">
        <slot name="before"></slot>
        <div class="wc-form-wrapper">
          <div class="wc-form-checks">
            <slot name="prefix"></slot> 
            <label class="wc-form-check" for="${this.name}">
              <input type="checkbox" id="${this.name}" name="${this.name}" value="${this.defaultValue || 0}" ${this.isChecked()} />
              <span >${this.label}</span>
            </label> 
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
    this.formitem = shadow.querySelector('input')  
    this.formitem.addEventListener('change', (e) => this.emitValue(e))
  }

  isChecked( ){
    return this.internals.states.has('--checked') ? 'checked' : ''
  }

  emitValue(e) {  
    if(e.target.checked) {
      this.internals.states.add('--checked');
      this.internals.setFormValue('on', '--checked');  
      this.formitem.checked = true 
      this.formitem.value = this.defaultValue || 'true' 
    } else {
      this.internals.states.delete('--checked');
      this.internals.setFormValue('off', '--checked'); 
      this.formitem.checked = false 
      this.formitem.value = this.defaultValue ? null : 'false' 
    }
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