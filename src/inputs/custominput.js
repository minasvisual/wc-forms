
export class FormCurrency {
  constructor({ el, shadow, internals }) { 
    this.label = el.getAttribute('label')
    this.name = el.getAttribute('name')  

    shadow.innerHTML = ` 
      <div class="wc-form-outer"> 
        <label class="wc-form-label">${this.label} </label>
        <div class="wc-form-wrapper"> 
          <div class="wc-form-input-wrapper"> 
            R$ <input class="wc-form-input" type="text" name="${this.name}" />
          </div>  
        </div> 
      </div>
    `
  
    // REQUIRED
    this.formitem = shadow.querySelector('input'); 
  }
  
  setError(error) { // false or `string of errors separatelly of <br/>`
    console.log('Do anything with form error', error)
  }
}