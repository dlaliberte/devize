/**
 * Circle Primitive Implementation
 *
 * Purpose: Implements the circle primitive visualization using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { ensureSvg } from '../core/renderer';
import { RenderableVisualization, VisualizationSpec } from '../core/types';
import { createSVGElement, applyAttributes } from '../renderers/svgUtils';
import { createRenderableVisualization } from '../core/componentUtils';

// Define the circle type definition
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
  implementation: function(props) {
    // Validate radius is positive
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

    // SVG rendering function
    const renderToSvg = (svg: SVGElement) => {
      console.log('Rendering circle to SVG:', svg);

      // Create a circle element with the correct namespace
      const circle = createSVGElement('circle');

      // Apply attributes explicitly
      circle.setAttribute('cx', attributes.cx.toString());
      circle.setAttribute('cy', attributes.cy.toString());
      circle.setAttribute('r', attributes.r.toString());
      circle.setAttribute('fill', attributes.fill.toString());
      circle.setAttribute('stroke', attributes.stroke.toString());
      circle.setAttribute('stroke-width', attributes['stroke-width'].toString());

      console.log('Created circle element with attributes:', attributes);

      // Add to the SVG
      if (svg) {
        svg.appendChild(circle);
        console.log('Appended circle to SVG, resulting SVG:', svg.outerHTML);
      }

      return circle;
    };

    // Canvas rendering function
    const renderToCanvas = (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.arc(props.cx, props.cy, props.r, 0, Math.PI * 2);

      if (props.fill !== 'none') {
        ctx.fillStyle = props.fill;
        ctx.fill();
      }

      if (props.stroke !== 'none') {
        ctx.strokeStyle = props.stroke;
        ctx.lineWidth = props.strokeWidth;
        ctx.stroke();
      }

      return true; // Indicate successful rendering
    };

    // Create and return a renderable visualization using the utility function
    return createRenderableVisualization('circle', props, renderToSvg, renderToCanvas);
  }
};

/**
 * Register the circle primitive
 */
export function registerCirclePrimitive() {
  // Make sure define type is registered
  registerDefineType();

  // Register the circle type
  buildViz(circleTypeDefinition);
  console.log('Circle primitive registered');
}

// Auto-register the circle primitive
registerCirclePrimitive();
