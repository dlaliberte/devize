// Text primitive implementations
import { createViz } from '../core/devize.js';
import { createSVGElement, applyAttributes } from '../renderers/svgUtils.js';

// Define text primitives
// export function defineTextPrimitives() {
//   // Define text primitive
//   createViz({
//     type: "define",
//     name: "text",
//     properties: {
//       x: { default: 0 },
//       y: { default: 0 },
//       text: { required: true },
//       fill: { default: "black" },
//       fontSize: { default: 12 },
//       fontFamily: { default: "sans-serif" },
//       fontWeight: { default: "normal" },
//       textAnchor: { default: "start" },
//       dominantBaseline: { default: "auto" },
//       opacity: { default: 1 },
//       transform: { default: "" }
//     },
//     implementation: props => {
//       const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
//       text.setAttribute('x', String(props.x || 0));
//       text.setAttribute('y', String(props.y || 0));

//       if (props.fill) text.setAttribute('fill', props.fill);
//       if (props.fontSize) text.setAttribute('font-size', String(props.fontSize));
//       if (props.fontFamily) text.setAttribute('font-family', props.fontFamily);
//       if (props.fontWeight) text.setAttribute('font-weight', props.fontWeight);
//       if (props.textAnchor) text.setAttribute('text-anchor', props.textAnchor);
//       if (props.dominantBaseline) text.setAttribute('dominant-baseline', props.dominantBaseline);
//       if (props.opacity) text.setAttribute('opacity', String(props.opacity));
//       if (props.transform) text.setAttribute('transform', props.transform);

//       text.textContent = props.text || '';

//       return {
//         element: text,
//         spec: props
//       };
//     }
//   });
// }

/**
 * Text Primitive Implementation
 *
 * Purpose: Implements the text primitive visualization using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */


// Define the text type
createViz({
  type: "define",
  name: "text",
  properties: {
    x: { default: 0 },
    y: { default: 0 },
    text: { required: true },
    fontSize: { default: 12 },
    fontFamily: { default: 'sans-serif' },
    fill: { default: 'black' },
    textAnchor: { default: 'start' },
    dominantBaseline: { default: 'auto' }
  },
  implementation: props => {
    // Prepare attributes
    const attributes = {
      x: props.x,
      y: props.y,
      'font-size': props.fontSize,
      'font-family': props.fontFamily,
      fill: props.fill,
      'text-anchor': props.textAnchor,
      'dominant-baseline': props.dominantBaseline
    };

    // Return a specification with rendering functions
    return {
      _renderType: "text",  // Internal rendering type
      attributes: attributes,
      content: props.text,  // Text content

      // Rendering functions for different backends
      renderSVG: (container) => {
        const element = createSVGElement('text');
        applyAttributes(element, attributes);
        element.textContent = props.text;
        if (container) container.appendChild(element);
        return element;
      },

      renderCanvas: (ctx) => {
        const { x, y, 'font-size': fontSize, 'font-family': fontFamily, fill,
                'text-anchor': textAnchor, 'dominant-baseline': dominantBaseline } = attributes;

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fill;

        // Handle text anchor
        if (textAnchor === 'middle') {
          ctx.textAlign = 'center';
        } else if (textAnchor === 'end') {
          ctx.textAlign = 'right';
        } else {
          ctx.textAlign = 'left';
        }

        // Handle dominant baseline
        if (dominantBaseline === 'middle') {
          ctx.textBaseline = 'middle';
        } else if (dominantBaseline === 'hanging') {
          ctx.textBaseline = 'top';
        } else if (dominantBaseline === 'alphabetic') {
          ctx.textBaseline = 'alphabetic';
        } else {
          ctx.textBaseline = 'alphabetic';
        }

        ctx.fillText(props.text, x, y);

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
 * - Test Cases: tests/primitives/text.test.js
 */
