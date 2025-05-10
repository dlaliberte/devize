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
import { createSVGElement, applyAttributes } from '../renderers/svgUtils';
import { RenderableVisualization, VisualizationSpec } from '../core/types';

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
            const textContent = child.toString();
            return buildViz({
              type: 'text',
              text: textContent,
              x: 0,
              y: 0,
              fontSize: 12,  // Add default font size
              fontFamily: 'sans-serif',  // Add default font family
              fill: 'black'  // Add default fill color
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

    // Create a renderable visualization
    const renderable: RenderableVisualization = {
      renderableType: "group",

      render: (container: HTMLElement) => {
        // Create SVG if needed
        let svg = container.querySelector('svg');
        if (!svg) {
          svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          container.appendChild(svg);
        }

        // Render to SVG
        const element = renderable.renderToSvg(svg as SVGElement);

        // Return result
        return {
          element,
          update: (newSpec: VisualizationSpec) => {
            // Create a new spec by merging the original with the updates
            const updatedSpec = {
              type: 'group',
              ...props,
              ...newSpec
            };

            // Build and render the updated visualization
            const updatedViz = buildViz(updatedSpec);
            return updatedViz.render(container);
          },
          cleanup: () => {
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            }
          }
        };
      },

      // SVG rendering function
      renderToSvg: (svg: SVGElement) => {
        const element = createSVGElement('g');

        // Apply attributes - not working
        // applyAttributes(element, attributes);

        for (const [key, value] of Object.entries(attributes)) {
          if (value !== undefined && value !== null) {
            element.setAttribute(key, value.toString());
          }
        }


        // Ensure class is applied
        if (props.class) {
          element.setAttribute('class', props.class);
        }

        // Render children
        if (processedChildren) {
          for (const child of processedChildren) {
            if (child && child.renderToSvg) {
              child.renderToSvg(element);
            }
          }
        }

        if (svg) {
          svg.appendChild(element);
        }

        return element;
      },

      // Canvas rendering function
      renderToCanvas: (ctx: CanvasRenderingContext2D) => {
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
          if (child.renderToCanvas) {
            child.renderToCanvas(ctx);
          }
        });

        // Restore the context state
        ctx.restore();

        return true; // Indicate successful rendering
      },

      // Update with a new specification
      update: (newSpec: VisualizationSpec) => {
        // Merge the new spec with the original spec
        const mergedSpec = {
          type: 'group',
          ...props,
          ...newSpec
        };

        return buildViz(mergedSpec);
      },

      // Get a property value
      getProperty: (name: string) => {
        if (name === 'children') {
          return processedChildren;
        }
        if (name === 'type') return 'group';
        return props[name];
      }
    };

    return renderable;
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
