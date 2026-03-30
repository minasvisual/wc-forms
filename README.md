# Web Components Forms

## About

`wc-forms-kit` is a modular, framework-agnostic form library built with native Web Components and 100% vanilla JavaScript.

- Status: In development
- Main API:
  - `<form-input>` for fields
  - `<form is="form-control">` for submit orchestration and parsed payload

### Demos
- [Vanilla complete form](https://minasvisual.github.io/wc-forms/)
- [Alpine To-Do](https://minasvisual.github.io/wc-forms/examples/todo.html)
- [React Standalone](https://minasvisual.github.io/wc-forms/examples/index.html)
- [Vue Standalone](https://minasvisual.github.io/wc-forms/examples/vue.html)

---

## Installation

Install with npm:

```sh
npm install wc-forms-kit
```

Or use it directly from a CDN:

```html
<script type="module" src="https://unpkg.com/wc-forms-kit"></script>
```

---

## Basic Vanilla Implementation (with and without npm)

### With npm

```js
import { Config } from 'wc-forms-kit/config'

// Optional: configure before registering custom elements
Config.basePath = '/your/public/assets'

import 'wc-forms-kit'
```

```html
<form is="form-control">
  <form-input
    name="fullname"
    type="text"
    label="Name"
    help="Should be your fullname"
    validations="required|minlen:5|maxlen:128">
  </form-input>

  <form-input name="country" type="autocomplete" label="Country">
    <option value="br">Brazil</option>
    <option value="us">USA</option>
  </form-input>

  <form-input type="submit" label="Send"></form-input>
</form>
```

### Without npm (CDN)

```html
<script type="module">
  import { Config } from 'https://unpkg.com/wc-forms-kit/config'
  Config.basePath = '/src' // optional
</script>
<script type="module" src="https://unpkg.com/wc-forms-kit"></script>
```

---

## Basic React Implementation (with npm)

React / Next.js SSR is supported through the adapter package export.

```jsx
import React, { useState } from 'react'
import 'wc-forms-kit'
import { FormInput, FormControl } from 'wc-forms-kit/react'

export function ReactForm() {
  const [data, setData] = useState(null)

  return (
    <FormControl onSubmited={(e) => setData(e.detail)}>
      <FormInput
        name="user"
        type="text"
        label="Name"
        validations="required"
      />

      <FormInput
        name="frameworks"
        type="checkboxes"
        label="Frameworks"
        validations="required"
        options={[
          { label: 'React', value: 'react' },
          { label: 'Vue', value: 'vue' },
        ]}
      />

      <button type="submit">Send</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </FormControl>
  )
}
```

---

## Inputs

Available input types:

- text
- email
- url
- search
- number
- color
- password
- date
- datetime-local
- range
- hidden
- group (container; nests child fields under its `name` in submit payload)
- file
- currency
- button (emits `click`, does not submit)
- submit (submits parent form)
- select
- radioboxes
- checkboxes
- checkbox
- textarea
- autocomplete

Notes:

- `label` is optional. If omitted, no default `<label>` tag is rendered.
- For text-like controls (`text`, `email`, `url`, `search`, `number`, `password`, `textarea`, `autocomplete`, `currency`):
  - if `placeholder` is not provided, the `label` value is used as placeholder.
  - if both are missing, placeholder is empty.

Nested group example:

```html
<form is="form-control">
  <form-input type="group" name="address">
    <form-input type="text" name="street" label="Street"></form-input>
    <form-input type="number" name="number" label="Number"></form-input>
  </form-input>

  <form-input type="submit" label="Send"></form-input>
</form>
```

Submit payload (`submited` event detail):

```js
{ address: { street: 'Main St', number: 333 } }
```

---

## Validations

Built-in validation rules:

- required
- email
- minlen:`<number>`
- maxlen:`<number>`
- confirm:`<other-field-name>`
- isdate
- isafter:`<yyyy-mm-dd>`
- isbefore:`<yyyy-mm-dd>`
- isnumber
- max:`<number>`
- min:`<number>`
- in:`<comma-separated-values>`
- notin:`<comma-separated-values>`
- startwith:`<text>`
- endswith:`<text>`

Validation string format:

```html
<form-input validations="required|minlen:5|maxlen:128"></form-input>
```

### Emitted Events

| Component | Event Name | Payload (`e.detail`) | Description |
|-----------|------------|----------------------|-------------|
| `<form-input>` | `change` | `string \| number \| array \| undefined \| File \| File[]` | Fired when field value changes. Payload contains parsed/unmasked value. For `type="file"`, returns `File` or `File[]` (when `multiple`). |
| `<form-input type="button">` | `click` | native event | Native click bubbles from inner `<button type="button">`. |
| `<form is="form-control">` | `submited` | object | Fired on submit. Exposes parsed payload in `e.detail`, boolean in `e.valid`, and validation map in `e.errors` (dot-path keys for groups, e.g. `address.street`). |

---

## Masks

Native mask formats (via VanillaMasker):

- pattern (default)
- currency (`mask:format="currency"`)
- number (`mask:format="number"`)
- alpha (`mask:format="alpha"`)

Examples:

```html
<form-input name="phone" type="text" mask="(99) 99999-9999" validations="required"></form-input>
<form-input name="money" type="text" mask mask:format="currency"></form-input>
<form-input name="phoneRaw" type="text" mask="(99) 9999-9999" unmask></form-input>
```

Mask tokens:

- `S`: any character
- `A`: any letter (`A-Za-z`)
- `9`: any digit (`0-9`)

---

## Customization and Custom Inputs/Mask/Validation

### Theming (Shadow Parts)

Exposed parts:

- `outer`, `label`, `wrapper`, `input-wrapper`, `input`, `help`, `errors`
- `checks-wrapper`, `check-label`, `check-text`
- range-only: `range-min`, `range-max`, `range-value-popup`, `range-control`, `range-track`

```css
form-input::part(input) {
  border: 1px solid #ddd;
  border-radius: 6px;
}

form-input::part(input):focus {
  border-color: blue;
  outline: none;
}
```

Override default styles globally:

```js
import { Config } from 'wc-forms-kit/config'
import customStyles from './my-custom-style.css?raw'

Config.stylesText = customStyles
// or Config.stylesURL = '/your-custom-styles.css'

import 'wc-forms-kit'
```

### Custom Validation

```html
<script type="module">
  import { Config } from '/src/config.js'

  Config.registerValidation('custom', {
    message: (params, value, values) =>
      `The value is ${value} and param is ${params[0]}`,
    handle: ({ value, params }) => true,
  })
</script>
```

Usage:

```html
<form-input
  name="test"
  type="email"
  label="Email field"
  validations="required|custom:param1">
</form-input>
```

### Custom Mask

```html
<script type="module">
  import { Config } from '/src/config.js'

  Config.registerMask('document', (el, maskInstance) => {
    const docMask = ['999.999.999-999', '99.999.999/9999-99']
    const inputHandler = (masks, max, event) => {
      const c = event.target
      const m = c.value.length > max ? 1 : 0
      maskInstance.unMask()
      maskInstance.maskPattern(masks[m])
    }

    maskInstance.maskPattern(docMask[0])
    el.addEventListener('input', inputHandler.bind(undefined, docMask, 14), false)
  })
</script>
```

Usage:

```html
<form-input
  name="doc"
  type="text"
  label="Custom mask"
  mask
  mask:format="document"
  validations="required">
</form-input>
```

### Custom Input Type

`currency` is built-in. To create your own type:

```js
export class FormExample {
  constructor({ el, shadow, internals }) {
    this.label = el.getAttribute('label') || ''
    this.name = el.getAttribute('name')

    const template = document.createElement('template')
    template.innerHTML = `
      <div class="wc-form-outer">
        <label class="wc-form-label">${this.label}</label>
        <div class="wc-form-wrapper">
          <div class="wc-form-input-wrapper">
            <input class="wc-form-input" type="text" name="${this.name}" />
          </div>
        </div>
      </div>
    `

    shadow.appendChild(template.content.cloneNode(true))
    this.formitem = shadow.querySelector('input')
  }

  setError(error) {
    console.log(error)
  }
}
```

Register and use:

```html
<script type="module">
  import { Config } from '/src/config.js'
  import { FormExample } from '/path/custominput.js'

  Config.registerInput('example', FormExample)
</script>

<form-input name="test" type="example" label="Example field"></form-input>
```

### Internationalization (i18n)

```js
import { Config } from 'wc-forms-kit/config'

Config.setLanguage('es')

Config.registerLanguage('pt', {
  required: 'Este campo é obrigatório',
  email: 'Este deve ser um email válido',
  minlen: 'Este campo deve ter pelo menos {0} caracteres',
  maxlen: 'Este campo deve ter no máximo {0} caracteres',
  confirm: 'Este campo deve ser igual ao campo {0}',
})
```

---

## Changelog

[![GitHub last commit](https://img.shields.io/github/last-commit/minasvisual/wc-forms?style=flat-square&color=blue)](https://github.com/minasvisual/wc-forms/commits/main)
[![GitHub commits since](https://img.shields.io/github/commits-since/minasvisual/wc-forms/v1.0.0?style=flat-square)](https://github.com/minasvisual/wc-forms/commits/main)

### Recent Activity

![Recent Activity](https://github-readme-recent-activity.vercel.app/api?user=minasvisual&repo=wc-forms&limit=5&theme=react&hide_header=true)

For the full list of changes, see the [Commit History](https://github.com/minasvisual/wc-forms/commits/main).
