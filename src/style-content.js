export const defaultStyles = `.wc-form-outer {
  display: flex;
  flex-direction: column;
  gap: var(--wcf-outer-gap, 0.25rem);
  font-family: var(--wcf-font-family, inherit);
  color-scheme: light dark;

  .wc-form-label {
    padding: var(--wcf-label-padding, 0 0 0.25rem 0.25rem);
    font-weight: var(--wcf-label-weight, 500);
    color: var(--wcf-label-color, currentColor);
    font-size: var(--wcf-label-font-size, 0.875rem);
    opacity: 0.9;
  }

  /* Autocomplete Dropdown */
  .wc-form-input-wrapper {
    position: relative;
  }

  .wc-form-autocomplete-list {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    margin-top: 4px;
    z-index: 10;
    background: var(--wcf-autocomplete-bg, Canvas);
    border: var(--wcf-autocomplete-border, 1px solid var(--wcf-border-color, color-mix(in srgb, currentColor 20%, transparent)));
    border-radius: var(--wcf-input-radius, 5px);
    box-shadow: var(--wcf-autocomplete-shadow, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05));
    list-style: none;
    padding: var(--wcf-autocomplete-padding, 0.5rem 0);
    max-height: var(--wcf-autocomplete-max-height, 200px);
    overflow-y: auto;
    color: currentColor;
  }

  .wc-form-autocomplete-item {
    padding: var(--wcf-autocomplete-item-padding, 0.5rem 1rem);
    cursor: pointer;
    font-size: var(--wcf-autocomplete-item-font-size, 0.875rem);
    transition: background-color 0.2s ease;
  }

  .wc-form-autocomplete-item.highlighted,
  .wc-form-autocomplete-item:hover {
    background: var(--wcf-autocomplete-hover-bg, color-mix(in srgb, currentColor 10%, transparent));
  }

  .wc-form-wrapper {
    display: flex;
    flex-direction: column;

    .wc-form-input-wrapper {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--wcf-input-wrapper-gap, 0.5rem);
    }

    .wc-form-group {
      display: contents;
    }

    .wc-form-input,
    .wc-form-textarea,
    .wc-form-select {
      padding: var(--wcf-input-padding, 0.5rem 0.75rem);
      width: 100%;
      border: var(--wcf-input-border, 1px solid var(--wcf-border-color, color-mix(in srgb, currentColor 20%, transparent)));
      border-radius: var(--wcf-input-radius, 5px);
      background-color: var(--wcf-input-bg, transparent);
      color: var(--wcf-input-color, currentColor);
      font-family: inherit;
      font-size: var(--wcf-input-font-size, 0.875rem);
      transition: var(--wcf-input-transition, all 0.2s ease);
      outline: none;
      box-sizing: border-box;
      line-height: var(--wcf-input-line-height, 1.25rem);
    }

    .wc-form-input:focus,
    .wc-form-textarea:focus,
    .wc-form-select:focus {
      border-color: var(--wcf-input-focus-border, #3b82f6);
      outline: none;
      box-shadow: var(--wcf-input-focus-shadow, 0 0 0 1px #3b82f6);
    }

    .wc-form-select {
      /* Keep native popup palette predictable; default to light to avoid OS-dark bleed into light UIs. */
      color-scheme: var(--wcf-select-color-scheme, light);
    }

    .wc-form-select option,
    .wc-form-select optgroup {
      /* Keep native dropdown readable in dark/light themes */
      background-color: var(--wcf-select-option-bg, Canvas);
      color: var(--wcf-select-option-color, CanvasText);
    }

    .wc-form-input:disabled,
    .wc-form-textarea:disabled,
    .wc-form-select:disabled {
      background-color: var(--wcf-input-disabled-bg, color-mix(in srgb, currentColor 5%, transparent));
      color: var(--wcf-input-disabled-color, color-mix(in srgb, currentColor 50%, transparent));
      border-color: color-mix(in srgb, currentColor 10%, transparent);
      cursor: not-allowed;
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
      padding: var(--wcf-help-padding, 0.25rem 0.25rem 0);
      color: var(--wcf-help-color, currentColor);
      opacity: 0.6;
      font-size: var(--wcf-help-font-size, 0.75rem);
      font-style: var(--wcf-help-font-style, italic);
    }

    .wc-errors {
      display: flex;
      flex-direction: column;
      color: var(--wcf-error-color, #ef4444);
      font-size: var(--wcf-error-font-size, 0.875rem);
      margin-top: var(--wcf-error-margin-top, 0.25rem);
      gap: var(--wcf-error-gap, 0.125rem);
      padding-left: 0.25rem;
    }

    .wc-form-checks {
      display: flex;
      flex-direction: column;
      gap: var(--wcf-checks-group-gap, 0.5rem);
      padding: var(--wcf-checks-group-padding, 0.25rem 0);
      /* Native checkbox/radio paint follows color-scheme; default light avoids
         dark widgets on light pages when OS prefers dark (see --wcf-checks-color-scheme). */
      color-scheme: var(--wcf-checks-color-scheme, light);

      .wc-form-check {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: var(--wcf-check-padding, 0);
        gap: var(--wcf-check-gap, 0.5rem);

        label {
          text-transform: var(--wcf-check-label-transform, none);
          color: var(--wcf-check-label-color, currentColor);
          font-size: var(--wcf-check-label-font-size, 0.875rem);
          cursor: pointer;
          user-select: none;
          margin: 0;
          opacity: 0.9;
        }

        input {
          /* currentColor as accent fills the whole control in some UAs; match focus ring blue */
          accent-color: var(--wcf-check-accent, #3b82f6);
          width: var(--wcf-check-size, 1.25rem);
          height: var(--wcf-check-size, 1.25rem);
          cursor: pointer;
          margin: 0;
        }
      }
    }
  }
}`;
