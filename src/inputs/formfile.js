import { renderAttributes, resolveLabel } from '../helpers.js'

const exclude = ['class', 'type', 'options', 'validations', 'label', 'help', 'mask', 'unmask', 'value', 'data-type']

export class FormFile {
  constructor({ el, shadow }) {
    this.help = el.getAttribute('help')
    this.label = resolveLabel(el)
    const template = document.createElement('template')

    template.innerHTML = `
      <div class="wc-form-outer" part="outer">
        <slot name="before"></slot>
        <slot name="label">${this.label ? `<label class="wc-form-label" part="label">${this.label}</label>` : ''}</slot>
        <div class="wc-form-wrapper" part="wrapper">
          <div class="wc-form-input-wrapper" part="input-wrapper">
            <slot name="prefix"></slot>
            <slot name="input">
              <input type="file" class="wc-form-input" part="input"
                ${renderAttributes(el, exclude)} />
            </slot>
            <slot name="suffix"></slot>
          </div>
          <slot name="help">${this.help ? `<small part="help">${this.help}</small>` : ''}</slot>
          <slot name="errors"><small class="wc-errors hidden" part="errors"></small></slot>
        </div>
        <slot name="after"></slot>
      </div>
    `

    shadow.appendChild(template.content.cloneNode(true))
    this.erroritem = shadow.querySelector('.wc-errors')
    this.formitem = shadow.querySelector('input')
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
