/**
 * Group Primitive Implementation
 *
 * Purpose: Implements the group container primitive using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../core/devize';
import { createSVGElement } from '../renderers/svgUtils';
import { processVisualization } from '../core/processor';

// Define the group type
buildViz({
  type: "define",
  name: "group",
  properties: {
    x: { default: 0 },
    y: { default: 0 },
    children: { default: [] },
    transform: { default: null }
  },
  implementation: props => {
    // Process all children
    const processedChildren = Array.isArray(props.children)
      ? props.children.map(child => processVisualization(child))
      : [];

    // Prepare transform attribute
    const transformAttr = props.transform
      ? `translate(${props.x}, ${props.y}) ${props.transform}`
      : `translate(${props.x}, ${props.y})`;

    // Prepare attributes
    const attributes = {
      transform: transformAttr
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

        // Apply transform
        if (attributes.transform) {
          groupElement.setAttribute('transform', attributes.transform);
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

        // Render all children in this context
        processedChildren.forEach(child => {
          if (child.renderCanvas) {
            child.renderCanvas(ctx);
          }
        });

        // Restore the context state
        ctx.restore();

        return true;
      }
    };
  }
});

/**
 * References:
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/processor.ts
 * - Related File: src/core/renderer.ts
 * - Related File: src/renderers/svgUtils.js
 * - Design Document: design/rendering.md
 * - Design Document: design/primitive_implementation.md
 * - User Documentation: docs/primitives/group.md
 * - Test Cases: tests/primitives/group.test.js
 */
