export class FormGroup {
  constructor({ el, shadow }) {
    this.el = el;
    const template = document.createElement('template');

    // Container-only group.
    // Children remain in the light DOM (slotted) so nested form-inputs keep their native
    // validations/masks/event wiring via their own <form-input> instances.
    template.innerHTML = `
      <div class="wc-form-group" part="outer">
        <slot name="before"></slot>
        <slot></slot>
        <slot name="after"></slot>
        <small class="wc-errors hidden" part="errors"></small>
      </div>
    `;

    shadow.appendChild(template.content.cloneNode(true));

    this.erroritem = shadow.querySelector('.wc-errors');
    // FormComponent expects an element in `this.formitem` to set attributes/setValidity.
    // This group doesn't contribute to FormData by itself.
    this.formitem = document.createElement('span');
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

