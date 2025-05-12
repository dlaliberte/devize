/**
 * Component Utilities
 *
 * Purpose: Provides shared utilities for component definitions
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from './builder';
import { RenderableVisualization, VisualizationSpec } from './types';
import { ensureSvg } from '../core/renderer';

/**
 * Creates a standard render function for a component
 *
 * @param renderToSvg The component-specific SVG rendering function
 * @returns A standard render function
 */
export function createRenderFunction(renderableViz: RenderableVisualization) {
  return (container: HTMLElement) => {
    // Create SVG if needed
    let svg = container.querySelector('svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      container.appendChild(svg);
    }

    // Render to SVG
    const element = renderableViz.renderToSvg(svg as SVGElement);

    // Return result
    return {
      element,
      update: (newSpec: VisualizationSpec) => {
        const updatedViz = renderableViz.update(newSpec);
        return updatedViz.render(container);
      },
      cleanup: () => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }
    };
  };
}

/**
 * Creates a standard update function for a component
 *
 * @param props The current component properties
 * @returns A standard update function
 */
export function createUpdateFunction(props: VisualizationSpec) {
  return (newSpec: VisualizationSpec) => {
    // Merge the new spec with the original spec
    const mergedSpec = {
      type: props.type,
      ...props,
      ...newSpec
    };

    return buildViz(mergedSpec);
  };
}

/**
 * Creates a standard getProperty function for a component
 *
 * @param props The component properties
 * @returns A standard getProperty function
 */
export function createGetPropertyFunction(props: VisualizationSpec) {
  return (name: string) => {
    if (name === 'type') return props.type;
    return props[name];
  };
}

/**
 * Create a renderable visualization with standard methods
 */
export function createRenderableVisualization(
  type: string,
  props: any,
  renderToSvgFn: (container: SVGElement) => SVGElement,
  renderToCanvasFn: (ctx: CanvasRenderingContext2D) => boolean
): RenderableVisualization {
  return {
    renderableType: type,
    spec: props,

    // Get a property from the spec
    getProperty: function(key: string) {
      return props[key];
    },

    // Render to a container
    render: function(container: HTMLElement) {
      // Create an SVG element if needed
      let svg = container.querySelector('svg');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        container.appendChild(svg);
      }

      // Clear existing content
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      // Render to the SVG
      const element = this.renderToSvg(svg);

      // Return the result
      return {
        element,
        update: (newSpec: any) => {
          // Create an updated visualization
          const updatedViz = this.update(newSpec);

          // Render it to the same container
          return updatedViz.render(container);
        },
        cleanup: () => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        }
      };
    },

    // Render to an SVG element
    renderToSvg: renderToSvgFn,

    // Render to a canvas context
    renderToCanvas: renderToCanvasFn,

    // Update the visualization with new properties
    update: function(newSpec: any) {
      // Create a merged spec
      const mergedSpec = { ...props, ...newSpec };

      // Build a new visualization with the merged spec
      return buildViz({
        type,
        ...mergedSpec
      });
    }
  };
}

/**
 * References:
 * - Related File: src/core/builder.ts
 * - Related File: src/core/types.ts
 * - Related File: src/primitives/text.ts
 * - Related File: src/primitives/circle.ts
 * - Related File: src/primitives/rectangle.ts
 * - Related File: src/primitives/group.ts
 */
