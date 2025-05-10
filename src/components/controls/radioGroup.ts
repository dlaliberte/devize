/**
 * Radio Group Control Component
 *
 * Purpose: Provides a group of radio button controls
 * Author: Cody
 * Creation Date: 2023-11-16
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createControlElement, ControlBaseProps } from './controlBase';

// Make sure define type is registered
registerDefineType();

// Radio group specific properties
export interface RadioGroupProps extends ControlBaseProps {
  name: string;
  options: string[] | { value: string, label: string }[];
  layout?: 'vertical' | 'horizontal';
}

// Create a radio group control
export function createRadioGroup(props: RadioGroupProps): HTMLElement {
  const container = createControlElement(props);

  // Create radio group container
  const radioContainer = document.createElement('div');
  radioContainer.style.display = 'flex';
  radioContainer.style.flexDirection = props.layout === 'horizontal' ? 'row' : 'column';
  radioContainer.style.gap = props.layout === 'horizontal' ? '15px' : '10px';
  radioContainer.style.flexWrap = 'wrap';

  // Process options
  const options = props.options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Create radio buttons
  options.forEach(option => {
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.cursor = props.disabled ? 'default' : 'pointer';
    label.style.opacity = props.disabled ? '0.6' : '1';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = props.name;
    radio.value = option.value;
    radio.checked = props.value === option.value;
    radio.disabled = props.disabled || false;
    radio.style.marginRight = '8px';

    radio.addEventListener('change', () => {
      if (radio.checked && props.onChange) {
        props.onChange(option.value);
      }
    });

    label.appendChild(radio);
    label.appendChild(document.createTextNode(option.label));
    radioContainer.appendChild(label);
  });

  container.appendChild(radioContainer);

  return container;
}

// Register the radio group component
export function registerRadioGroupComponent() {
  buildViz({
    type: "define",
    name: "radioGroup",
    properties: {
      label: { default: '' },
      value: { required: true },
      name: { required: true },
      options: { required: true },
      layout: { default: 'vertical' },
      onChange: { default: null },
      className: { default: '' },
      style: { default: {} },
      disabled: { default: false }
    },
    implementation: function(props) {
      const element = createRadioGroup(props);

      return {
        element,
        getValue: () => {
          const checkedRadio = element.querySelector('input:checked') as HTMLInputElement;
          return checkedRadio ? checkedRadio.value : props.value;
        },
        setValue: (value: string) => {
          const radios = element.querySelectorAll('input');
          radios.forEach(radio => {
            if ((radio as HTMLInputElement).value === value) {
              (radio as HTMLInputElement).checked = true;

              if (props.onChange) {
                props.onChange(value);
              }
            }
          });
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

  console.log('Radio group component registered');
}

registerRadioGroupComponent();
