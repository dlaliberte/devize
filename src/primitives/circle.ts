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

// Make sure define type is registered
registerDefineType();

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

    // Return a renderable object with SVG rendering functions
    return {
      type: "circle",
      spec: props,

      // Render to a container (creates an SVG if needed)
      render: function(container) {
        // Ensure there's an SVG element
        const svg = ensureSvg(container);

        // Render to the SVG
        const element = this.renderToSvg(svg);

        // Return the result
        return {
          element,
          update: (newSpec) => {
            // Update the element attributes
            Object.entries(newSpec).forEach(([key, value]) => {
              if (key !== 'type') {
                element.setAttribute(key === 'strokeWidth' ? 'stroke-width' : key, value);
              }
            });

            return this;
          },
          cleanup: () => {
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            }
          }
        };
      },

      // Render to an existing SVG element
      renderToSvg: function(svg) {
        // Create a circle element
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

        // Set attributes
        circle.setAttribute('cx', props.cx);
        circle.setAttribute('cy', props.cy);
        circle.setAttribute('r', props.r);
        circle.setAttribute('fill', props.fill);
        circle.setAttribute('stroke', props.stroke);
        circle.setAttribute('stroke-width', props.strokeWidth);

        // Add to the SVG
        svg.appendChild(circle);

        return circle;
      },

      // Render to a canvas context
      renderCanvas: function(ctx) {
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
      }
    };
  }
};

/**
 * Register the circle primitive
 */
export function registerCirclePrimitive() {
  // Register the circle type
  buildViz(circleTypeDefinition);
  console.log('Circle primitive registered');
}

// Auto-register the circle primitive
registerCirclePrimitive();
