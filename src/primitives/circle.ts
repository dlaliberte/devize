/**
 * Circle Primitive Implementation
 *
 * Purpose: Implements the circle primitive visualization using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { registerDefineType } from '../core/define';
import { buildViz } from '../core/builder';
import { createSVGElement, applyAttributes } from '../renderers/svgUtils';

// Circle type definition
export const circleTypeDefinition = {
  type: "define",
  name: "circle",
  properties: {
    cx: { required: true },
    cy: { required: true },
    r: { required: true },
    fill: { default: "none" },
    stroke: { default: "black" },
    strokeWidth: { default: 1 }
  },
  implementation: props => {
    // Validation
    if (props.r <= 0) {
      throw new Error('Circle radius must be positive');
    }

    // Prepare attributes
    const attributes = {
      cx: props.cx,
      cy: props.cy,
      r: props.r,
      fill: props.fill,
      stroke: props.stroke,
      'stroke-width': props.strokeWidth
    };

    // Return a specification with rendering functions
    return {
      _renderType: "circle",  // Internal rendering type
      attributes: attributes,

      // Rendering functions for different backends
      renderSVG: (container) => {
        const element = createSVGElement('circle');
        applyAttributes(element, attributes);
        if (container) container.appendChild(element);
        return element;
      },

      renderCanvas: (ctx) => {
        const { cx, cy, r, fill, stroke, 'stroke-width': strokeWidth } = attributes;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);

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
 * Register the circle primitive
 */
export function registerCirclePrimitive() {
  // Make sure define type is registered
  registerDefineType();

  // Define the circle type using buildViz
  buildViz(circleTypeDefinition);
}

// Auto-register when this module is imported
registerCirclePrimitive();

/**
 * References:
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.js
 * - Related File: src/renderers/canvasUtils.js
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/shapes.md
 * - Test Cases: tests/primitives/circle.test.js
 */
