/**
 * Checkbox Control Component
 *
 * Purpose: Provides a checkbox control
 * Author: Cody
 * Creation Date: 2023-11-16
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createControlElement, ControlBaseProps } from './controlBase';

// Make sure define type is registered
registerDefineType();

// Checkbox specific properties
export interface CheckboxProps extends ControlBaseProps {
  labelPosition?: 'left' | 'right';
}

// Create a checkbox control
export function createCheckbox(props: CheckboxProps): HTMLElement {
  const container = createControlElement({
    ...props,
    label: '' // We'll handle the label differently for checkboxes
  });

  // Create the checkbox container
  const checkboxContainer = document.createElement('div');
  checkboxContainer.style.display = 'flex';
  checkboxContainer.style.alignItems = 'center';
  checkboxContainer.style.cursor = props.disabled ? 'default' : 'pointer';

  // Create the checkbox input
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = Boolean(props.value);
  checkbox.disabled = props.disabled || false;
  checkbox.style.margin = '0';
  checkbox.style.marginRight = '8px';

  // Create the label
  const label = document.createElement('label');
  label.textContent = props.label || '';
  label.style.cursor = props.disabled ? 'default' : 'pointer';
  label.style.opacity = props.disabled ? '0.6' : '1';

  // Add event listener
  checkbox.addEventListener('change', () => {
    if (props.onChange) {
      props.onChange(checkbox.checked);
    }
  });

  // Arrange elements based on label position
  if (props.labelPosition === 'left') {
    label.style.marginRight = '8px';
    checkboxContainer.appendChild(label);
    checkboxContainer.appendChild(checkbox);
  } else {
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
  }

  container.appendChild(checkboxContainer);

  return container;
}

// Register the checkbox component
export function registerCheckboxComponent() {
  buildViz({
    type: "define",
    name: "checkbox",
    properties: {
      label: { default: '' },
      value: { required: true },
      labelPosition: { default: 'right' },
      onChange: { default: null },
      className: { default: '' },
      style: { default: {} },
      disabled: { default: false }
    },
    implementation: function(props) {
      const element = createCheckbox(props);

      return {
        element,
        getValue: () => {
          const checkbox = element.querySelector('input') as HTMLInputElement;
          return checkbox ? checkbox.checked : Boolean(props.value);
        },
        setValue: (value: boolean) => {
          const checkbox = element.querySelector('input') as HTMLInputElement;
          if (checkbox) {
            checkbox.checked = Boolean(value);

            if (props.onChange) {
              props.onChange(checkbox.checked);
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

  console.log('Checkbox component registered');
}

registerCheckboxComponent();
