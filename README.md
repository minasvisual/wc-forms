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
- [ ] Slot customization
- [ ] Unit tests
- [ ] Extensible style
- [ ] Custom validations
- [ ] Custom input types
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