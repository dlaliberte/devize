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
 * Creates a renderable visualization with optional update function
 */
export function createRenderableVisualization(
  renderableType: string,
  props: any,
  renderToSvg: (svg: SVGElement) => SVGElement,
  renderToCanvas: (ctx: CanvasRenderingContext2D) => boolean,
  updateFn?: (element: SVGElement, newProps: any) => SVGElement
) {
  // Store the original properties
  const originalProps = { ...props };

  // Create the renderable object
  const renderable: RenderableVisualization = {
    renderableType,

    // Property getter
    getProperty: (name: string) => {
      return originalProps[name];
    },

    // SVG rendering function
    renderToSvg,

    // Canvas rendering function
    renderToCanvas,

    // Render to a container
    render: (container: HTMLElement) => {
      // Create or get SVG element
      const svg = ensureSvg(container);

      // Render the element
      const element = renderToSvg(svg);

      // Return an object with update method
      return {
        element,
        update: (newProps: any) => {
          if (updateFn) {
            // Use the provided update function
            updateFn(element, newProps);
          } else {
            // Default update behavior
            // Remove the old element and render a new one
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            }

            // Create a merged props object
            const mergedProps = { ...originalProps, ...newProps };

            // Create a new visualization with the merged props
            const newViz = buildViz({
              type: renderableType,
              ...mergedProps
            });

            // Render the new visualization
            newViz.renderToSvg(svg);
          }
        }
      };
    }
  };

  return renderable;
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
