/**
 * Line Primitive Implementation
 *
 * Purpose: Implements the line primitive visualization using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createSVGElement } from '../renderers/svgUtils';
import { createRenderableVisualizationEnhanced } from '../core/componentUtils';

// Line type definition
export const lineTypeDefinition = {
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
  implementation: function(props) {
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

    // SVG rendering function
    const renderToSvg = (svg: SVGElement) => {
      // Create a line element with the correct namespace
      const element = createSVGElement('line');

      // Apply attributes explicitly
      element.setAttribute('x1', attributes.x1.toString());
      element.setAttribute('y1', attributes.y1.toString());
      element.setAttribute('x2', attributes.x2.toString());
      element.setAttribute('y2', attributes.y2.toString());
      element.setAttribute('stroke', attributes.stroke);
      element.setAttribute('stroke-width', attributes['stroke-width'].toString());

      // Only set stroke-dasharray if it's not null
      if (attributes['stroke-dasharray'] !== null) {
        element.setAttribute('stroke-dasharray', attributes['stroke-dasharray']);
      }

      // Add to the SVG
      if (svg) {
        svg.appendChild(element);
      }

      return element;
    };

    // Canvas rendering function
    const renderToCanvas = (ctx: CanvasRenderingContext2D) => {
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
    };

    // Create and return a renderable visualization
    return createRenderableVisualizationEnhanced(
      'line',
      props,
      {renderToSvg,
      renderToCanvas}
    );
  }
};

/**
 * Register the line primitive
 */
export function registerLinePrimitive() {
  // Make sure define type is registered
  registerDefineType();

  // Define the line type using buildViz
  buildViz(lineTypeDefinition);
}

// Auto-register when this module is imported
registerLinePrimitive();

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
 * - Test Cases: tests/primitives/line.test.js
 */
