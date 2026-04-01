import { renderAttributes, resolveLabel, resolvePlaceholder } from '../helpers.js'

function parseValues(value) {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean)
  if (typeof value !== 'string') return []

  const normalized = value.trim()
  if (!normalized) return []

  try {
    const parsed = JSON.parse(normalized)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item)).filter(Boolean)
    }
  } catch (error) {
  }

  return normalized
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export class FormPills {
  constructor({ el, shadow, internals }) {
    this.el = el
    this.internals = internals
    this.name = el.getAttribute('name')
    this.help = el.getAttribute('help')
    this.label = resolveLabel(el)
    this.error = ''
    this.values = parseValues(el.value || el.getAttribute('value') || '')

    const template = document.createElement('template')
    template.innerHTML = `
      <style>
        .wc-form-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          width: 100%;
        }

        .wc-form-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.08);
          color: inherit;
          line-height: 1.2;
        }

        .wc-form-pill button {
          border: 0;
          background: transparent;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          font-size: 16px;
          color: inherit;
        }

        .wc-form-pill-input {
          min-width: 140px;
          flex: 1 1 140px;
          border: 0;
          outline: none;
          background: transparent;
          font: inherit;
          color: inherit;
        }
      </style>
      <div class="wc-form-outer" part="outer">
        <slot name="before"></slot>
        <slot name="label">${this.label ? `<label class="wc-form-label" part="label">${this.label}</label>` : ''}</slot>
        <div class="wc-form-wrapper" part="wrapper">
          <div class="wc-form-input-wrapper" part="input-wrapper">
            <slot name="prefix"></slot>
            <slot name="input">
              <div class="wc-form-input wc-form-pills" part="input"></div>
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
    this.formitem = shadow.querySelector('.wc-form-pills')
    this.inputItem = document.createElement('input')
    this.inputItem.className = 'wc-form-pill-input'
    this.inputItem.type = 'text'
    // Keep internal input unnamed so FormData comes from ElementInternals only.
    this.inputItem.name = ''
    this.inputItem.placeholder = resolvePlaceholder(el, this.label)

    const passthrough = renderAttributes(el, ['class', 'name', 'type', 'placeholder', 'value'])
    if (passthrough) {
      this.inputItem.setAttribute('data-host-attrs', 'true')
      const wrapper = document.createElement('div')
      wrapper.innerHTML = `<input ${passthrough} />`
      const mirrored = wrapper.querySelector('input')
      for (const attr of mirrored.attributes) {
        if (attr.name === 'data-host-attrs') continue
        this.inputItem.setAttribute(attr.name, attr.value)
      }
      this.inputItem.type = 'text'
      this.inputItem.name = ''
      this.inputItem.placeholder = resolvePlaceholder(el, this.label)
      this.inputItem.className = 'wc-form-pill-input'
    }

    Object.defineProperty(this.formitem, 'value', {
      get: () => this.values,
      set: (nextValue) => {
        this.values = parseValues(nextValue)
        this.render()
      },
      configurable: true,
    })

    this.inputItem.addEventListener('keydown', (event) => this.handleKeyDown(event))
    this.inputItem.addEventListener('input', (event) => {
      // Keep native text typing local to pills input; host output is tag-array only.
      event.stopPropagation()
    })
    this.inputItem.addEventListener('change', (event) => {
      // Prevent raw text value from replacing current tags in the host change pipeline.
      event.stopPropagation()
    })
    this.inputItem.addEventListener('paste', (event) => this.handlePaste(event))
    this.inputItem.addEventListener('blur', () => this.commitInput())
    this.formitem.addEventListener('click', (event) => this.handleClick(event))

    this.render()
  }

  handleKeyDown(event) {
    if (event.key === ',' || event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      this.commitInput('change')
      return
    }

    if (event.key === 'Backspace' && !this.inputItem.value && this.values.length) {
      event.preventDefault()
      this.removePill(this.values.length - 1)
    }
  }

  handleClick(event) {
    const button = event.target.closest('button[data-index]')
    if (button) {
      event.preventDefault()
      this.removePill(Number(button.getAttribute('data-index')))
      this.inputItem.focus()
      return
    }

    this.inputItem.focus()
  }

  handlePaste(event) {
    const pasted = event.clipboardData?.getData?.('text') || ''
    if (!pasted) return
    event.preventDefault()
    this.addTokensFromText(pasted, { emit: true })
  }

  addTokensFromText(text, { emit = false } = {}) {
    const tokens = String(text)
      .split(/[\n,]/g)
      .map((item) => item.trim())
      .filter(Boolean)

    if (!tokens.length) return false

    let changed = false
    for (const token of tokens) {
      if (!this.values.includes(token)) {
        this.values = [...this.values, token]
        changed = true
      }
    }

    if (changed) {
      this.render()
      if (emit) this.emitCurrentValue('change')
    }
    this.inputItem.value = ''
    return changed
  }

  commitInput() {
    const nextValue = this.inputItem.value.trim().replace(/,$/, '')
    if (!nextValue) return
    this.addTokensFromText(nextValue, { emit: true })
    this.inputItem.focus()
  }

  removePill(index) {
    if (Number.isNaN(index) || index < 0 || index >= this.values.length) return
    this.values = this.values.filter((item, itemIndex) => itemIndex !== index)
    this.render()
    this.emitCurrentValue('change')
  }

  emitCurrentValue(type) {
    this.formitem.value = [...this.values]
    this.formitem.dispatchEvent(new Event('input', { bubbles: true }))
    this.formitem.dispatchEvent(new Event(type, { bubbles: true }))
  }

  render() {
    this.formitem.innerHTML = ''

    this.values.forEach((value, index) => {
      const pill = document.createElement('span')
      pill.className = 'wc-form-pill'
      pill.setAttribute('part', 'pill')
      pill.innerHTML = `
        <span part="pill-label">${value}</span>
        <button type="button" data-index="${index}" aria-label="Remove ${value}" part="pill-remove">&times;</button>
      `
      this.formitem.appendChild(pill)
    })

    this.formitem.appendChild(this.inputItem)
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
