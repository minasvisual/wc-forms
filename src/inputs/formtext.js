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
      <div class="wc-form-outer">
        <label class="wc-form-label">${this.label} </label>
        <div class="wc-form-wrapper">
          <textarea class="wc-form-textarea" ${renderAttributes(el, ['class', 'type'])} >${el.getAttribute('placeholder') ?? ''}</textarea>
          ${this.help ? `<small>${this.help}</small>` : ''}
          <small class="wc-errors hidden"></small>
        </div>
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
      this.erroritem.classList.toggle('hidden')
      return;
    }
    this.erroritem.innerHTML = error
    this.erroritem.classList.toggle('hidden')
  }
}
