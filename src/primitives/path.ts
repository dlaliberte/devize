  /**
 * Path Primitive Implementation
 *
 * Purpose: Implements the path primitive visualization using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { registerDefineType } from '../core/define';
import { buildViz } from '../core/creator';
import { createSVGElement, applyAttributes } from '../renderers/svgUtils';

// Make sure define type is registered
registerDefineType();

// Define path primitive
buildViz({
  type: "define",
  name: "path",
  properties: {
    d: { required: true },
    fill: { default: "none" },
    stroke: { default: "black" },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: "" },
    opacity: { default: 1 }
  },
  implementation: props => {
    // Prepare attributes
    const attributes = {
      d: props.d,
      fill: props.fill,
      stroke: props.stroke,
      'stroke-width': props.strokeWidth,
      'stroke-dasharray': props.strokeDasharray || null,
      opacity: props.opacity
    };

    // Return a specification with rendering functions
    return {
      _renderType: "path",  // Internal rendering type
      attributes: attributes,

      // Rendering functions for different backends
      renderSVG: (container) => {
        const element = createSVGElement('path');
        applyAttributes(element, attributes);
        if (container) container.appendChild(element);
        return element;
      },

      renderCanvas: (ctx) => {
        const { d, fill, stroke, 'stroke-width': strokeWidth, 'stroke-dasharray': strokeDasharray, opacity } = attributes;

        // Save the current context state
        ctx.save();

        // Apply opacity
        ctx.globalAlpha = opacity;

        // Create a new path
        ctx.beginPath();

        try {
          // Parse the SVG path data and draw to canvas
          const path = new Path2D(d);

          // Apply fill if not 'none'
          if (fill && fill !== 'none') {
            ctx.fillStyle = fill;
            ctx.fill(path);
          }

          // Apply stroke
          if (stroke && stroke !== 'none') {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;

            // Apply stroke dash array if specified
            if (strokeDasharray) {
              const dashArray = strokeDasharray.split(',').map(Number);
              ctx.setLineDash(dashArray);
            } else {
              ctx.setLineDash([]);
            }

            ctx.stroke(path);
          }
        } catch (error) {
          console.error('Error rendering path:', error);
        }

        // Restore the context state
        ctx.restore();

        return true; // Indicate successful rendering
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
 * - Test Cases: tests/primitives/path.test.js
 */
