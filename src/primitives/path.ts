  /**
 * Path Primitive Implementation
 *
 * Purpose: Implements the path primitive visualization using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createSVGElement } from '../renderers/svgUtils';
import { createRenderableVisualization } from '../core/componentUtils';

// Path type definition
export const pathTypeDefinition = {
  type: "define",
  name: "path",
  properties: {
    d: { required: true },
    fill: { default: "none" },
    stroke: { default: "black" },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: "none" },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Apply default values for optional properties
    const fullProps = {
      ...props,
      fill: props.fill ?? "none",
      stroke: props.stroke ?? "black",
      strokeWidth: props.strokeWidth ?? 1,
      strokeDasharray: props.strokeDasharray ?? "none",
      opacity: props.opacity ?? 1
    };

    // Prepare attributes
    const attributes = {
      d: fullProps.d,
      fill: fullProps.fill,
      stroke: fullProps.stroke,
      'stroke-width': fullProps.strokeWidth,
      'stroke-dasharray': fullProps.strokeDasharray === 'none' ? null : fullProps.strokeDasharray,
      opacity: fullProps.opacity
    };

    // SVG rendering function
    const renderToSvg = (svg: SVGElement) => {
      // Create a path element with the correct namespace
      const element = createSVGElement('path');

      // Add class for test selection
      element.setAttribute('class', 'path');

      // Apply attributes explicitly to ensure they're set correctly for tests
      element.setAttribute('d', attributes.d);
      element.setAttribute('fill', attributes.fill);
      element.setAttribute('stroke', attributes.stroke);
      element.setAttribute('stroke-width', attributes['stroke-width'].toString());

      if (attributes['stroke-dasharray'] !== null) {
        element.setAttribute('stroke-dasharray', attributes['stroke-dasharray']);
      }

      element.setAttribute('opacity', attributes.opacity.toString());

      // Add to the SVG
      if (svg) {
        svg.appendChild(element);
      }

      return element;
    };

    // Canvas rendering function
    const renderToCanvas = (ctx: CanvasRenderingContext2D) => {
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
    };

    // Create and return a renderable visualization
    return createRenderableVisualization(
      'path',
      props,
      renderToSvg,
      renderToCanvas
    );
  }
};

/**
 * Register the path primitive
 */
export function registerPathPrimitive() {
  // Make sure define type is registered
  registerDefineType();

  // Define the path type using buildViz
  buildViz(pathTypeDefinition);
}

// Auto-register when this module is imported
registerPathPrimitive();

/**
 * References:
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.js
 * - Related File: src/renderers/canvasUtils.js
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/shapes.md
 * - Test Cases: tests/primitives/path.test.js
 */
