import { renderAttributes, normalizeJson, resolveLabel } from '../helpers.js'

export class FormSelect {
  constructor({ el, shadow, internals }) {
    this.name = el.getAttribute('name') 
    this.help = el.getAttribute('help')
    this.label = resolveLabel(el)
    this.options = el.getAttribute('options')
    this.error = ''
    const template = document.createElement("template");

    template.innerHTML = ` 
      <div class="wc-form-outer" part="outer">
        <slot name="before"></slot>
        <slot name="label">${this.label ? `<label class="wc-form-label" part="label">${this.label}</label>` : ''}</slot>
        <div class="wc-form-wrapper" part="wrapper">
          <div class="wc-form-input-wrapper" part="input-wrapper">
            <slot name="prefix"></slot>
            <slot name="input"> 
              <select class="wc-form-select" part="input" ${renderAttributes(el, ['class','options','type'])}>
                <slot/>
              </select>
            </slot> 
            <slot name="suffix"></slot>
          </div>
          <slot name="help">${this.help ? `<small part="help">${this.help}</small>` : ''}</slot>
          <slot name="errors"><small class="wc-errors hidden" part="errors"></small></slot>
        </div>
        <slot name="after"></slot>
      </div>
    `

    shadow.appendChild(template.content.cloneNode(true));
    this.erroritem = shadow.querySelector('.wc-errors');
    this.formitem = shadow.querySelector('select'); 

    // Move any native HTML options into the shadow select, since <slot> inside <select> is not supported by browsers
    const htmlOptions = el.querySelectorAll('option, optgroup');
    htmlOptions.forEach(opt => this.formitem.appendChild(opt));

    this.paramChanged()
  }

  isJson(data){
    try {
      return JSON.parse(normalizeJson(data))
    } catch (error) {
      return false
    }
  }

  paramChanged(){
    if(!this.options || !this.isJson(this.options)) return;
    let options = this.isJson(this.options)
    for (const [index, item] of options.entries()) {
        var opt = document.createElement('option');
        Object.assign(opt, {
          value: (item.value ?? index),
          text: (item.label ?? item)
        }) 
        this.formitem.appendChild(opt);
    }
  }

  setError(error) {
    if (!error) {
      this.erroritem.innerHTML = ''
      this.erroritem.classList.add('hidden')
      return;
    }
    this.erroritem.innerHTML = error
    this.erroritem.classList.remove('hidden')
  }
}
