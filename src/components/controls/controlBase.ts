/**
 * Control Base Component
 *
 * Purpose: Base functionality for UI control components
 * Author: Cody
 * Creation Date: 2023-11-16
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';

// Make sure define type is registered
registerDefineType();

// Base properties for all controls
export interface ControlBaseProps {
  label?: string;
  value: any;
  onChange?: (value: any) => void;
  className?: string;
  style?: Record<string, string>;
  disabled?: boolean;
}

// Create a base control element with common styling
export function createControlElement(props: ControlBaseProps): HTMLElement {
  const container = document.createElement('div');
  container.className = `control-container ${props.className || ''}`;

  // Apply base styles
  Object.assign(container.style, {
    marginBottom: '15px',
    width: '100%',
    ...props.style
  });

  // Add label if provided
  if (props.label) {
    const label = document.createElement('label');
    label.textContent = props.label;
    label.style.display = 'block';
    label.style.marginBottom = '5px';
    label.style.fontWeight = 'normal';
    container.appendChild(label);
  }

  return container;
}

// Register the base control component
export function registerControlBaseComponent() {
  // Register the base control component with the builder
  buildViz({
    type: "define",
    name: "controlBase",
    properties: {
      label: { default: '' },
      value: { required: true },
      onChange: { default: null },
      className: { default: '' },
      style: { default: {} },
      disabled: { default: false }
    },
    implementation: function(props) {
      const container = createControlElement(props);

      return {
        element: container,
        getValue: () => props.value,
        setValue: (value: any) => {
          if (props.onChange) {
            props.onChange(value);
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

  console.log('Control base component registered');
}

registerControlBaseComponent();
