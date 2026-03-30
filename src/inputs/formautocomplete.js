import { renderAttributes, resolveLabel, resolvePlaceholder } from '../helpers.js';
import { normalizeJson } from '../helpers.js';

export class FormAutocomplete {
  constructor({ el, shadow, internals }) {
    this.el = el;
    this.internals = internals;
    this.name = el.getAttribute('name');
    this.itype = el.getAttribute('type') || 'text';
    this.help = el.getAttribute('help');
    this.label = resolveLabel(el);
    this._options = this.parseOptions(el);
    this.inputvalue = el.value || el.getAttribute('value') || '';
    this.error = '';
    this.filteredOptions = [];
    this.highlighted = -1;
    this._isSelecting = false;
    this._isTyping = false;

    const template = document.createElement('template');
    template.innerHTML = `
      <div class="wc-form-outer" part="outer">
        <slot name="before"></slot>
        <slot name="label">${this.label ? `<label class="wc-form-label" part="label">${this.label}</label>` : ''}</slot>
        <div class="wc-form-wrapper" part="wrapper">
          <div class="wc-form-input-wrapper" part="input-wrapper">
            <slot name="prefix"></slot>
            <slot name="input">
              <div class="wc-form-autocomplete-container" style="position:relative; width:100%;">
                <input class="wc-form-input" part="input" autocomplete="off"
                  placeholder="${resolvePlaceholder(el, this.label)}"
                  ${renderAttributes(el, ['class', 'name', 'type','placeholder'])} />
                <div class="wc-form-autocomplete-display" part="display-label" 
                  style="position:absolute; left:0; top:0; bottom:0; pointer-events:none; display:flex; align-items:center; padding-left:8px; color:#1e293b;"></div>
              </div>
              <ul class="wc-form-autocomplete-list" part="autocomplete-list" style="display:none;"></ul>
            </slot>
            <slot name="suffix"></slot>
          </div>
          <slot name="help">${this.help ? `<small part="help">${this.help}</small>` : ''}</slot>
          <slot name="errors"><small class="wc-errors hidden" part="errors"></small></slot>
        </div>
        <slot name="after"></slot>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
.wc-form-input-wrapper { position: relative; }
.wc-form-autocomplete-list {
  position: absolute;
  left: 0; right: 0; top: 100%;
  margin-top: 2px; z-index: 99;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 8px 0 #a0aec040;
  list-style: none;
  padding: 0;
  max-height: 184px;
  overflow-y: auto;
}
.wc-form-autocomplete-item {
  padding: 8px 14px;
  cursor: pointer;
}
.wc-form-autocomplete-item.highlighted,
.wc-form-autocomplete-item:hover {
  background: #3b82f620;
  color: #2563eb;
}
`;
    shadow.appendChild(style);
    shadow.appendChild(template.content.cloneNode(true));
    this.erroritem = shadow.querySelector('.wc-errors');
    this.formitem = shadow.querySelector('.wc-form-input-wrapper');
    this.inputItem = shadow.querySelector('input');
    this.displayItem = shadow.querySelector('.wc-form-autocomplete-display');
    this._list = shadow.querySelector('.wc-form-autocomplete-list');

    // Proxy value property for FormComponent to work correctly
    Object.defineProperty(this.formitem, 'value', {
      get: () => this._realValue,
      set: (v) => {
        this._realValue = v;
        this.inputItem.value = v;
        this.updateDisplay();
      },
      configurable: true
    });

    this.formitem.value = this.inputvalue;
    this.inputItem.addEventListener('input', (e) => {
      e.stopPropagation();
      this.onInput(e);
    });
    this.inputItem.addEventListener('keydown', this.onKeyDown.bind(this));
    this.inputItem.addEventListener('click', this.onInputClick.bind(this));
    this.inputItem.addEventListener('change', (e) => e.stopPropagation()); // Prevent label from reaching FormComponent
    this._list.addEventListener('mousedown', this.onListClick.bind(this));
    // close list if click outside
    shadow.addEventListener('focusin', (evt) => {
      this._isTyping = true;
      this.updateDisplay();
    });

    shadow.addEventListener('focusout', (evt) => {
      setTimeout(() => {
        this._isTyping = false;
        this.hideSuggestions();
        this.updateDisplay();
      }, 120);
    });
  }

  onInputClick(e) {
    // Ao clicar no campo, se ja tiver algo selecionado, limpa para permitir nova seleção
    if (this._realValue !== '') {
      this.inputItem.value = '';
      this._realValue = '';
      this.internals.setFormValue(null);
      this.updateDisplay();
      this.onInput(e);
    }
  }

  parseOptions(el) {
    let options = [];

    // 1. Native <option> tags
    const htmlOptions = el.querySelectorAll('option');
    htmlOptions.forEach(opt => {
      options.push({
        label: opt.textContent.trim(),
        value: opt.getAttribute('value') ?? opt.textContent.trim()
      });
    });

    // 2. JS property .options
    if (el.options && Array.isArray(el.options)) {
      const propOptions = el.options.map(item => {
        if (typeof item === 'object') return { label: item.label ?? item.value, value: item.value ?? item.label };
        return { label: String(item), value: String(item) };
      });
      options = options.concat(propOptions);
    }

    // 3. Attribute 'options' (JSON or CSV)
    const optAttr = el.getAttribute('options');
    if (optAttr) {
      try {
        const arr = JSON.parse(normalizeJson(optAttr));
        if (Array.isArray(arr)) {
          const attrOptions = arr.map(item => {
            if (typeof item === 'object') return { label: item.label ?? item.value, value: item.value ?? item.label };
            return { label: String(item), value: String(item) };
          });
          options = options.concat(attrOptions);
        }
      } catch (e) {
        const csvOptions = optAttr.split(',').map(x => ({ label: x.trim(), value: x.trim() }));
        if (csvOptions.length > 0 && csvOptions[0].label !== '')
          options = options.concat(csvOptions);
      }
    }

    return options;
  }

  onInput(e) {
    if (this._isSelecting) return;
    const val = this.inputItem.value;
    this._realValue = val; 
    this.updateDisplay();
    this.filteredOptions = this._options.filter(opt =>
      (typeof opt === 'string' ? opt : opt.label || String(opt.value)).toLowerCase().includes(val.toLowerCase())
    );
    this.highlighted = -1;
    this.renderSuggestions();
    // Custom event para parent
    this.inputItem.closest('form-input')?.emitEvent?.('input', val);
  }

  renderSuggestions() {
    const hasOptions = this.filteredOptions.length > 0 && this.inputItem.value !== '';
    if (!hasOptions) { this.hideSuggestions(); return; }
    this._list.innerHTML = '';
    this.filteredOptions.forEach((opt, idx) => {
      let label = typeof opt === 'string' ? opt : (opt.label ?? opt.value);
      let value = typeof opt === 'object' && opt.value !== undefined ? opt.value : label;
      const li = document.createElement('li');
      li.textContent = label;
      li.dataset.index = idx;
      li.className = 'wc-form-autocomplete-item' + (this.highlighted === idx ? ' highlighted' : '');
      li.setAttribute('part', 'autocomplete-item');
      this._list.appendChild(li);
    });
    this._list.style.display = '';
  }

  hideSuggestions() {
    this._list.style.display = 'none';
  }

  onListClick(e) {
    const li = e.target.closest('li');
    if (!li) return;
    const idx = li.dataset.index;
    const opt = this.filteredOptions[idx];
    const val = typeof opt === 'object' && opt.value !== undefined ? opt.value : (opt.label ?? opt);
    this.selectValue(val, (opt.label ?? val));
  }

  onKeyDown(e) {
    if (this._list.style.display === 'none') return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.highlighted = Math.min(this.filteredOptions.length - 1, this.highlighted + 1);
      this.renderSuggestions();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.highlighted = Math.max(0, this.highlighted - 1);
      this.renderSuggestions();
    }
    if (e.key === 'Enter') {
      if (this.highlighted >= 0) {
        e.preventDefault();
        const opt = this.filteredOptions[this.highlighted];
        const val = typeof opt === 'object' && opt.value !== undefined ? opt.value : (opt.label ?? opt);
        this.selectValue(val, (opt.label ?? val));
      }
    }
    if (e.key === 'Escape') {
      this.hideSuggestions();
    }
  }

  selectValue(val, label) {
    this._isSelecting = true;
    this._realValue = val;
    this.inputItem.value = val;
    this.updateDisplay(label);
    this.hideSuggestions();
    
    // Update internal form value
    this.internals.setFormValue(val);
    
    // Dispatch events from formitem (the wrapper) so FormComponent catches them
    this.formitem.dispatchEvent(new Event('input', { bubbles: true }));
    this.formitem.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Emit for webcomponent
    this.inputItem.closest('form-input')?.emitEvent?.('change', val);
    
    setTimeout(() => { this._isSelecting = false; }, 0);
  }

  updateDisplay(label) {
    const isSelected = this._realValue !== '' && String(this._realValue) === String(this.inputItem.value);
    if (isSelected) {
      this.displayItem.textContent = label || this.resolveLabel(this._realValue);
      this.displayItem.style.display = 'flex';
      this.inputItem.style.color = 'transparent';
    } else {
      this.displayItem.style.display = 'none';
      this.inputItem.style.color = '';
    }
  }

  resolveLabel(val) {
    if (!val) return '';
    const opt = this._options.find(o => String(o.value) === String(val) || String(o.label) === String(val));
    return opt ? (opt.label ?? opt.value) : val;
  }

  setError(error) {
    if (!error) {
      this.erroritem.innerHTML = '';
      this.erroritem.classList.add('hidden');
      return;
    }
    this.erroritem.innerHTML = error;
    this.erroritem.classList.remove('hidden');
  }
}
