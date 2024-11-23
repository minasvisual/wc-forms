
export class FormCurrency {
  constructor({ el, shadow, internals }) { 
    this.label = el.getAttribute('label')
    this.name = el.getAttribute('name') 
    this.internals = internals

    shadow.innerHTML = ` 
      <div class="wc-form-outer"> 
        <label class="wc-form-label">${this.label} </label>
        <div class="wc-form-wrapper"> 
          <div class="wc-form-input-wrapper"> 
            R$ <input class="wc-form-input" type="text" name="${this.name}" placeholder="0.00" />
          </div>  
        </div> 
      </div>
    `
  
    // REQUIRED
    this.formitem = shadow.querySelector('input');
    this.formitem.type = 'number' 
    this.formitem.addEventListener('focus', e => this.setMask(e))
    this.formitem.addEventListener('input', e => this.setMask(e))
  }

  setMask(e) { 
    this.formitem.value = this.maskCurrency(e.target?.value ?? '0')
    this.internals.setFormValue(
      +Number(this.formitem.value).toFixed(2)
    )
  }
  
  setError(error) { // false or `string of errors separatelly of <br/>`
    console.log('[Custom input] Do anything with form error', error)
  }

  maskCurrency(value) {
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d)(\d{2})$/, "$1.$2"); 
    return value;
  }
}