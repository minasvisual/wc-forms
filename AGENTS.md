# AGENTS.md

## Objective
- This project implements form components as Web Components, with vanilla JavaScript, ESM modules, and no framework dependencies.
- Codex must preserve this proposal: simple code, extensible by configuration, and directly consumable in the browser via `src/index.js`.

## Stack and architecture
- Use only ESM JavaScript (`import`/`export`), compatible with the project's current environment.
- Do not introduce TypeScript, bundlers, transpilers, UI frameworks, or dependencies without explicit need.
- Keep the main API based on custom elements:
  - `<form-input>` for fields.
  - `<form is="form-control">` for the submit wrapper.
- Preserve the use of `ElementInternals`, `attachShadow`, `formAssociated`, and integration with `FormData`.
- Treat `src/config.js` as the central point of extensibility for:
  - `validations`
  - `inputs`
  - `masks`

## Coding conventions
- Follow the repository's dominant style:
  - single quotes
  - semicolons only when it locally makes sense; do not reformat the entire file
  - descriptive English names for classes, methods, and variables
  - named exports for utilities and classes
- Prefer small and direct functions with explicit logic.
- Avoid excessive abstractions. If the solution can follow the existing pattern, follow the existing pattern.
- Do not restructure files or rename public APIs without a clear need.

## Component patterns
- New input types must follow the contract used by components in `src/inputs/`:
  - receive `{ el, shadow, internals }` in the `constructor`
  - mount the template via `template.innerHTML`
  - attach to the `shadow`
  - expose `this.formitem`
  - implement `setError(error)`
- When it makes sense, keep the existing slot structure:
  - `before`
  - `label`
  - `prefix`
  - `input`
  - `suffix`
  - `help`
  - `errors`
  - `after`
- Reuse existing CSS classes (`wc-form-*`) before creating new conventions.
- If a new input is registrable, integrate it via `Config.registerInput(...)` or the `inputs` table in `src/config.js`.

## Validation and mask patterns
- Validation rules must remain in the current format:
  - `message: (...args) => string`
  - `handle: ({ value, params, el, values, rule }) => boolean`
- String-based validations must remain compatible with the format documented in the README:
  - `required|minlen:5|maxlen:128`
- New masks must follow the extension via `Config.registerMask(...)`.
- Before creating a new mechanism, check if the extension fits in `Config`.

## Public API and compatibility
- Preserve attributes documented in the README, such as:
  - `name`
  - `type`
  - `label`
  - `help`
  - `validations`
  - `options`
  - `mask`
  - `mask:format`
  - `unmask`
- Avoid breaking changes in event names and observable behavior.
- If a change modifies the public API, update `README.md` within the same task.

## Documentation
- Every new feature that affects the component's usage must reflect in the README.
- README examples must remain aligned with the actual code behavior.
- If a known limitation is relevant to the change, document it objectively.

## Tests
- Use Vitest for automated tests.
- `tests/form-input-events-submit.test.js` locks host `input` / `change` `e.detail` to the same `formatTypeValue` rules as the `submited` payload for each registered input type (see README “Event detail and submit payload”).
- When changing helpers, validations, parsing, or deterministic behavior, add or adjust tests in `tests/`.
- Follow the current test pattern:
  - `describe(...)`
  - `test(...)`
  - `expect(...)`
- Prioritize testing public behavior, not unnecessary internal details.

## Guidelines for changes
- Make small, localized changes.
- Do not fix the style of unrelated files just out of preference.
- Do not remove existing code without confirming the impact on the API and documentation.
- When adding a new feature, check this checklist:
  - implementation integrated into the current flow
  - `Config` update if necessary
  - documentation in `README.md`
  - test covering the main case

## What to avoid
- Do not introduce runtime dependencies without an explicit request.
- Do not migrate the base to another architecture.
- Do not replace the attribute-driven convention of the components with an imperative API.
- Do not create overly generic helpers if the usage is local and simple.

## Expected Codex response in future tasks
- Before proposing broad refactors, confirm if the problem can be solved while keeping the current pattern.
- In implementation tasks, prioritize compatibility with the README and `src/config.js`.
- In fix tasks, first consider public API, validation, mask, and submit regression.
