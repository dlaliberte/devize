/**
 * Color Input Control Component
 *
 * Purpose: Provides a color picker control
 * Author: Cody
 * Creation Date: 2023-11-16
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createControlElement, ControlBaseProps } from './controlBase';

// Make sure define type is registered
registerDefineType();

// Color input specific properties
export interface ColorInputProps extends ControlBaseProps {
  showColorText?: boolean;
}

// Create a color input control
export function createColorInput(props: ColorInputProps): HTMLElement {
  const container = createControlElement(props);

  // Create the color input container
  const colorContainer = document.createElement('div');
  colorContainer.style.display = 'flex';
  colorContainer.style.alignItems = 'center';
  colorContainer.style.gap = '10px';

  // Create the color input
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = props.value || '#000000';
  colorInput.disabled = props.disabled || false;
  colorInput.style.width = '40px';
  colorInput.style.height = '40px';
  colorInput.style.padding = '0';
  colorInput.style.border = '1px solid #ccc';
  colorInput.style.borderRadius = '4px';
  colorInput.style.cursor = props.disabled ? 'default' : 'pointer';

  // Add event listener
  colorInput.addEventListener('input', () => {
    if (props.onChange) {
      props.onChange(colorInput.value);
    }

    // Update text display if needed
    if (props.showColorText && colorText) {
      colorText.value = colorInput.value;
    }
  });

  colorContainer.appendChild(colorInput);

  // Add text display if needed
  let colorText: HTMLInputElement | null = null;
  if (props.showColorText) {
    colorText = document.createElement('input');
    colorText.type = 'text';
    colorText.value = props.value || '#000000';
    colorText.disabled = props.disabled || false;
    colorText.style.width = '80px';
    colorText.style.padding = '5px';
    colorText.style.boxSizing = 'border-box';

    // Update color when text changes
    colorText.addEventListener('change', () => {
      // Validate color format
      if (/^#[0-9A-F]{6}$/i.test(colorText!.value)) {
        colorInput.value = colorText!.value;
        if (props.onChange) {
          props.onChange(colorText!.value);
        }
      } else {
        // Reset to current color if invalid
        colorText!.value = colorInput.value;
      }
    });

    colorContainer.appendChild(colorText);
  }

  // Add color preview
  const colorPreview = document.createElement('div');
  colorPreview.style.width = '20px';
  colorPreview.style.height = '20px';
  colorPreview.style.backgroundColor = props.value || '#000000';
  colorPreview.style.border = '1px solid #ccc';
  colorPreview.style.borderRadius = '4px';

  // Update preview when color changes
  colorInput.addEventListener('input', () => {
    colorPreview.style.backgroundColor = colorInput.value;
  });

  colorContainer.appendChild(colorPreview);

  container.appendChild(colorContainer);

  return container;
}

// Register the color input component
export function registerColorInputComponent() {
  buildViz({
    type: "define",
    name: "colorInput",
    properties: {
      label: { default: '' },
      value: { required: true },
      showColorText: { default: true },
      onChange: { default: null },
      className: { default: '' },
      style: { default: {} },
      disabled: { default: false }
    },
    implementation: function(props) {
      const element = createColorInput(props);

      return {
        element,
        getValue: () => {
          const input = element.querySelector('input[type="color"]') as HTMLInputElement;
          return input ? input.value : props.value;
        },
        setValue: (value: string) => {
          const input = element.querySelector('input[type="color"]') as HTMLInputElement;
          if (input) {
            input.value = value;

            // Update preview
            const preview = element.querySelector('div:last-child') as HTMLDivElement;
            if (preview) {
              preview.style.backgroundColor = value;
            }

            // Update text if present
            const textInput = element.querySelector('input[type="text"]') as HTMLInputElement;
            if (textInput) {
              textInput.value = value;
            }

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

  console.log('Color input component registered');
}

registerColorInputComponent();
