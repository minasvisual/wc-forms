import { renderAttributes } from '../helpers.js'

export class FormTextarea {
  constructor({ el, shadow, internals }) {
    this.name = el.getAttribute('name')
    this.itype = el.getAttribute('type')
    this.help = el.getAttribute('help')
    this.label = el.getAttribute('label')
    this.error = ''
    const template = document.createElement("template");

    template.innerHTML = ` 
      <div class="wc-form-outer" part="outer">
        <slot name="before"></slot>
        <slot name="label"><label class="wc-form-label" part="label">${this.label} </label></slot>
        <div class="wc-form-wrapper" part="wrapper">
          <div class="wc-form-input-wrapper" part="input-wrapper">
            <slot name="prefix"></slot>
            <slot name="input">
              <textarea class="wc-form-textarea" part="input" ${renderAttributes(el, ['class', 'type'])} >${el.getAttribute('placeholder') ?? ''}</textarea>
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
    this.formitem = shadow.querySelector('textarea');
    this.formitem.addEventListener('input', (e) => {
      el.emitEvent('typing', this.formitem.value)
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