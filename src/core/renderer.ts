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
 * Render a visualization to a container
 */
export function renderViz(
  viz: VisualizationSpec | RenderableVisualization,
  container: HTMLElement
): RenderedResult {
  // Process the visualization specification
  const renderable = buildViz(viz);

  // Determine the rendering backend based on the container
  if (isSVGContainer(container)) {
    // Direct SVG rendering
    const element = renderable.renderToSvg(container as SVGElement);
    return {
      element,
      update: (newSpec: VisualizationSpec) => {
        const updatedViz = renderable.update(newSpec);
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
    return renderable.render(container);
  }
}

/**
 * Update an existing visualization
 */
export function updateViz(
  vizInstance: RenderableVisualization,
  newSpec: VisualizationSpec
): RenderableVisualization {
  return vizInstance.update(newSpec);
}

/**
 * Render to SVG container
 */
function renderToSVG(processed, container) {
  // Check if the processed object has an SVG rendering function
  if (processed.renderSVG) {
    return processed.renderSVG(container);
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
  if (processed.renderCanvas) {
    return processed.renderCanvas(ctx);
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
  svg.setAttribute('height', '100%');

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
