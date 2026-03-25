export const defaultStyles = `.wc-form-outer {
  display: flex;
  flex-direction: column;
  gap: var(--wcf-outer-gap, 0);

  .wc-form-label {
    padding: var(--wcf-label-padding, 5px 3px 3px 0px);
    font-weight: var(--wcf-label-weight, 500);
  }

  .wc-form-wrapper {
    display: flex;
    flex-direction: column;

    .wc-form-input-wrapper {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--wcf-input-wrapper-gap, 5px);
    }

    .wc-form-input, .wc-form-textarea, .wc-form-select  {
      padding: var(--wcf-input-padding, 5px 8px);
      width: 100%;
    }
 
    .wc-form-help {
      padding: var(--wcf-help-padding, 0px 5px 5px 0px);
      color: var(--wcf-help-color, inherit);
      font-size: var(--wcf-help-font-size, inherit);
    }

    .wc-errors {
      display: flex;
      flex-direction: column;
      color: var(--wcf-error-color, red);
    }

    .wc-form-checks {
      display: flex;
      flex-direction: column;

      .wc-form-check {
        display: flex;
        align-items: center;
        justify-content: start;
        padding: var(--wcf-check-padding, 5px 0px);
        gap: var(--wcf-check-gap, 5px);

        label {
          text-transform: capitalize;
        }

        input {
          accent-color: var(--wcf-check-accent, auto);
        }
      }
    }
  }
}`;
