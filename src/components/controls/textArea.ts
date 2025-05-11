/**
 * TextArea Control Component
 *
 * Purpose: Provides a multi-line text input control for the UI
 * Author: Cody
 * Creation Date: 2023-11-17
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createRenderableVisualization } from '../../core/componentUtils';

// Make sure define type is registered
registerDefineType();

// Define the textArea component
export const textAreaDefinition = {
  type: "define",
  name: "textArea",
  properties: {
    label: { default: '' },
    value: { default: '' },
    placeholder: { default: '' },
    rows: { default: 4 },
    cols: { default: 40 },
    disabled: { default: false },
    readonly: { default: false },
    required: { default: false },
    maxLength: { default: -1 },
    minLength: { default: -1 },
    className: { default: 'text-area-control' },
    onChange: { default: null },
    onFocus: { default: null },
    onBlur: { default: null }
  },
  implementation: function(props) {
    // Create the DOM elements
    const container = document.createElement('div');
    container.className = props.className;
    container.style.marginBottom = '15px';

    // Create label if provided
    if (props.label) {
      const label = document.createElement('label');
      label.textContent = props.label;
      label.style.display = 'block';
      label.style.marginBottom = '5px';
      label.style.fontWeight = 'bold';
      container.appendChild(label);
    }

    // Create textarea element
    const textarea = document.createElement('textarea');
    textarea.value = props.value || '';
    textarea.placeholder = props.placeholder || '';
    textarea.rows = props.rows;
    textarea.cols = props.cols;
    textarea.disabled = !!props.disabled;
    textarea.readOnly = !!props.readonly;
    textarea.required = !!props.required;

    if (props.maxLength > 0) {
      textarea.maxLength = props.maxLength;
    }

    if (props.minLength > 0) {
      textarea.minLength = props.minLength;
    }

    // Style the textarea
    textarea.style.width = '100%';
    textarea.style.padding = '8px';
    textarea.style.boxSizing = 'border-box';
    textarea.style.borderRadius = '4px';
    textarea.style.border = '1px solid #ccc';
    textarea.style.fontFamily = 'inherit';
    textarea.style.fontSize = 'inherit';
    textarea.style.resize = 'vertical';

    // Add event listeners
    if (typeof props.onChange === 'function') {
      textarea.addEventListener('input', (e) => {
        props.onChange((e.target as HTMLTextAreaElement).value);
      });
    }

    if (typeof props.onFocus === 'function') {
      textarea.addEventListener('focus', (e) => {
        props.onFocus((e.target as HTMLTextAreaElement).value);
      });
    }

    if (typeof props.onBlur === 'function') {
      textarea.addEventListener('blur', (e) => {
        props.onBlur((e.target as HTMLTextAreaElement).value);
      });
    }

    container.appendChild(textarea);

    // Create the renderable object
    const renderable = {
      element: container,

      // Get the current value
      getValue: () => textarea.value,

      // Set a new value
      setValue: (value: string) => {
        textarea.value = value;
      },

      // Enable/disable the control
      setDisabled: (disabled: boolean) => {
        textarea.disabled = disabled;
      },

      // Set focus to the control
      focus: () => {
        textarea.focus();
      },

      // Render to DOM - just returns the already created element
      render: (parent: HTMLElement) => {
        parent.appendChild(container);
        return {
          element: container,
          update: (newProps: any) => {
            // Handle updates if needed
            if (newProps.value !== undefined && newProps.value !== textarea.value) {
              textarea.value = newProps.value;
            }
            if (newProps.disabled !== undefined) {
              textarea.disabled = !!newProps.disabled;
            }
            return { element: container };
          },
          cleanup: () => {
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }
          }
        };
      }
    };

    return renderable;
  }
};

/**
 * Create a textArea control directly
 */
export function createTextArea(options: {
  label?: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  cols?: number;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  className?: string;
  onChange?: (value: string) => void;
  onFocus?: (value: string) => void;
  onBlur?: (value: string) => void;
}) {
  return buildViz({
    type: 'textArea',
    ...options
  });
}

export function registerTextAreaComponent() {
  // Make sure define type is registered
  registerDefineType();

  // Register the textArea component with the builder
  buildViz(textAreaDefinition);
  console.log('TextArea component registered');
}
