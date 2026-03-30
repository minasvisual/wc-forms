import { renderAttributes, resolveLabel, resolvePlaceholder } from '../helpers.js'

export class FormText {
  constructor({ el, shadow, internals }) {
    this.name = el.getAttribute('name')
    this.itype = el.getAttribute('type')
    this.help = el.getAttribute('help')
    this.label = resolveLabel(el)
    this.inputvalue = el.value || ''
    this.error = ''
    const template = document.createElement("template");
    
    template.innerHTML = ` 
      <div class="wc-form-outer" part="outer">
        <slot name="before"></slot>
        <slot name="label">${this.label ? `<label class="wc-form-label" part="label">${this.label}</label>` : ''}</slot>
        <div class="wc-form-wrapper" part="wrapper"> 
          <div class="wc-form-input-wrapper" part="input-wrapper">
            <slot name="prefix"></slot>
            <slot name="input"><input class="wc-form-input" part="input" placeholder="${resolvePlaceholder(el, this.label)}" ${renderAttributes(el, ['class','placeholder'])} /></slot>
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
    this.formitem = shadow.querySelector('input');
    this.formitem.addEventListener('input', () => {
      el.emitEvent('input', this.formitem.value)
    });
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
