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
 * Enhanced version of createRenderableVisualization that accepts an object with render functions
 *
 * @param type The type of the visualization
 * @param props The visualization properties
 * @param renderFunctions Object containing render functions for different backends
 * @param additionalProps Additional properties to include in the renderable visualization
 * @returns A renderable visualization
 */
export function createRenderableVisualizationEnhanced(
  type: string,
  props: any,
  renderFunctions: {
    renderToSvg?: (container: SVGElement) => SVGElement;
    renderToCanvas?: (ctx: CanvasRenderingContext2D) => boolean;
    renderToThreeJS?: (container: HTMLElement) => any;
    // Could add more render functions in the future (e.g., renderToWebGPU)
  },
  additionalProps: Record<string, any> = {}
): RenderableVisualization {
  // Default render functions that provide fallbacks
  const defaultRenderToSvg = (container: SVGElement): SVGElement => {
    // Create a placeholder with a message
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('width', props.width?.toString() || '100%');
    foreignObject.setAttribute('height', props.height?.toString() || '100%');

    const div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.backgroundColor = '#f0f0f0';
    div.textContent = `${type} visualization cannot be rendered to SVG`;

    foreignObject.appendChild(div);
    container.appendChild(foreignObject);

    return container;
  };

  const defaultRenderToCanvas = (ctx: CanvasRenderingContext2D): boolean => {
    // Display a message in the canvas
    const width = props.width || ctx.canvas.width;
    const height = props.height || ctx.canvas.height;

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#333333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${type} visualization cannot be rendered to Canvas`, width / 2, height / 2);

    return true;
  };

  return {
    renderableType: type,
    spec: props,

    // Get a property from the spec
    getProperty: function(key: string) {
      return props[key];
    },

    // Render to a container
    render: function (container: HTMLElement) {
// +   console.log('Render method called for', type);
// +
// +   // Check if we should use Three.js rendering
// +   if (this.renderToThreeJS && container instanceof HTMLElement && !(container instanceof SVGElement)) {
// +     console.log('Using Three.js rendering path');
// +     const renderer = this.renderToThreeJS(container);
// +     return {
// +       element: container,
// +       update: (newSpec: any) => {
// +         const updatedViz = this.update(newSpec);
// +         return updatedViz.render(container);
// +       },
// +       cleanup: () => {
// +         if (renderer && renderer.dispose) {
// +           renderer.dispose();
// +         }
// +       }
// +     };
// +   }

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
    renderToSvg: renderFunctions.renderToSvg || defaultRenderToSvg,

    // Render to a canvas context
    renderToCanvas: renderFunctions.renderToCanvas || defaultRenderToCanvas,

    // Render to Three.js (if provided)
    ...(renderFunctions.renderToThreeJS ? { renderToThreeJS: renderFunctions.renderToThreeJS } : {}),

    // Update the visualization with new properties
    update: function(newSpec: any) {
      // Create a merged spec
      const mergedSpec = { ...props, ...newSpec };

      // Build a new visualization with the merged spec
      return buildViz({
        type,
        ...mergedSpec
      });
    },

    // Include any additional properties
    ...additionalProps
  };
}

/**
 * Create a renderable visualization with standard methods
 * (Maintained for backward compatibility)
 */
export function createRenderableVisualization(
  type: string,
  props: any,
  renderToSvgFn: (container: SVGElement) => SVGElement,
  renderToCanvasFn: (ctx: CanvasRenderingContext2D) => boolean,
  additionalProps: Record<string, any> = {}
): RenderableVisualization {
  return createRenderableVisualizationEnhanced(
    type,
    props,
    {
      renderToSvg: renderToSvgFn,
      renderToCanvas: renderToCanvasFn,
      // If additionalProps contains renderToThreeJS, extract it
      renderToThreeJS: additionalProps.renderToThreeJS
    },
    // Filter out renderToThreeJS from additionalProps to avoid duplication
    Object.fromEntries(
      Object.entries(additionalProps).filter(([key]) => key !== 'renderToThreeJS')
    )
  );
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
