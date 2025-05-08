/**
 * Group Primitive Implementation
 *
 * Purpose: Implements the group container primitive using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { registerDefineType } from '../core/define';
import { buildViz } from '../core/builder';
import { createSVGElement } from '../renderers/svgUtils';


// Group type definition
export const groupTypeDefinition = {
  type: "define",
  name: "group",
  properties: {
    x: { default: 0 },
    y: { default: 0 },
    children: { default: [] },
    transform: { default: null },
    opacity: { default: 1 }
  },
  implementation: props => {
    // Process all children
    const processedChildren = Array.isArray(props.children)
      ? props.children.map(child => {
          // If child is a string or number, convert to a text node
          if (typeof child === 'string' || typeof child === 'number') {
            return buildViz({
              type: 'text',
              text: child.toString(),
              x: 0,
              y: 0
            });
          }
          return buildViz(child);
        })
      : [];

    // Prepare transform attribute
    const transformAttr = props.transform
      ? `translate(${props.x}, ${props.y}) ${props.transform}`
      : `translate(${props.x}, ${props.y})`;

    // Prepare attributes
    const attributes = {
      transform: transformAttr,
      opacity: props.opacity
    };

    // Return a specification with rendering functions
    return {
      _renderType: "group",
      attributes,
      children: processedChildren,

      // SVG rendering function
      renderSVG: (container) => {
        // Create a group element
        const groupElement = createSVGElement('g');

        // Apply attributes
        for (const [key, value] of Object.entries(attributes)) {
          if (value !== undefined && value !== null) {
            groupElement.setAttribute(key, value.toString());
          }
        }

        // Render all children into this group
        processedChildren.forEach(child => {
          if (child.renderSVG) {
            child.renderSVG(groupElement);
          }
        });

        // Append to container if provided
        if (container) {
          container.appendChild(groupElement);
        }

        return groupElement;
      },

      // Canvas rendering function
      renderCanvas: (ctx) => {
        // Save the current context state
        ctx.save();

        // Apply transform
        ctx.translate(props.x, props.y);

        // Apply additional transform if specified
        if (props.transform) {
          // Parse and apply the transform
          // This is simplified; a real implementation would need to parse the transform string
          // and apply the appropriate Canvas transformations
        }

        // Apply opacity
        if (typeof ctx.globalAlpha !== 'undefined') {
          const originalAlpha = ctx.globalAlpha || 1;
          ctx.globalAlpha = originalAlpha * props.opacity;
        }

        // Render all children in this context
        processedChildren.forEach(child => {
          if (child.renderCanvas) {
            child.renderCanvas(ctx);
          }
        });

        // Restore the context state
        ctx.restore();

        return true; // Indicate successful rendering
      }
    };
  }
};

/**
 * Register the group primitive
 */
export function registerGroupPrimitive() {
  // Make sure define type is registered
  registerDefineType();

  // Define the group type using buildViz
  buildViz(groupTypeDefinition);
}

// Auto-register when this module is imported
registerGroupPrimitive();

/**
 * References:
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.ts
 * - Related File: src/primitives/circle.ts
 * - Related File: src/primitives/rectangle.ts
 * - Related File: src/primitives/text.ts
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/group.md
 * - Test Cases: src/primitives/group.test.ts
 */
