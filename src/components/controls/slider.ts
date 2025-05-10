/**
 * Slider Control Component
 *
 * Purpose: Provides a slider input control
 * Author: Cody
 * Creation Date: 2023-11-16
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createControlElement, ControlBaseProps } from './controlBase';

// Make sure define type is registered
registerDefineType();

// Slider specific properties
export interface SliderProps extends ControlBaseProps {
  min: number;
  max: number;
  step?: number;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
}

// Create a slider control
export function createSlider(props: SliderProps): HTMLElement {
  const container = createControlElement(props);

  // Create slider container with label
  const sliderContainer = document.createElement('div');
  sliderContainer.style.display = 'flex';
  sliderContainer.style.alignItems = 'center';
  sliderContainer.style.gap = '10px';

  // Create the slider input
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = props.min.toString();
  slider.max = props.max.toString();
  slider.step = (props.step || 1).toString();
  slider.value = props.value.toString();
  slider.style.width = '100%';
  slider.disabled = props.disabled || false;

  // Add event listener
  slider.addEventListener('input', () => {
    const value = parseFloat(slider.value);
    if (props.onChange) {
      props.onChange(value);
    }

    // Update value display if needed
    if (props.showValue && valueDisplay) {
      valueDisplay.textContent = props.valueFormat ? props.valueFormat(value) : value.toString();
    }
  });

  sliderContainer.appendChild(slider);

  // Add value display if needed
  let valueDisplay: HTMLElement | null = null;
  if (props.showValue) {
    valueDisplay = document.createElement('span');
    valueDisplay.style.minWidth = '40px';
    valueDisplay.style.textAlign = 'right';
    valueDisplay.textContent = props.valueFormat
      ? props.valueFormat(props.value)
      : props.value.toString();
    sliderContainer.appendChild(valueDisplay);
  }

  container.appendChild(sliderContainer);

  return container;
}

// Register the slider component
export function registerSliderComponent() {
  buildViz({
    type: "define",
    name: "slider",
    properties: {
      label: { default: '' },
      value: { required: true },
      min: { required: true },
      max: { required: true },
      step: { default: 1 },
      showValue: { default: true },
      valueFormat: { default: null },
      onChange: { default: null },
      className: { default: '' },
      style: { default: {} },
      disabled: { default: false }
    },
    implementation: function(props) {
      const element = createSlider(props);

      return {
        element,
        getValue: () => parseFloat(element.querySelector('input')?.value || props.value),
        setValue: (value: number) => {
          const input = element.querySelector('input');
          if (input) {
            input.value = value.toString();

            // Update value display if needed
            if (props.showValue) {
              const valueDisplay = element.querySelector('span');
              if (valueDisplay) {
                valueDisplay.textContent = props.valueFormat
                  ? props.valueFormat(value)
                  : value.toString();
              }
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

  console.log('Slider component registered');
}

registerSliderComponent();
