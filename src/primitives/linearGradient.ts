/**
 * Linear Gradient Primitive
 *
 * Purpose: Creates a linear gradient definition for use in fills
 * Author: Devize Team
 * Creation Date: 2023-12-22
 */

import { registerDefineType } from '../core/define';
import { buildViz } from '../core/builder';
import { createSVGElement, applyAttributes } from '../renderers/svgUtils';

import { createRenderableVisualizationEnhanced } from '../core/componentUtils';

// Make sure define type is registered
registerDefineType();

// Define the linearGradient component
export const linearGradientDefinition = {
  type: "define",
  name: "linearGradient",
  properties: {
    id: { required: true },
    x1: { default: '0%' },
    y1: { default: '0%' },
    x2: { default: '100%' },
    y2: { default: '0%' },
    spreadMethod: { default: 'pad' },
    stops: {
      required: true,
      validate: (stops: Array<{ offset: string, color: string, opacity?: number }>) => {
        if (!Array.isArray(stops) || stops.length < 2) {
          throw new Error('At least two gradient stops must be provided');
        }

        stops.forEach((stop, index) => {
          if (!stop.offset || !stop.color) {
            throw new Error(`Gradient stop at index ${index} must have offset and color properties`);
          }
        });
      }
    }
  },
  implementation: function(props: any) {
    const { id, x1, y1, x2, y2, spreadMethod, stops } = props;

    // Validation
    if (!id) {
      throw new Error('Gradient id is required');
    }

    // Prepare attributes for the linearGradient element
    const gradientAttributes = {
      id,
      x1,
      y1,
      x2,
      y2,
      spreadMethod
    };

    // SVG rendering function
    const renderToSvg = (svg: SVGElement) => {
      console.log('Rendering linearGradient to SVG:', svg);

      // First, find or create a defs element
      let defs = svg.querySelector('defs');
      if (!defs) {
        defs = createSVGElement('defs');
        svg.appendChild(defs);
      }

      // Create a linearGradient element
      const gradient = createSVGElement('linearGradient');

      // Apply attributes to the gradient
      Object.entries(gradientAttributes).forEach(([key, value]) => {
        if (value !== undefined) {
          gradient.setAttribute(key, value.toString());
        }
      });

      // Create and add stops
      stops.forEach((stop: any) => {
        const stopElement = createSVGElement('stop');
        stopElement.setAttribute('offset', stop.offset);
        stopElement.setAttribute('stop-color', stop.color);

        if (stop.opacity !== undefined) {
          stopElement.setAttribute('stop-opacity', stop.opacity.toString());
        }

        gradient.appendChild(stopElement);
      });

      // Add the gradient to defs
      defs.appendChild(gradient);

      return gradient;
    };

    // Canvas rendering function - not directly applicable for gradients
    // but we need to provide a placeholder implementation
    const renderToCanvas = (ctx: CanvasRenderingContext2D) => {
      // Canvas gradients are created differently and applied directly to shapes
      // This is just a placeholder - actual implementation would depend on how
      // we handle gradients in the canvas renderer
      console.log('LinearGradient renderToCanvas called - not directly applicable');
      return true;
    };

    // Create and return a renderable visualization
    return createRenderableVisualizationEnhanced('linearGradient', props, {renderToSvg, renderToCanvas});
  }
};

// Register the linearGradient component
buildViz(linearGradientDefinition);

/**
 * Create a linear gradient directly
 *
 * @param options Linear gradient configuration options
 * @returns A renderable linear gradient definition
 */
export function createLinearGradient(options: {
  id: string,
  x1?: string,
  y1?: string,
  x2?: string,
  y2?: string,
  spreadMethod?: 'pad' | 'reflect' | 'repeat',
  stops: Array<{ offset: string, color: string, opacity?: number }>
}) {
  return buildViz({
    type: 'linearGradient',
    ...options
  });
}
