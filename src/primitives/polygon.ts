/**
 * Polygon Primitive Implementation
 *
 * Purpose: Implements the polygon primitive visualization using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { registerDefineType } from '../core/define';
import { buildViz } from '../core/builder';
import { createSVGElement } from '../renderers/svgUtils';
import { RenderableVisualization, VisualizationSpec } from '../core/types';
import { createRenderableVisualizationEnhanced } from '../core/componentUtils';

// Polygon type definition
export const polygonTypeDefinition = {
  type: "define",
  name: "polygon",
  properties: {
    points: { required: true }, // Array of {x, y} points
    fill: { default: "none" },
    stroke: { default: "black" },
    strokeWidth: { default: 1 },
    opacity: { default: 1 },
    class: { default: '' }
  },
  implementation: props => {
    // Validation
    if (!Array.isArray(props.points) || props.points.length < 3) {
      console.warn('Polygon should have at least 3 points for proper rendering');
    }

    // Convert points array to SVG points string format
    const pointsString = props.points.map(p => `${p.x},${p.y}`).join(' ');

    // Prepare attributes
    const attributes = {
      points: pointsString,
      fill: props.fill,
      stroke: props.stroke,
      'stroke-width': props.strokeWidth,
      opacity: props.opacity,
      class: props.class
    };

    // SVG rendering function
    const renderToSvg = (svg: SVGElement) => {
      // Create a polygon element with the correct namespace
      const element = createSVGElement('polygon');

      // Apply attributes explicitly
      element.setAttribute('points', attributes.points);
      element.setAttribute('fill', attributes.fill);
      element.setAttribute('stroke', attributes.stroke);
      element.setAttribute('stroke-width', attributes['stroke-width'].toString());
      element.setAttribute('opacity', attributes.opacity.toString());

      if (attributes.class) {
        element.setAttribute('class', attributes.class);
      }

      // Add to the SVG
      if (svg) {
        svg.appendChild(element);
      }

      return element;
    };

    // Canvas rendering function
    const renderToCanvas = (ctx: CanvasRenderingContext2D) => {
      const { points } = props;
      const { fill, stroke, 'stroke-width': strokeWidth, opacity } = attributes;

      if (!points || points.length < 2) return false;

      // Save current context state
      ctx.save();

      // Set opacity if needed
      if (opacity !== 1) {
        ctx.globalAlpha = opacity;
      }

      // Begin the path
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      // Draw lines to each point
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      // Close the path
      ctx.closePath();

      // Fill if needed
      if (fill !== 'none') {
        ctx.fillStyle = fill;
        ctx.fill();
      }

      // Stroke if needed
      if (stroke !== 'none') {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }

      // Restore context state
      ctx.restore();

      return true; // Indicate successful rendering
    };

    // Create and return a renderable visualization
    return createRenderableVisualizationEnhanced(
      'polygon',
      props,
     { renderToSvg,
      renderToCanvas}
    );
  }
};

/**
 * Register the polygon primitive
 */
export function registerPolygonPrimitive() {
  // Make sure define type is registered
  registerDefineType();

  // Define the polygon type using buildViz
  buildViz(polygonTypeDefinition);
}

// Auto-register when this module is imported
registerPolygonPrimitive();

/**
 * References:
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.ts
 * - Related File: src/primitives/rectangle.ts
 * - Related File: src/primitives/circle.ts
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/shapes.md
 * - Test Cases: src/primitives/polygon.test.ts
 */
