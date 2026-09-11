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

  /** Digit stream typed by a person: the last two digits are the cents. */
  maskCurrency(value) {
    let digits = String(value ?? '').replace(/\D/g, '')
    if (!digits) return ''
    return digits.replace(/(\d)(\d{2})$/, '$1.$2')
  }

  /**
   * Amount set programmatically (the `value` attribute or `form-control[values]`).
   * It is already an amount, not a digit stream, so `199.9` must stay `199.90`
   * instead of being read as cents and becoming `19.99`.
   */
  formatAmount(value) {
    if (value === null || value === undefined || value === '') return ''
    let raw = String(value).trim()
    // Accept both `1234.56` and `1234,56`; thousand separators are dropped.
    raw = raw.includes(',') && !raw.includes('.') ? raw.replace(',', '.') : raw.replace(/,/g, '')
    const n = Number(raw.replace(/[^\d.-]/g, ''))
    return Number.isFinite(n) ? n.toFixed(2) : ''
  }

  parseNumber(masked) {
    if (masked === null || masked === undefined || masked === '') return null
    const cleaned = String(masked).replace(/[^\d.-]/g, '')
    if (!cleaned || cleaned === '-' || cleaned === '.') return null
    const n = Number(cleaned)
    return Number.isFinite(n) ? Number(n.toFixed(2)) : null
  }

  /** Writes the display value, syncs internals and emits the host `input` event. */
  commitValue(display) {
    this.formitem.value = display
    const n = this.parseNumber(display)
    this.internals.setFormValue(n === null ? null : n)
    this.el.emitEvent('input', n === null ? undefined : n)
    if (typeof this.el.validate === 'function') this.el.validate()
    return n
  }

  syncFromInput() {
    return this.commitValue(this.maskCurrency(this.formitem.value))
  }

  /** Public entry point for programmatic amounts; emits `change` like a committed edit. */
  setAmount(value) {
    const n = this.commitValue(this.formatAmount(value))
    this.el.emitEvent('change', n === null ? undefined : n)
    return n
  }

  onMounted() {
    const run = () => this.syncFromInput()
    this.formitem.addEventListener('focus', run)
    this.formitem.addEventListener('input', (e) => {
      // Avoid double host `input`: stop native InputEvent bubbling and re-emit from the host.
      e.stopPropagation()
      run()
    })
    this.formitem.addEventListener('blur', () => {
      const masked = this.maskCurrency(this.formitem.value)
      const n = this.parseNumber(masked)
      this.el.emitEvent('change', n === null ? undefined : n)
    })
    if (this.el.getAttribute('value')) {
      this.commitValue(this.formatAmount(this.el.getAttribute('value')))
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
