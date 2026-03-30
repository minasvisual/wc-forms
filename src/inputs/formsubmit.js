import { renderAttributes, syncFormInputValidations } from '../helpers.js'

const exclude = ['class', 'type', 'options', 'validations', 'label', 'help', 'mask', 'unmask', 'value']

export class FormSubmit {
  constructor({ el, shadow, internals }) {
    this.el = el
    this.internals = internals
    this.label = el.getAttribute('label') || ''
    const template = document.createElement('template')

    template.innerHTML = `
      <div class="wc-form-outer" part="outer">
        <slot name="before"></slot>
        <div class="wc-form-wrapper" part="wrapper">
          <div class="wc-form-input-wrapper" part="input-wrapper">
            <slot name="prefix"></slot>
            <slot name="input">
              <button type="submit" class="wc-form-input wc-form-button" part="input"
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

  onMounted() {
    this.formitem.addEventListener('click', (e) => {
      const form = this.internals.form
      if (!form) return
      e.preventDefault()
      syncFormInputValidations(form)
      if (!form.checkValidity()) {
        form.reportValidity()
        return
      }
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit()
      } else {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      }
    })
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
