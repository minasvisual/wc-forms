import { renderAttributes, resolveLabel } from '../helpers.js'

const exclude = ['class', 'type', 'options', 'validations', 'label', 'help', 'mask', 'unmask']

function rangeBounds(input) {
  const min = input.min !== '' && input.min != null ? Number(input.min) : 0
  const max = input.max !== '' && input.max != null ? Number(input.max) : 100
  return {
    min: Number.isFinite(min) ? min : 0,
    max: Number.isFinite(max) ? max : 100,
  }
}

export class FormRange {
  constructor({ el, shadow }) {
    this.el = el
    this.help = el.getAttribute('help')
    this.label = resolveLabel(el)
    const minAttr = el.getAttribute('min')
    const maxAttr = el.getAttribute('max')
    this.minLabel = minAttr != null && minAttr !== '' ? minAttr : '0'
    this.maxLabel = maxAttr != null && maxAttr !== '' ? maxAttr : '100'
    const template = document.createElement('template')

    template.innerHTML = `
      <div class="wc-form-outer" part="outer">
        <slot name="before"></slot>
        <slot name="label">${this.label ? `<label class="wc-form-label" part="label">${this.label}</label>` : ''}</slot>
        <div class="wc-form-wrapper" part="wrapper">
          <div class="wc-form-input-wrapper wc-form-range-wrap" part="input-wrapper">
            <slot name="prefix"><span class="wc-form-range-bound wc-form-range-bound-min" part="range-min">${this.minLabel}</span></slot>
            <div class="wc-form-range-control" part="range-control">
              <div class="wc-form-range-track-shell" part="range-track">
                <span class="wc-form-range-popup" part="range-value-popup" role="status" aria-live="polite"></span>
                <slot name="input">
                  <input type="range" class="wc-form-input wc-form-range-input" part="input"
                    ${renderAttributes(el, exclude)} />
                </slot>
              </div>
            </div>
            <slot name="suffix"><span class="wc-form-range-bound wc-form-range-bound-max" part="range-max">${this.maxLabel}</span></slot>
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
    this.popup = shadow.querySelector('.wc-form-range-popup')
  }

  updatePopup() {
    const input = this.formitem
    const { min, max } = rangeBounds(input)
    let val = Number(input.value)
    if (!Number.isFinite(val)) val = min
    const span = max - min
    const pct = span === 0 ? 0 : ((val - min) / span) * 100
    this.popup.textContent = String(val)
    this.popup.style.left = `${pct}%`
    input.setAttribute('aria-valuetext', String(val))
  }

  onMounted() {
    const onInput = () => this.updatePopup()
    this.formitem.addEventListener('input', onInput)
    this.formitem.addEventListener('change', onInput)
    this.updatePopup()
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
