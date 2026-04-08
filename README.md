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
<link rel="stylesheet" href="https://unpkg.com/wc-forms-kit@latest/style.css">
<script type="module" src="https://unpkg.com/wc-forms-kit@latest"></script>
```

---

## Basic Vanilla Implementation (with and without npm)

### With npm (as module)

```js 
import 'wc-forms-kit'
import 'wc-forms-kit/style.css' // optional
```

```html 
<script type="module">
  import { onMounted } from 'wc-forms-kit/helpers'
</script>
```
### Without npm (CDN)

```html
<script type="module" src="https://unpkg.com/wc-forms-kit@latest"></script>
<script type="module">
  import { onMounted } from 'https://unpkg.com/wc-forms-kit@latest/helpers' 
</script>
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
        onInput={e => console.log(e.detail)}
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

The adapter wires native listeners on the host: `onChange`, `onInput`, `onClick`, `onKeyDown`, `onKeyUp`, `onFocus`, and `onBlur` (focus uses `focusin` / `focusout` so events from the inner field reach the host in the shadow tree). The legacy `onTyping` prop listens to `input` (same as `onInput`). Use `onInput` for the field value in `e.detail`; `onKeyUp` receives a native `KeyboardEvent` (no `e.detail` for the value—use `e.currentTarget.value` or `onInput`).

---

## Form Control

To use complete form parsing types you need to use `<form is="form-control" ...>`. 

```html
<form is="form-control" >
  <form-input name="user" type="text" label="User"></form-input>
  <form-input name="skills" type="pills" label="Skills"></form-input>
  <form-input type="group" name="address">
    <form-input name="street" type="text" label="Street"></form-input>
    <form-input name="number" type="number" label="Number"></form-input>
  </form-input>
</form>
```
You can hydrate initial form state with a `values` JSON object on the form:

```html
<form is="form-control" values='{"user":"Ulisses","skills":["js","wc"],"address":{"street":"Main St","number":333}}'>
  ...
</form>
```

Or use the JS property API (auto stringify/parse):

```js
const form = document.querySelector('form[is="form-control"]')
form.values = {
  user: 'Ulisses',
  skills: ['js', 'wc'],
  address: { street: 'Main St', number: 333 }
}
```

You can also clear all custom fields using native-like reset on the wrapper:

```js
const form = document.querySelector('form[is="form-control"]')
form.reset() // clears current values and removes `values` attribute
```

### Native HTML form submit (without `form-control`)

> **Alert — backend formatting:** If the form is submitted by the **browser’s default** mechanism (classic GET/POST navigation or a raw `FormData` built from the form), the encoded payload does **not** go through the same pipeline as `<form is="form-control">`’s `submited` event (`getFormValues` / `formatTypeValue`, nested `group` objects, etc.). **Normalize and parse on the server** (or keep `form-control` and use `e.detail`, or submit JSON from your own script).

Types and patterns that usually need **manual handling** on the backend in that mode:

| Types / pattern | What you get on the wire | What to do on the server |
|-----------------|--------------------------|---------------------------|
| **`number`**, **`range`**, **`currency`** | Values are **strings** in `application/x-www-form-urlencoded` | Parse to numbers explicitly where needed |
| **`checkbox`** | The control’s string **`value`**, or the field **absent** when unchecked | Treat as string/absence, not a native boolean |
| **`checkboxes`**, **`pills`** | Often **multiple entries** with the same `name` | Merge into an array (or a single string if your stack collapses duplicates) |
| **`group`** | **No** nested object under the group’s `name`; children use **leaf `name`** only (possible collisions across groups) | Use names like `contact[street]` if you need nesting, or remap in middleware |
| **`text`** (and similar) **with `mask`** | Usually the **masked display string** unless **`unmask`** is set | Strip/normalize, or use **`unmask`** so the form value follows the library’s digit-stripping rule |
| **`color`**, **`date`**, **`datetime-local`** | Strings in the browser’s **wire format** | Validate or parse if you need stricter types |
| **`file`** | Requires **`multipart/form-data`** | Do not expect a urlencoded body for file fields |

Types that are mostly “what you see is what you get” as a single string field (still always strings in urlencoded) include **`text`**, **`email`**, **`url`**, **`search`**, **`password`**, **`textarea`**, **`hidden`**, **`select`**, **`radioboxes`**, and **`autocomplete`** — but encoding, empty vs missing keys, and validation remain your server’s responsibility.

Notes:

- `label` is optional. If omitted, no default `<label>` tag is rendered.
- For text-like controls (`text`, `email`, `url`, `search`, `number`, `password`, `textarea`, `autocomplete`, `currency`):
  - if `placeholder` is not provided, the `label` value is used as placeholder.
  - if both are missing, placeholder is empty.
- `pills` builds an array of tags. Type text and press `,`, `Enter`, or `Tab` to create tags; paste comma/newline text to add multiple tags; click the close button to remove a tag.

## Native Inputs

Available input types:

- text
  ```html 
    <form-input type="text" name="street" label="Street" placeholder="Street name" value="value default" help="optional help text"></form-input> 
  ```
- Same to:
  - hidden 
  - email 
  - url 
  - search 
  - number 
  - color 
  - password 
  - date 
  - datetime-local 
  - currency

- select
  ```html 
    <form-input name="selectField" type="select" label="Select field" options="[
        {'value': '', 'label': 'Select an option'},
        {'value': 1, 'label': 'Option 1'},
        {'value': 2, 'label': 'Option 2'}
      ]">
    // or as html
    <form-input name="selectFieldHtml" type="select" label="Select field (HTML Options)">
      <option value="">Select an option</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option> 
    </form-input>
  ``` 
- Same to:
  - autocomplete
  - radioboxes
  - checkboxes

- checkbox
  ```html 
    <form-input name="checkboxValueField" type="checkbox" value="optin" checked></form-input>
  ``` 

- textarea
  ```html 
    <form-input name="textareaField" type="textarea" rows="5" label="Textarea field" value="default value"></form-input>
  ``` 

- range
  ```html 
    <form-input type="range" name="vol"  min="0" max="100" value="50" label="Volume"></form-input>
  ``` 

- group (container; nests child fields under its `name` in submit payload)
  - Nested group example:
    ```html 
      <form-input type="group" name="address">
        <form-input type="text" name="street" label="Street"></form-input>
        <form-input type="number" name="number" label="Number"></form-input>
      </form-input>

      <form-input type="submit" label="Send"></form-input>
    </form>
    ```
  - Submit payload (`submited` event detail):

    ```js
    { address: { street: 'Main St', number: 333 } }
    ```
- file
  ```html 
    <form-input name="image" type="file" label="Thumb" accept="image/*" multiple validations="required|accept:image/png,.jpg,.jpeg"></form-input>
  ``` 
  - Native `<input type="file">` attributes set on the host (for example `accept`, `multiple`, `capture`, `required`, `disabled`, `webkitdirectory`, `autocomplete`, `tabindex`, `name`) are copied to the inner control at build time and kept in sync when those attributes change.
  - Built-in `accept:` validation enforces allowed MIME / extension tokens (same rules as the HTML `accept` attribute); use `required` when the field must have a file.
  - Submit payload (`submited` event detail):

    ```js
    { image: [File instance] }
    ```
    
- pills
  ```html 
    <form-input type="pills" name="tags" label="Tags" value="['1']"></form-input>
  ``` 
  - Submit payload (`submited` event detail):

    ```js
    { tags: ["1","2", ...] }
    ```

- button (emits `click`, does not submit)
  ```html 
    <form-input name="go" type="button" label="Fill form"></form-input>
  ```  
- submit (submits parent form) 
  ```html 
    <form-input name="send" type="submit" label="Send form"></form-input>
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
- alphanumeric (latin letters + numbers)
- alpha (latin letters only)
- regex:`<pattern>`
- passwordstrength:`<rules>` (`A` uppercase, `0` digit, `$` special char)
- slug (allows only latin letters, numbers, `_`, `-`, `.`)
- contains:`<required-characters>`
- accept:`<comma-separated-tokens>` (files only: MIME types, `image/*` style wildcards, or leading-dot extensions such as `.pdf`; passes when no file is selected—combine with `required` if needed)

Validation string format:

```html
<form-input validations="required|minlen:5|maxlen:128"></form-input>
```

## Emitted Events

Events are standard DOM `Event` instances (`bubbles`, `composed`). When a payload is documented below, it is attached as `e.detail` (not `CustomEvent`).

`e.detail` is the value at dispatch time. `e.target.value` on `<form-input>` reads the **current** form-associated submission value (same as the element’s `value` property); in a synchronous listener it matches `e.detail`, but if you read `e.target.value` later (for example after `await` or further typing), it may have changed—use `e.detail` for a stable snapshot.

| Component | Event Name | Payload (`e.detail`) | Description |
|-----------|------------|----------------------|-------------|
| `<form-input>` | `input` | `string \| number \| ...` | Fired while the value updates (same role as a native `<input>` / `<textarea>` `input` event). Used for `type="text"`, `textarea`, `autocomplete`, `currency` (each edit), and `range` (while dragging). |
| `<form-input>` | `change` | `string \| number \| array \| undefined \| File \| File[]` | Fired when the value is committed (blur / selection / etc.), matching native `change` semantics where applicable. Payload contains parsed/unmasked value. For `type="file"`, returns `File` or `File[]` (when `multiple`). For `type="currency"`, fires on blur after live updates (`input` carries each parsed step). |
| `<form-input type="button">` | `click` | native event | Native click bubbles from inner `<button type="button">`. |
| `<form is="form-control">` | `submited` | object | Fired on submit. Exposes parsed payload in `e.detail`, boolean in `e.valid`, and validation map in `e.errors` (dot-path keys for groups, e.g. `address.street`). |

#### Event `detail` and submit payload

The submit handler builds field values with the same parsing rules as `formatTypeValue` in `src/helpers.js` (using each control’s `data-type` / configured output). For a given field, **`e.detail` on the final `change`** (after the user commits the value) should match that field’s entry in `submited`’s `e.detail` once passed through `formatTypeValue` for that control’s output type.

- **`input` on the host** follows the live value (string, parsed number for `range` / `currency`, etc.). After editing stops, the **last** `input` and the **last** `change` agree with submit for text-like fields, `range`, and `currency` (after blur).
- **`type="autocomplete"`**: while filtering, host `input` events carry the raw filter text; only **`change`** after choosing a suggestion matches the submitted value.

Automated checks live in `tests/form-input-events-submit.test.js` (covers registered input types except `button` / `submit`, which are not part of the data payload).
 
Example

```js
const emailFld = document.querySelector('form-input[name="email"]')

emailFld.addEventListener('input', (e) => console.log(e.detail) ) // log every key inputed
emailFld.addEventListener('change', (e) => console.log(e.detail) ) // log data after blur or change (for selectables)
``` 

---

## Masks

Native mask formats (via [Vanila Masker](https://github.com/vanilla-masker/vanilla-masker)):

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

## Helpers API

You can import user helpers from `wc-forms-kit/helpers`

```js
import { onMounted, onDestroy, field, getFormValues, jsonToString } from 'wc-forms-kit/helpers' // or unpkg 'https://unpkg.com/wc-forms-kit@latest/helpers'

onMounted((doc) => {
  const input = doc.querySelector('input[name="username"]')
  field(input, {
    value: 'john',
    classes: ['rounded', 'border'],
    input: (e) => console.log(e.target.value),
  })
})

onDestroy((doc) => {
  console.log('Document is being unloaded')
})
```

`field(el, config)` behavior:
- `classes: string[]` adds classes.
- event keys (`input`, `change`, `click`, etc.) register listeners.
- other keys set properties/attributes when possible.
- listeners are auto-removed on `unload`; manual cleanup is also available via `destroy()`/`dispose()`.
```js  
  field( element, {
    value: 'defalt value',
    classes: ['rounded', 'border'],
    /// ... other attributes
    input: (e) => console.log(e.target.value),
  }) 
```
`onMounted(callback)` behavior: 
- listeners start state by `DOMContentLoaded`; .

`onDestroy(callback)` behavior: 
- listeners are auto-removed on `unload`; manual cleanup is also available via `destroy()`/`dispose()`.

`getFormValues(formElementSubmitEvent)` behavior:
- `formElementSubmitEvent`: e.target. 
- return native form element parsed as complex object .
```js  
  const handleSubmit = (e) => { 
    console.log('Manual form parsing', getFormValues(e.target))
  }
  
  <FormControl onSubmited={handleSubmit}></FormControl>
```

`jsonToString(Object)` behavior: 
- return json as simple quotes {'any':'data'}.
```js   
  <form is="form-input" values={jsonToString({name:'jonh'})}>
```
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

## Publish Metadata (webcomponents.org)

This repository is now prepared with:

- `custom-elements.json` generated from source.
- `package.json` with `"customElements": "custom-elements.json"`.
- `custom-elements.json` included in npm package files.

To refresh metadata before a release:

```bash
npm run cem
```

## Changelog

[![GitHub last commit](https://img.shields.io/github/last-commit/minasvisual/wc-forms?style=flat-square&color=blue)](https://github.com/minasvisual/wc-forms/commits/main)
[![GitHub commits since](https://img.shields.io/github/commits-since/minasvisual/wc-forms/v1.0.0?style=flat-square)](https://github.com/minasvisual/wc-forms/commits/main)

### Recent Activity

- Host events (`input`, `change`, `submited`) use native `Event` with `e.detail` attached; the former `typing` event was replaced by `input`.
- Vitest suite `tests/form-input-events-submit.test.js` verifies `e.detail` on `input`/`change` matches submit parsing per field type.

![Recent Activity](https://github-readme-recent-activity.vercel.app/api?user=minasvisual&repo=wc-forms&limit=5&theme=react&hide_header=true)

For the full list of changes, see the [Commit History](https://github.com/minasvisual/wc-forms/commits/main).
