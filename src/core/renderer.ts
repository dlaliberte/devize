/**
 * Top-Level Renderer for Devize visualizations
 *
 * Purpose: Renders visualization specifications to DOM containers
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { VisualizationSpec, RenderableVisualization, RenderedResult } from './types';
import { buildViz } from './builder';
// import { ThreeJsRenderer } from '../utils/threeJsRenderer';

/**
 * Ensure an SVG element exists in a container
 */
export function ensureSvg(container: HTMLElement): SVGElement {
  // Check if the container already has an SVG element
  let svg = container.querySelector('svg');

  // If not, create one
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    // svg.setAttribute('viewBox', "0 0 600 260")
    container.appendChild(svg);
  }

  return svg as SVGElement;
}

/**
 * Check if a container is an SVG container
 */
function isSVGContainer(container: HTMLElement): boolean {
  return container.tagName.toLowerCase() === 'svg';
}

/**
 * Check if a container is a Canvas container
 */
function isCanvasContainer(container: HTMLElement): boolean {
  return container.tagName.toLowerCase() === 'canvas';
}

/**
 * Check if an object is a RenderableVisualization
 */
function isRenderableVisualization(obj: any): boolean {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.renderableType === 'string' &&
         typeof obj.render === 'function' &&
         (typeof obj.renderToSvg === 'function' ||
          typeof obj.renderToCanvas === 'function' ||
          typeof obj.renderToHtml === 'function');
}

/**
 * Render a visualization to a container
 */
export function renderViz(
  viz: VisualizationSpec | RenderableVisualization,
  container: HTMLElement
): RenderedResult {
  console.log('Rendering visualization:', viz);

  // Process the visualization specification if needed
  const renderable = isRenderableVisualization(viz)
    ? viz as RenderableVisualization
    : buildViz(viz as VisualizationSpec);

  console.log('Renderable visualization:', renderable);

  // Check if this is a Three.js visualization
  if (renderable.renderToThreeJS && !isSVGContainer(container) && !isCanvasContainer(container)) {
    console.log('Rendering with Three.js');

    // Clear existing content
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Render using Three.js
    const threeJsRenderer = renderable.renderToThreeJS(container);

    // Return result
    return {
      element: container,
      update: (newSpec: VisualizationSpec) => {
        const updatedViz = renderable.update(newSpec);

        // Clean up existing Three.js renderer
        if (threeJsRenderer && threeJsRenderer.dispose) {
          threeJsRenderer.dispose();
        }

        // Re-render with updated spec
        return renderViz(updatedViz, container);
      },
      cleanup: () => {
        // Dispose Three.js resources
        if (threeJsRenderer && threeJsRenderer.dispose) {
          threeJsRenderer.dispose();
        }

        // Clear container
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }

  // Check if HTML rendering is available and we're not in an SVG or Canvas container
  if (renderable.renderToHtml && !isSVGContainer(container) && !isCanvasContainer(container)) {
    console.log('Rendering with HTML');

    // Clear existing content
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Render using HTML
    const element = renderable.renderToHtml(container);
    console.log('Rendered HTML element:', element);

    return {
      element,
      update: (newSpec: VisualizationSpec) => {
        // Merge the new spec with the original spec
        const originalSpec = {};
        for (const key in renderable.spec) {
          if (key !== 'type') {
            originalSpec[key] = renderable.getProperty(key);
          }
        }

        const type = renderable.getProperty('type');
        const mergedSpec = {
          type,
          ...originalSpec,
          ...newSpec
        };

        const updatedViz = renderable.update(mergedSpec);

        // Clear existing content before re-rendering
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        return renderViz(updatedViz, container);
      },
      cleanup: () => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }
    };
  }

  // Determine the rendering backend based on the container
  if (isSVGContainer(container)) {
    // Direct SVG rendering
    // Clear existing content first
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const element = renderable.renderToSvg(container as SVGElement);
    console.log('Rendered SVG element:', element);

    return {
      element,
      update: (newSpec: VisualizationSpec) => {
        // Merge the new spec with the original spec
        const originalSpec = {};
        for (const key in renderable.spec) {
          if (key !== 'type') {
            originalSpec[key] = renderable.getProperty(key);
          }
        }

        const type = renderable.getProperty('type');
        const mergedSpec = {
          type,
          ...originalSpec,
          ...newSpec
        };

        const updatedViz = renderable.update(mergedSpec);

        // Clear existing content before re-rendering
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        return renderViz(updatedViz, container);
      },
      cleanup: () => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }
    };
  } else if (isCanvasContainer(container)) {
    // Canvas rendering
    const ctx = (container as HTMLCanvasElement).getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas element');
    }

    // Clear the canvas
    ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);

    // Render to canvas
    renderable.renderToCanvas(ctx);

    // Return result
    return {
      element: container,
      update: (newSpec: VisualizationSpec) => {
        const updatedViz = renderable.update(newSpec);
        return renderViz(updatedViz, container);
      },
      cleanup: () => {
        // Clear the canvas
        if (ctx) {
          ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
        }
      }
    };
  } else {
    // Default to SVG rendering in a container
    // For regular containers, we need to handle SVG creation and clearing
    console.log('Rendering to regular container');

    // Clear existing SVG if present
    const existingSvg = container.querySelector('svg');
    if (existingSvg) {
      container.removeChild(existingSvg);
    }

    const result = renderable.render(container);
    console.log('Render result:', result);
    console.log('Container after rendering:', container.innerHTML);

    // Wrap the update function to ensure clearing
    const originalUpdate = result.update;
    result.update = (newSpec: VisualizationSpec) => {
      // Clear existing SVG before updating
      const existingSvg = container.querySelector('svg');
      if (existingSvg) {
        container.removeChild(existingSvg);
      }

      return originalUpdate(newSpec);
    };

    return result;
  }
}

/**
 * Update an existing visualization
 */
export function updateViz(
  vizInstance: RenderableVisualization,
  newSpec: VisualizationSpec
): RenderableVisualization {
  // Get the original spec from the visualization instance
  const originalSpec = {};

  // Copy all properties from the original spec
  for (const key in vizInstance.spec) {
    if (key !== 'type') { // We'll handle type separately
      originalSpec[key] = vizInstance.getProperty(key);
    }
  }

  // Ensure the type is preserved
  const type = vizInstance.getProperty('type');

  // Merge the specs, with new properties overriding original ones
  const mergedSpec = {
    type,
    ...originalSpec,
    ...newSpec
  };

  // Update the visualization with the merged spec
  return vizInstance.update(mergedSpec);
}

/**
 * Render to SVG container
 */
function renderToSVG(processed, container) {
  // Check if the processed object has an SVG rendering function
  if (processed.renderToSvg) {
    return processed.renderToSvg(container);
  } else {
    console.error('No SVG rendering function available for:', processed);
    return null;
  }
}

/**
 * Render to Canvas container
 */
function renderToCanvas(processed, container) {
  // Get the 2D context from the canvas
  const ctx = container.getContext('2d');

  // Check if the processed object has a Canvas rendering function
  if (processed.renderToCanvas) {
    return processed.renderToCanvas(ctx);
  } else {
    console.error('No Canvas rendering function available for:', processed);
    return null;
  }
}

/**
 * Prepare a default SVG container if needed
 */
function prepareDefaultContainer(container) {
  // If it's already an SVG element, return it
  if (container.tagName === 'svg') {
    return container;
  }

  // Create an SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  // svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', "0 0 600 260")

  // Append it to the container
  container.appendChild(svg);

  return svg;
}

/**
 * References:
 * - Related File: src/core/processor.ts
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/primitives/group.ts
 * - Design Document: design/rendering.md
 * - Design Document: design/primitive_implementation.md
 * - User Documentation: docs/core/rendering.md
 */
