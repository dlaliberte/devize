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
 * Creates a standard renderable visualization object
 *
 * @param type The component type
 * @param props The component properties
 * @param renderToSvg The component-specific SVG rendering function
 * @param renderToCanvas The component-specific Canvas rendering function
 * @returns A standard renderable visualization object
 */
export function createRenderableVisualization(
  type: string,
  props: VisualizationSpec,
  renderToSvg?: (svg: SVGElement) => SVGElement,
  renderToCanvas?: (ctx: CanvasRenderingContext2D) => boolean
): RenderableVisualization {
  const defaultRenderToSvg = (svg: SVGElement) => {
    throw new Error('No SVG rendering function provided for this component type.');
  };

  const defaultRenderToCanvas = (ctx: CanvasRenderingContext2D) => {
    throw new Error('No Canvas rendering function provided for this component type.');
  };

  const renderable: RenderableVisualization = {
    renderableType: type,

    render: null as any, // Will be set below

    // If renderToSvg is defined, use it, otherwise use the default SVG renderer
    renderToSvg: renderToSvg || defaultRenderToSvg,
    renderToCanvas: renderToCanvas || defaultRenderToCanvas,

    update: createUpdateFunction(props),
    getProperty: createGetPropertyFunction(props)
  };

  // Set the render function (needs access to the renderable object)
  renderable.render = createRenderFunction(renderable);

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
