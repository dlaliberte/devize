/**
 * Text Primitive Implementation
 *
 * Purpose: Implements the text primitive visualization using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { registerDefineType } from '../core/define';
import { buildViz } from '../core/builder';
import { createSVGElement, applyAttributes } from '../renderers/svgUtils';

// Text type definition
export const textTypeDefinition = {
  type: "define",
  name: "text",
  properties: {
    x: { default: 0 },
    y: { default: 0 },
    text: { required: true },
    fontSize: { default: 12 },
    fontFamily: { default: 'sans-serif' },
    fontWeight: { default: 'normal' },
    fill: { default: 'black' },
    textAnchor: { default: 'start' },
    dominantBaseline: { default: 'auto' },
    opacity: { default: 1 },
    transform: { default: '' }
  },
  implementation: props => {
    // Prepare attributes
    const attributes = {
      x: props.x,
      y: props.y,
      'font-size': props.fontSize,
      'font-family': props.fontFamily,
      'font-weight': props.fontWeight,
      fill: props.fill,
      'text-anchor': props.textAnchor,
      'dominant-baseline': props.dominantBaseline,
      opacity: props.opacity,
      transform: props.transform || null
    };

    // Return a specification with rendering functions
    return {
      _renderType: "text",  // Internal rendering type
      type: "text",         // Public type
      attributes: attributes,
      content: props.text,  // Text content

      // Rendering functions for different backends
      renderToSvg: (container) => {
        const element = createSVGElement('text');
        applyAttributes(element, attributes);
        element.textContent = props.text;
        if (container) container.appendChild(element);
        return element;
      },

      renderCanvas: (ctx) => {
        const { x, y, 'font-size': fontSize, 'font-family': fontFamily, 'font-weight': fontWeight,
                fill, 'text-anchor': textAnchor, 'dominant-baseline': dominantBaseline, opacity } = attributes;

        // Save the current context state
        ctx.save();

        // Apply opacity
        ctx.globalAlpha = opacity;

        // Set font - ensure fontWeight is included
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
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

        // Apply transform if specified
        if (props.transform) {
          // Parse and apply SVG transform to canvas context
          // This is a simplified implementation and may not handle all transform types
          const transformStr = props.transform.trim();
          if (transformStr.startsWith('translate')) {
            const match = transformStr.match(/translate\(([^,]+),([^)]+)\)/);
            if (match) {
              const tx = parseFloat(match[1]);
              const ty = parseFloat(match[2]);
              ctx.translate(tx, ty);
            }
          } else if (transformStr.startsWith('rotate')) {
            const match = transformStr.match(/rotate\(([^)]+)\)/);
            if (match) {
              const angle = parseFloat(match[1]) * Math.PI / 180;
              ctx.rotate(angle);
            }
          }
          // Additional transform types could be handled here
        }

        // Draw the text
        ctx.fillText(props.text, x, y);

        // Restore the context state
        ctx.restore();

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
 * Register the text primitive
 */
export function registerTextPrimitive() {
  // Make sure define type is registered
  registerDefineType();

  // Define the text type using buildViz
  buildViz(textTypeDefinition);
}

// Auto-register when this module is imported
registerTextPrimitive();

/**
 * References:
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.ts
 * - Related File: src/primitives/circle.ts
 * - Related File: src/primitives/rectangle.ts
 * - Related File: src/primitives/group.ts
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/shapes.md
 * - Test Cases: src/primitives/text.test.ts
 */
