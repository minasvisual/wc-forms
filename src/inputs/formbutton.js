import { renderAttributes } from '../helpers.js'

const exclude = ['class', 'type', 'options', 'validations', 'label', 'help', 'mask', 'unmask', 'value']

export class FormButton {
  constructor({ el, shadow }) {
    this.el = el
    this.label = el.getAttribute('label') || ''
    this.name = el.getAttribute('name') || ''
    const template = document.createElement('template')

    template.innerHTML = `
      <div class="wc-form-outer" part="outer">
        <slot name="before"></slot>
        <div class="wc-form-wrapper" part="wrapper">
          <div class="wc-form-input-wrapper" part="input-wrapper">
            <slot name="prefix"></slot>
            <slot name="input">
              <button type="button" class="wc-form-input wc-form-button" part="input"
                ${renderAttributes(el, exclude)}>${this.label}</button>
            </slot>
            <slot name="suffix"></slot>
          </div>
          <slot name="errors"><small class="wc-errors hidden" part="errors"></small></slot>
        </div>
        <slot name="after"></slot>
      </div>
    `

    shadow.appendChild(template.content.cloneNode(true))
    this.erroritem = shadow.querySelector('.wc-errors')
    this.formitem = shadow.querySelector('button')
  }

  setError(error) {
    if (!error) {
      this.erroritem.innerHTML = ''
      this.erroritem.classList.add('hidden')
      return
    }
    this.erroritem.innerHTML = error
    this.erroritem.classList.remove('hidden')
  }
}
