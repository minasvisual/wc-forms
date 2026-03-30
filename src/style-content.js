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

    .wc-form-group {
      display: contents;
    }

    .wc-form-input, .wc-form-textarea, .wc-form-select  {
      padding: var(--wcf-input-padding, 5px 8px);
      width: 100%;
    }

    .wc-form-range-wrap {
      align-items: center;
      gap: var(--wcf-range-wrap-gap, 10px);
    }

    .wc-form-range-bound {
      font-size: var(--wcf-range-bound-font-size, 0.875rem);
      font-variant-numeric: tabular-nums;
      color: var(--wcf-range-bound-color, inherit);
      opacity: var(--wcf-range-bound-opacity, 0.9);
      flex-shrink: 0;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: var(--wcf-range-bound-min-width, 2ch);
    }

    .wc-form-range-bound-min {
      justify-content: flex-end;
      padding-right: var(--wcf-range-bound-pad-inline, 6px);
      text-align: right;
    }

    .wc-form-range-bound-max {
      justify-content: flex-start;
      padding-left: var(--wcf-range-bound-pad-inline, 6px);
      text-align: left;
    }

    .wc-form-range-control {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
    }

    .wc-form-range-track-shell {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      padding-block: var(--wcf-range-track-pad-block, 0.35em);
    }

    .wc-form-range-input {
      width: 100%;
      margin: 0;
      padding: 0;
      vertical-align: middle;
      box-sizing: border-box;
    }

    .wc-form-outer .wc-form-wrapper .wc-form-range-input.wc-form-input {
      padding: 0;
    }

    .wc-form-hidden {
      display: none;
    }

    .wc-form-range-popup {
      position: absolute;
      left: 0%;
      bottom: calc(100% - 1px);
      transform: translateX(-50%) translateY(-2px);
      padding: var(--wcf-range-popup-padding, 3px 8px);
      font-size: var(--wcf-range-popup-font-size, 0.8125rem);
      font-variant-numeric: tabular-nums;
      line-height: 1.15;
      border-radius: var(--wcf-range-popup-radius, 5px);
      background: var(--wcf-range-popup-bg, #1e293b);
      color: var(--wcf-range-popup-color, #fff);
      pointer-events: none;
      white-space: nowrap;
      box-shadow: var(--wcf-range-popup-shadow, 0 1px 3px rgba(0, 0, 0, 0.22));
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
