import { renderAttributes, resolveLabel, resolvePlaceholder } from '../helpers.js'

const exclude = ['class', 'type', 'options', 'validations', 'label', 'help', 'mask', 'unmask', 'value']

export class FormCurrency {
  constructor({ el, shadow, internals }) {
    this.el = el
    this.internals = internals
    this.name = el.getAttribute('name')
    this.help = el.getAttribute('help')
    this.label = resolveLabel(el)
    this.error = ''
    const template = document.createElement('template')

    template.innerHTML = `
      <div class="wc-form-outer" part="outer">
        <slot name="before"></slot>
        <slot name="label">${this.label ? `<label class="wc-form-label" part="label">${this.label}</label>` : ''}</slot>
        <div class="wc-form-wrapper" part="wrapper">
          <div class="wc-form-input-wrapper" part="input-wrapper">
            <slot name="prefix"><span class="wc-form-currency-prefix" part="prefix" aria-hidden="true">R$&nbsp;</span></slot>
            <slot name="input">
              <input class="wc-form-input" part="input" type="text" inputmode="decimal" autocomplete="off"
                placeholder="${resolvePlaceholder(el, this.label || '0.00')}" ${renderAttributes(el, exclude.concat(['placeholder']))} />
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

  maskCurrency(value) {
    let digits = String(value ?? '').replace(/\D/g, '')
    if (!digits) return ''
    return digits.replace(/(\d)(\d{2})$/, '$1.$2')
  }

  parseNumber(masked) {
    const n = Number(String(masked).replace(/[^\d.]/g, ''))
    return Number.isFinite(n) ? Number(n.toFixed(2)) : null
  }

  syncFromInput() {
    const masked = this.maskCurrency(this.formitem.value)
    this.formitem.value = masked
    const n = this.parseNumber(masked)
    this.internals.setFormValue(n === null ? null : n)
    this.el.emitEvent('input', n === null ? undefined : n)
    if (typeof this.el.validate === 'function') this.el.validate()
  }

  onMounted() {
    const run = () => this.syncFromInput()
    this.formitem.addEventListener('focus', run)
    this.formitem.addEventListener('input', run)
    this.formitem.addEventListener('blur', () => {
      const masked = this.maskCurrency(this.formitem.value)
      const n = this.parseNumber(masked)
      this.el.emitEvent('change', n === null ? undefined : n)
    })
    if (this.el.getAttribute('value')) {
      this.formitem.value = this.maskCurrency(this.el.getAttribute('value'))
      this.syncFromInput()
    }
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
