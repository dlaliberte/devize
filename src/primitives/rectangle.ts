/**
 * Rectangle Primitive Implementation
 *
 * Purpose: Implements the rectangle primitive visualization using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { registerDefineType } from '../core/define';
import { buildViz } from '../core/builder';
import { createSVGElement, applyAttributes } from '../renderers/svgUtils';

// Rectangle type definition
export const rectangleTypeDefinition = {
  type: "define",
  name: "rectangle",
  properties: {
    x: { default: 0 },
    y: { default: 0 },
    width: { required: true },
    height: { required: true },
    fill: { default: "none" },
    stroke: { default: "black" },
    strokeWidth: { default: 1 },
    cornerRadius: { default: 0 }
  },
  implementation: props => {
    // Validation
    if (props.width <= 0 || props.height <= 0) {
      throw new Error('Rectangle width and height must be positive');
    }

    // Prepare attributes
    const attributes = {
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
      fill: props.fill,
      stroke: props.stroke,
      'stroke-width': props.strokeWidth,
      rx: props.cornerRadius,
      ry: props.cornerRadius
    };

    // Return a specification with rendering functions
    return {
      _renderType: "rect",  // Internal rendering type
      attributes: attributes,

      // Rendering functions for different backends
      renderSVG: (container) => {
        const element = createSVGElement('rect');
        applyAttributes(element, attributes);
        if (container) container.appendChild(element);
        return element;
      },

      renderCanvas: (ctx) => {
        const { x, y, width, height, fill, stroke, 'stroke-width': strokeWidth, rx: cornerRadius } = attributes;

        ctx.beginPath();

        if (cornerRadius > 0) {
          // Draw rounded rectangle
          ctx.moveTo(x + cornerRadius, y);
          ctx.lineTo(x + width - cornerRadius, y);
          ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
          ctx.lineTo(x + width, y + height - cornerRadius);
          ctx.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);
          ctx.lineTo(x + cornerRadius, y + height);
          ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
          ctx.lineTo(x, y + cornerRadius);
          ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
        } else {
          // Draw regular rectangle
          ctx.rect(x, y, width, height);
        }

        if (fill !== 'none') {
          ctx.fillStyle = fill;
          ctx.fill();
        }

        if (stroke !== 'none') {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
        }

        return true; // Indicate successful rendering
      },

      // WebGL rendering function could be added here
      renderWebGL: (gl, program) => {
        // WebGL-specific rendering code
      }
    };
  }
};

/**
 * Register the rectangle primitive
 */
export function registerRectanglePrimitive() {
  // Make sure define type is registered
  registerDefineType();

  // Define the rectangle type using buildViz
  buildViz(rectangleTypeDefinition);
}

// Auto-register when this module is imported
registerRectanglePrimitive();

/**
 * References:
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.ts
 * - Related File: src/primitives/circle.ts
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/shapes.md
 * - Test Cases: src/primitives/rectangle.test.ts
 */
