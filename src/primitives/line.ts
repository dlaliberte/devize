/**
 * Line Primitive Implementation
 *
 * Purpose: Implements the line primitive visualization using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../core/devize.js';
import { createSVGElement, applyAttributes } from '../renderers/svgUtils.js';

// Define the line type
buildViz({
  type: "define",
  name: "line",
  properties: {
    x1: { required: true },
    y1: { required: true },
    x2: { required: true },
    y2: { required: true },
    stroke: { default: "black" },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: "none" }
  },
  implementation: props => {
    // Prepare attributes
    const attributes = {
      x1: props.x1,
      y1: props.y1,
      x2: props.x2,
      y2: props.y2,
      stroke: props.stroke,
      'stroke-width': props.strokeWidth,
      'stroke-dasharray': props.strokeDasharray === 'none' ? null : props.strokeDasharray
    };

    // Return a specification with rendering functions
    return {
      _renderType: "line",  // Internal rendering type
      attributes: attributes,

      // Rendering functions for different backends
      renderToSvg: (container) => {
        const element = createSVGElement('line');
        applyAttributes(element, attributes);
        if (container) container.appendChild(element);
        return element;
      },

      renderCanvas: (ctx) => {
        const { x1, y1, x2, y2, stroke, 'stroke-width': strokeWidth, 'stroke-dasharray': strokeDasharray } = attributes;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;

        if (strokeDasharray && strokeDasharray !== 'none') {
          const dashArray = strokeDasharray.split(',').map(Number);
          ctx.setLineDash(dashArray);
        } else {
          ctx.setLineDash([]);
        }

        ctx.stroke();
        ctx.setLineDash([]);  // Reset dash pattern

        return true; // Indicate successful rendering
      },

      // WebGL rendering function could be added here
      renderWebGL: (gl, program) => {
        // WebGL-specific rendering code
      }
    };
  }
});

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
 * - Test Cases: tests/primitives/line.test.js
 */
