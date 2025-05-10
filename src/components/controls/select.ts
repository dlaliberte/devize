/**
 * Select Control Component
 *
 * Purpose: Provides a dropdown select control
 * Author: Cody
 * Creation Date: 2023-11-16
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createControlElement, ControlBaseProps } from './controlBase';

// Make sure define type is registered
registerDefineType();

// Select specific properties
export interface SelectProps extends ControlBaseProps {
  options: string[] | { value: string, label: string }[];
  placeholder?: string;
}

// Create a select control
export function createSelect(props: SelectProps): HTMLElement {
  const container = createControlElement(props);

  // Create the select element
  const select = document.createElement('select');
  select.style.width = '100%';
  select.style.padding = '5px';
  select.style.boxSizing = 'border-box';
  select.disabled = props.disabled || false;

  // Add placeholder if provided
  if (props.placeholder) {
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = props.placeholder;
    placeholderOption.disabled = true;
    placeholderOption.selected = !props.value;
    select.appendChild(placeholderOption);
  }

  // Process options
  const options = props.options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Add options to select
  options.forEach(option => {
    const optElement = document.createElement('option');
    optElement.value = option.value;
    optElement.textContent = option.label;
    optElement.selected = props.value === option.value;
    select.appendChild(optElement);
  });

  // Add event listener
  select.addEventListener('change', () => {
    if (props.onChange) {
      props.onChange(select.value);
    }
  });

  container.appendChild(select);

  return container;
}

// Register the select component
export function registerSelectComponent() {
  buildViz({
    type: "define",
    name: "select",
    properties: {
      label: { default: '' },
      value: { required: true },
      options: { required: true },
      placeholder: { default: '' },
      onChange: { default: null },
      className: { default: '' },
      style: { default: {} },
      disabled: { default: false }
    },
    implementation: function(props) {
      const element = createSelect(props);

      return {
        element,
        getValue: () => {
          const select = element.querySelector('select') as HTMLSelectElement;
          return select ? select.value : props.value;
        },
        setValue: (value: string) => {
          const select = element.querySelector('select') as HTMLSelectElement;
          if (select) {
            select.value = value;

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

  console.log('Select component registered');
}

registerSelectComponent();
