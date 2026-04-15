function parseValue(value) {
  if (Array.isArray(value)) return value
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function cloneItems(items) {
  return items.map((item) => ({ ...(item || {}) }))
}

function fieldNamesFromTemplate(nodes) {
  const names = new Set()

  nodes.forEach((node) => {
    if (node.localName === 'form-input' && node.getAttribute('name')) {
      names.add(node.getAttribute('name'))
    }

    node.querySelectorAll?.('form-input[name]')?.forEach((field) => {
      names.add(field.getAttribute('name'))
    })
  })

  return Array.from(names)
}

const SVG_NS = 'http://www.w3.org/2000/svg'

function repeaterSvgRoot() {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('width', '12')
  svg.setAttribute('height', '12')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  svg.style.display = 'block'
  return svg
}

function repeaterSvgPath(d) {
  const p = document.createElementNS(SVG_NS, 'path')
  p.setAttribute('d', d)
  p.setAttribute('fill', 'none')
  p.setAttribute('stroke', 'currentColor')
  p.setAttribute('stroke-width', '2')
  p.setAttribute('stroke-linecap', 'round')
  p.setAttribute('stroke-linejoin', 'round')
  return p
}

function repeaterIconChevronUp() {
  const svg = repeaterSvgRoot()
  svg.appendChild(repeaterSvgPath('M5 15l7-7 7 7'))
  return svg
}

function repeaterIconChevronDown() {
  const svg = repeaterSvgRoot()
  svg.appendChild(repeaterSvgPath('M19 9l-7 7-7-7'))
  return svg
}

/** Trash can outline (stroke). */
function repeaterIconTrash() {
  const svg = repeaterSvgRoot()
  svg.appendChild(
    repeaterSvgPath(
      'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6m4-6v6'
    )
  )
  return svg
}

function styleRepeaterActionButton(btn) {
  Object.assign(btn.style, {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.3rem',
    margin: '0',
    lineHeight: '0',
    border: '1px solid color-mix(in srgb, currentColor 22%, transparent)',
    borderRadius: '6px',
    background: 'transparent',
    cursor: 'pointer',
    color: 'inherit',
    verticalAlign: 'middle',
  })
}

function createRepeaterRowActionButton(action, ariaLabel, iconNode) {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.dataset.action = action
  btn.setAttribute('aria-label', ariaLabel)
  btn.className = 'wc-form-repeater-action-btn'
  styleRepeaterActionButton(btn)
  btn.appendChild(iconNode)
  return btn
}

export class FormRepeater {
  constructor({ el, shadow, internals }) {
    this.el = el
    this.internals = internals
    this.name = el.getAttribute('name')
    this.label = el.getAttribute('label') || ''
    this.addLabel = el.getAttribute('add-label') || 'Add'
    this.emptyLabel = el.getAttribute('empty-label') || 'No items'
    this.moveUpLabel = el.getAttribute('move-up-label') || 'Move up'
    this.removeRowLabel = el.getAttribute('remove-row-label') || 'Remove row'
    this.moveDownLabel = el.getAttribute('move-down-label') || 'Move down'
    this.values = cloneItems(parseValue(el.getAttribute('value') || el.value))
    this.templateNodes = Array.from(el.children).map((child) => child.cloneNode(true))
    this.fieldNames = fieldNamesFromTemplate(this.templateNodes)
    this.generatedNames = new Set()

    const template = document.createElement('template')
    template.innerHTML = `
      <div class="wc-form-repeater" part="outer">
        <slot name="repeater-ui"></slot>
        <input type="hidden" />
        <small class="wc-errors hidden" part="errors"></small>
      </div>
    `

    shadow.appendChild(template.content.cloneNode(true))
    this.formitem = shadow.querySelector('.wc-form-repeater')
    this.inputItem = shadow.querySelector('input')
    this.erroritem = shadow.querySelector('.wc-errors')
    this.inputItem.name = this.name

    Object.defineProperty(this.formitem, 'value', {
      get: () => cloneItems(this.values),
      set: (nextValue) => {
        this.values = cloneItems(parseValue(nextValue))
        this.inputItem.value = JSON.stringify(this.values)
        this.render()
      },
      configurable: true,
    })

    this.ui = document.createElement('div')
    this.ui.slot = 'repeater-ui'
    this.ui.className = el.getAttribute('items-class') || 'flex flex-col gap-3'

    el.replaceChildren(this.ui)

    this.inputItem.value = JSON.stringify(this.values)
    this.internals.setFormValue(this.inputItem.value)
    this.render()

    this.attachFormListeners()
  }

  attachFormListeners(retries = 10) {
    queueMicrotask(() => {
      this.commit()

      const form = this.el.internals?.form || this.internals?.form || this.el.closest('form')

      if (!form) {
        if (retries > 0) {
          setTimeout(() => this.attachFormListeners(retries - 1), 0)
        }
        return
      }

      if (this.form === form) return
      this.form = form

      form.addEventListener('submit', () => {
        this.commit()
      }, true)

      form.addEventListener('submited', (event) => {
        if (!event.detail || !this.name) return

        for (const name of this.generatedNames) {
          delete event.detail[name]
        }

        const rawValue = event.detail[this.name]
        const parsedValue = Array.isArray(rawValue) ? rawValue : parseValue(rawValue)
        event.detail[this.name] = parsedValue.length ? parsedValue : cloneItems(this.values)
      }, true)
    })
  }

  addItem(index = this.values.length) {
    const emptyItem = this.fieldNames.reduce((item, fieldName) => {
      item[fieldName] = ''
      return item
    }, {})
    this.values.splice(index, 0, emptyItem)
    this.commit()
    this.render()
  }

  removeItem(index) {
    this.values.splice(index, 1)
    this.commit()
    this.render()
  }

  moveItem(index, offset) {
    const nextIndex = index + offset
    if (nextIndex < 0 || nextIndex >= this.values.length) return
    const [item] = this.values.splice(index, 1)
    this.values.splice(nextIndex, 0, item)
    this.commit()
    this.render()
  }

  updateField(index, fieldName, value) {
    this.values[index] = {
      ...(this.values[index] || {}),
      [fieldName]: value
    }
    this.commit()
  }

  commit() {
    this.inputItem.value = JSON.stringify(this.values)
    this.internals.setFormValue(this.inputItem.value)
    this.el.emitEvent('input', cloneItems(this.values))
    this.el.emitEvent('change', cloneItems(this.values))
  }

  buildItemTemplate(item, index) {
    const fragment = document.createDocumentFragment()
    const clones = this.templateNodes.map((node) => node.cloneNode(true))

    clones.forEach((node) => {
      const fields = []
      if (node.localName === 'form-input') fields.push(node)
      fields.push(...Array.from(node.querySelectorAll?.('form-input[name]') || []))

      fields.forEach((input) => {
        const fieldName = input.getAttribute('name')
        const generatedName = `__${this.name}_${index}_${fieldName}`
        this.generatedNames.add(generatedName)

        input.setAttribute('data-repeater-field', fieldName)
        input.setAttribute('name', generatedName)
        input.setAttribute('value', item?.[fieldName] ?? '')
        input.addEventListener('input', (event) => {
          event.stopPropagation()
          this.updateField(index, fieldName, event.detail)
        })
        input.addEventListener('change', (event) => {
          event.stopPropagation()
          this.updateField(index, fieldName, event.detail)
        })
      })

      fragment.appendChild(node)
    })

    return fragment
  }

  render() {
    this.ui.replaceChildren()
    this.generatedNames = new Set()

    if (this.label) {
      const label = document.createElement('p')
      label.textContent = this.label
      label.className = this.el.getAttribute('label-class') || ''
      this.ui.appendChild(label)
    }

    if (!this.values.length) {
      const empty = document.createElement('p')
      empty.textContent = this.emptyLabel
      const extraEmptyClass = this.el.getAttribute('empty-class') || ''
      empty.className = ['wc-form-repeater-empty', extraEmptyClass].filter(Boolean).join(' ')
      this.ui.appendChild(empty)
    }

    this.values.forEach((item, index) => {
      const row = document.createElement('div')
      row.className = this.el.getAttribute('item-class') || 'flex flex-col gap-3'
      row.dataset.repeaterIndex = String(index)

      row.appendChild(this.buildItemTemplate(item, index))

      const controls = document.createElement('div')
      controls.className = this.el.getAttribute('controls-class') || 'flex gap-2'

      const btnUp = createRepeaterRowActionButton('up', this.moveUpLabel, repeaterIconChevronUp())
      const btnRemove = createRepeaterRowActionButton('remove', this.removeRowLabel, repeaterIconTrash())
      const btnDown = createRepeaterRowActionButton('down', this.moveDownLabel, repeaterIconChevronDown())
      controls.append(btnUp, btnRemove, btnDown)

      btnUp.disabled = index === 0
      btnDown.disabled = index === this.values.length - 1
      const syncDisabledStyle = (b) => {
        b.style.opacity = b.disabled ? '0.38' : ''
        b.style.cursor = b.disabled ? 'not-allowed' : 'pointer'
      }
      syncDisabledStyle(btnUp)
      syncDisabledStyle(btnDown)
      btnUp.addEventListener('click', () => this.moveItem(index, -1))
      btnRemove.addEventListener('click', () => this.removeItem(index))
      btnDown.addEventListener('click', () => this.moveItem(index, 1))

      row.appendChild(controls)
      this.ui.appendChild(row)
    })

    const addButton = document.createElement('button')
    addButton.type = 'button'
    addButton.textContent = this.addLabel
    addButton.className = this.el.getAttribute('add-class') || ''
    addButton.addEventListener('click', () => this.addItem())
    this.ui.appendChild(addButton)
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