/**
 * Layer Primitive Implementation
 *
 * Purpose: Implements the layer container primitive using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { registerDefineType } from '../core/define';
import { buildViz } from '../core/builder';
import { createSVGElement, applyAttributes } from '../renderers/svgUtils';
import { RenderableVisualization, VisualizationSpec } from '../core/types';
import { groupTypeDefinition } from './group';

// Layer type definition
export const layerTypeDefinition = {
  type: "define",
  name: "layer",
  properties: {
    ...groupTypeDefinition.properties,
    zIndex: { default: 0 }
  },
  implementation: props => {
    // Create a group with the same properties
    const groupProps = { ...props };
    delete groupProps.type;  // Avoid an infinte loop
    delete groupProps.zIndex; // Remove zIndex as it's not in group properties

    // Build the group visualization
    const groupViz = buildViz({
      type: 'group',
      ...groupProps
    });

    // Get the original renderToSvg and renderToCanvas functions
    const originalRenderToSvg = groupViz.renderToSvg;
    const originalRenderToCanvas = groupViz.renderToCanvas;

    // Create a renderable visualization based on the group
    const renderable: RenderableVisualization = {
      renderableType: "layer",

      render: (container: HTMLElement) => {
        // Use the group's render method
        const result = groupViz.render(container);

        // Apply z-index if specified
        if (props.zIndex !== 0 && result.element) {
          // Set z-index directly as an attribute instead of using style property
          result.element.setAttribute('style', `z-index: ${props.zIndex}`);
        }

        // Return result with modified update function
        return {
          ...result,
          update: (newSpec: VisualizationSpec) => {
            // Create a new spec by merging the original with the updates
            const updatedSpec = {
              type: 'layer',
              ...props,
              ...newSpec
            };

            // Build and render the updated visualization
            const updatedViz = buildViz(updatedSpec);
            return updatedViz.render(container);
          }
        };
      },

      // Override renderToSvg to add z-index
      renderToSvg: (svg: SVGElement) => {
        const element = originalRenderToSvg(svg);

        // Apply z-index if specified
        if (props.zIndex !== 0) {
          // Set z-index directly as an attribute instead of using style property
          element.setAttribute('style', `z-index: ${props.zIndex}`);
        }

        return element;
      },

      // Override renderToCanvas to handle z-index (though it doesn't affect canvas rendering)
      renderToCanvas: (ctx: CanvasRenderingContext2D) => {
        // Canvas doesn't support z-index, so we just use the group's renderToCanvas
        return originalRenderToCanvas(ctx);
      },

      // Update with a new specification
      update: (newSpec: VisualizationSpec) => {
        // Merge the new spec with the original spec
        const mergedSpec = {
          type: 'layer',
          ...props,
          ...newSpec
        };

        return buildViz(mergedSpec);
      },

      // Get a property value
      getProperty: (name: string) => {
        if (name === 'zIndex') {
          return props.zIndex !== undefined ? props.zIndex : 0;
        }
        if (name === 'type') return 'layer';

        // Delegate to group for other properties
        return groupViz.getProperty(name);
      }
    };

    return renderable;
  }
};

/**
 * Register the layer primitive
 */
export function registerLayerType() {
  // Make sure define type is registered
  registerDefineType();

  // Define the layer type using buildViz
  buildViz(layerTypeDefinition);
}

// Auto-register when this module is imported
registerLayerType();

/**
 * References:
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.ts
 * - Related File: src/primitives/group.ts
 * - Related File: src/primitives/circle.ts
 * - Related File: src/primitives/rectangle.ts
 * - Related File: src/primitives/text.ts
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/layer.md
 * - Test Cases: src/primitives/layers.test.ts
 */
