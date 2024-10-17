# Web Components Forms

Is a modular, 100% vanilla js, form inputs group, based on [Vue FormKit](https://formkit.com/getting-started/what-is-formkit) library.

## Features
- Form group inputs
- Modular validation attribute
- Slot space customization (soon)
- Works on any framework

## Roadmap
- [x] Basic inputs map
- [x] Basic validation map
- [X] Slot customization
- [X] Custom validations
- [X] Custom input types
- [ ] Unit tests
- [ ] Extensible style
- [ ] Internacionalization
- [ ] NPM Package installation
- [ ] Mask native
- [ ] Plugins

## Installation
 - This is not a npm package yet, so clone this repository in your project and import `/src/index.js` to your html header;

Usage
```
<form ...>
  <form-input 
    name="fullname" 
    type="text" 
    label="Name" 
    help="Should be your fullname"
    validations="required|minlen:5|maxlen:128" 
  >  
  </form-input>
```

## Inputs type available  
- text 
- email            
- url
- search
- number 
- color
- password
- date
- datetime-local
- select
- radio
- checkbox
- textarea 


## Validations available  
- required 
- email            
- minlen:<number>
- maxlen:<number>
- confirm:<other-field-name-above>
- isdate
- isafter:<yyyy-mm-dd>
- isbefore:<yyyy-mm-dd>
- isnumber
- max:<number>
- min:<number>
- in:<values-comma-separatelly> 
- notin:<values-comma-separatelly> 
- startwith:<any>
- endswith:<any>


## Custom validations
Open `src/config.js` and add:
```
export const validations = {
  ...
  nameOfValidation: {
    message: (params, value, values) => `The value is ${value} and the param is ${params[0]} and the form values is ${JSON.stringify(values)}`,
    handle: ({ value, params }) => {
      // value is field value | params is array of validation params: "nameOfValidation:param1:param2 ...."
      return true // true if is valid | false if is invalid
    }
  }
```

Use your validation on html:
```
<form-input name="test" type="email" label="Email field" validations="required|nameOfValidation:param1">
</form-input>
```


## Custom field types
- First: Create a class that implements the template and store `formitem` public variable of form element to receive event handlers
- Second: Create a method to trigger error message on the template
````
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

````
Next, open `src/config.js`, import your class and add on inputs list your new input type:
```
import { FormCurrency } from 'path/of/file/FormCurrency.js'
...
export const inputs = {
  ...
  currency: {
    source: FormCurrency
  }
```

Use your new input on html:
```
<form-input name="test" type="currency" label="Currency field" ></form-input>
```