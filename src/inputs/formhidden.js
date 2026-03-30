import { renderAttributes } from '../helpers.js'

const exclude = ['class', 'type', 'options', 'validations', 'label', 'help', 'mask', 'unmask', 'value']

export class FormHidden {
  constructor({ el, shadow }) {
    const template = document.createElement('template')

    template.innerHTML = `
      <div class="wc-form-outer wc-form-hidden" part="outer">
        <input type="hidden" class="wc-form-input" part="input"
          ${renderAttributes(el, exclude)} />
        <small class="wc-errors hidden" part="errors" aria-hidden="true"></small>
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
