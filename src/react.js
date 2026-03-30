"use client";
/**
 * React Adapter for wc-forms-kit
 * Creates React Wrappers for the web components without requiring bundlers or import maps.
 * 
 * @param {Object} ReactInstance - The React module (e.g. imported via `import React from 'react'` or `window.React`)
 * @returns {Object} { FormInput, FormControl }
 */
export function createWcFormsReact(ReactInstance) {
  const React = ReactInstance || globalThis.React;
  if (!React) {
    throw new Error("React is required to create wc-forms-kit React wrappers. Pass it as createWcFormsReact(React).");
  }

  const FormInput = React.forwardRef((props, ref) => {
    const { 
      validations, options, mask, unmask, 
      onChange, onInput, onTyping, onClick,
      onKeyDown, onKeyUp, onFocus, onBlur,
      className,
      ...rest 
    } = props;
    
    const internalRef = React.useRef(null);

    // Sync complex objects to literal attributes before mounting to bypass React 18 string coercion flaw
    const renderProps = { ...rest };
    if (className) renderProps.class = className; // Standard React translation
    
    if (options !== undefined) {
      renderProps.options = typeof options === 'string' ? options : JSON.stringify(options).replace(/"/g, "'");
    }
    if (validations !== undefined) {
      renderProps.validations = typeof validations === 'string' ? validations : JSON.stringify(validations);
    }
    if (mask !== undefined) {
      renderProps.mask = typeof mask === 'string' ? mask : JSON.stringify(mask);
    }
    if (unmask !== undefined) {
      renderProps.unmask = String(unmask) === 'true' ? "true" : undefined;
    }

    React.useEffect(() => {
      const node = internalRef.current;
      if (!node) return;

      // Native `input` / `change` on the host (see README). `onTyping` listens to `input` for backward compatibility.
      // React does not reliably attach synthetic handlers (onKeyUp, etc.) to custom elements — use addEventListener.
      if (onChange) node.addEventListener('change', onChange);
      if (onInput) node.addEventListener('input', onInput);
      if (onTyping) node.addEventListener('input', onTyping);
      if (onClick) node.addEventListener('click', onClick);
      if (onKeyDown) node.addEventListener('keydown', onKeyDown);
      if (onKeyUp) node.addEventListener('keyup', onKeyUp);
      // focus/blur do not bubble from shadow; focusin/focusout do (inner input → host).
      if (onFocus) node.addEventListener('focusin', onFocus);
      if (onBlur) node.addEventListener('focusout', onBlur);

      return () => {
        if (onChange) node.removeEventListener('change', onChange);
        if (onInput) node.removeEventListener('input', onInput);
        if (onTyping) node.removeEventListener('input', onTyping);
        if (onClick) node.removeEventListener('click', onClick);
        if (onKeyDown) node.removeEventListener('keydown', onKeyDown);
        if (onKeyUp) node.removeEventListener('keyup', onKeyUp);
        if (onFocus) node.removeEventListener('focusin', onFocus);
        if (onBlur) node.removeEventListener('focusout', onBlur);
      };
    }, [onChange, onInput, onTyping, onClick, onKeyDown, onKeyUp, onFocus, onBlur]);

    React.useImperativeHandle(ref, () => internalRef.current, []);

    return React.createElement('form-input', { ...renderProps, ref: internalRef });
  });

  const FormControl = React.forwardRef((props, ref) => {
    const { onSubmited, children, ...rest } = props;
    const internalRef = React.useRef(null);

    React.useEffect(() => {
      const node = internalRef.current;
      if (!node) return;
      
      if (onSubmited) {
        node.addEventListener('submited', onSubmited);
        return () => node.removeEventListener('submited', onSubmited);
      }
    }, [onSubmited]);

    React.useImperativeHandle(ref, () => internalRef.current, []);

    return React.createElement('form', { is: 'form-control', ...rest, ref: internalRef }, children);
  });

  return { FormInput, FormControl };
}

// Auto-export if React is globally available (e.g. in CDN/Standalone setups)
export const WcFormsReact = (typeof globalThis !== 'undefined' && globalThis.React) 
  ? createWcFormsReact(globalThis.React) 
  : null;

// For destructuring convenience (will be null if React isn't global, requiring manual createWcFormsReact usage with Bundlers)
export const FormInput = WcFormsReact ? WcFormsReact.FormInput : null;
export const FormControl = WcFormsReact ? WcFormsReact.FormControl : null;
