/**
 * Text Input Control Component
 *
 * Purpose: Provides a text input control
 * Author: Cody
 * Creation Date: 2023-11-16
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createControlElement, ControlBaseProps } from './controlBase';

// Make sure define type is registered
registerDefineType();

// Text input specific properties
export interface TextInputProps extends ControlBaseProps {
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'color';
  onInput?: (value: string) => void;
  onBlur?: (value: string) => void;
}

// Create a text input control
export function createTextInput(props: TextInputProps): HTMLElement {
  const container = createControlElement(props);

  // Create the input element
  const input = document.createElement('input');
  input.type = props.type || 'text';
  input.value = props.value;
  input.placeholder = props.placeholder || '';
  input.style.width = '100%';
  input.style.padding = '5px';
  input.style.boxSizing = 'border-box';
  input.disabled = props.disabled || false;

  // Add event listeners
  input.addEventListener('input', () => {
    if (props.onInput) {
      props.onInput(input.value);
    }
  });

  input.addEventListener('change', () => {
    if (props.onChange) {
      props.onChange(input.value);
    }
  });

  input.addEventListener('blur', () => {
    if (props.onBlur) {
      props.onBlur(input.value);
    }
  });

  container.appendChild(input);

  return container;
}

// Register the text input component
export function registerTextInputComponent() {
  buildViz({
    type: "define",
    name: "textInput",
    properties: {
      label: { default: '' },
      value: { required: true },
      placeholder: { default: '' },
      type: { default: 'text' },
      onChange: { default: null },
      onInput: { default: null },
      onBlur: { default: null },
      className: { default: '' },
      style: { default: {} },
      disabled: { default: false }
    },
    implementation: function(props) {
      const element = createTextInput(props);

      return {
        element,
        getValue: () => {
          const input = element.querySelector('input') as HTMLInputElement;
          return input ? input.value : props.value;
        },
        setValue: (value: string) => {
          const input = element.querySelector('input') as HTMLInputElement;
          if (input) {
            input.value = value;

            if (props.onChange) {
              props.onChange(value);
            }
          }
        },
        renderToSvg: (svg) => {
          // Controls are DOM elements, not SVG
          console.warn('Controls cannot be rendered to SVG directly');
          return null;
        },
        renderToCanvas: (ctx) => {
          // Controls are DOM elements, not Canvas
          console.warn('Controls cannot be rendered to Canvas directly');
          return false;
        }
      };
    }
  });

  console.log('Text input component registered');
}

registerTextInputComponent();
