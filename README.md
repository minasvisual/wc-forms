# Web Components Forms

Is a modular, 100% vanilla js, form inputs group, based on [Vue FormKit](https://formkit.com/getting-started/what-is-formkit) library.

## Demo
[Github Pages](https://minasvisual.github.io/wc-forms/)

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
- [X] Mask native
- [X] Custom Masks native
- [ ] Unit tests
- [ ] Extensible style
- [ ] Internacionalization
- [ ] NPM Package installation
- [ ] Plugins

#### bugs 
- [ ] Validation style and help
- [ ] input url - force pattern


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
- radioboxes // multiple
- checkboxes // multiple
- checkbox   // unique
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
Inside `<head>` tag, import `Config` as module before import `index.js` and add:
```html
  ....
  <script type="module" >
    import { Config } from '/src/config.js' 

    Config.registerValidation('custom', {
      // Build error message
      message: (params, value, values) 
        => `The value is ${value} and the param is ${params[0]} and the form values is ${JSON.stringify(values)}`,
      // Validate changed input
      handle: ({ value, params }) => {
        // value is field value | params is array of validation params: "custom:param1:param2 ...."
        return true // true if is valid | false if is invalid
      }
    }) 
  </script> 
  <script type="module" src="/src/index.js" defer async></script>
  ... 
```

Use your validation on html:
```
<form-input name="test" type="email" label="Email field" validations="required|custom:param1"></form-input>
```

## Native masks by VMasker
Use mask to format output of input texts
```html
<form-input name="test" type="text" mask="(99) 99999-9999" label="Phone field" validations="required">
</form-input>
```
#### Replace map:
- S: any character
- A: any letter (A-Za-z)
- 9: any number (0-9) 

#### Mask types:
- pattern: default, let empty mask:type attribute
- currency: add attribute `mask:format="currency"`
- number: add attribute `mask:format="number"`
- alpha: add attribute `mask:format="alpha"`

```html
<form-input name="test" type="text" mask mask:format="currency" label="Money field" >
</form-input>
```

#### Mask with unmask return: 
```html
<form-input name="test" type="text" mask="(99) 9999-9999" unmask label="Money field" >
</form-input>
```

#### Custom Mask: 
HTML header example:
- A mask that changes pattern through characters length
```html
  ....
  <script type="module" >
    import { Config } from '/src/config.js' 
    // See more in VMasker Docs: https://github.com/vanilla-masker/vanilla-masker/tree/master
    Config.registerMask('document', (el, maskInstance, maskInputAttribute) => {
      var docMask = ['999.999.999-999', '99.999.999/9999-99'];
      var inputHandler = (masks, max, event) => {
        var c = event.target;
        var v = c.value.replace(/\D/g, '');
        var m = c.value.length > max ? 1 : 0;
        maskInstance.unMask();
        maskInstance.maskPattern(masks[m]); 
      }
      maskInstance.maskPattern(docMask[0]);
      el.addEventListener('input', inputHandler.bind(undefined, docMask, 14), false);
    })
  </script> 
  <script type="module" src="/src/index.js" defer async></script>
  ... 
```
HTML Content
```html
 <form-input name="test18" type="text" label="Custom mask" mask mask:format="document" validations="required" >  
 </form-input>  
```



## Custom field types
- First: Create a class that implements the template and store `formitem` as public variable of form element to receive event handlers
- Second: Create a method to trigger error message on the template
```js
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
    console.log('Do anything with error message', error)
  }
}

```
Next, import `Config` store and import your class. register your new input type:
```html
  <script type="module" >
    import { Config } from '/src/config.js'
    import { FormCurrency } from '/path/of/file/custominput.js'
  
    Config.registerInput('currency', FormCurrency)
  </script> 
  <script type="module" src="/src/index.js" defer async></script>
  ...
```

Use your new input on html:
```
<form-input name="test" type="currency" label="Currency field" ></form-input>
```