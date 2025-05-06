/**
 * Top-Level Renderer for Devize visualizations
 *
 * Purpose: Renders visualization specifications to DOM containers
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { createViz } from './creator';
import { isSVGContainer, isCanvasContainer } from './utils';

/**
 * Render a visualization specification to a container
 *
 * @param spec - The visualization specification
 * @param container - The DOM container to render into
 * @returns The rendered result
 */
export function renderViz(spec, container) {
  // Process the visualization specification
  const processed = createViz(spec);

  // Determine the rendering backend based on the container
  if (isSVGContainer(container)) {
    return renderToSVG(processed, container);
  } else if (isCanvasContainer(container)) {
    return renderToCanvas(processed, container);
  } else {
    // Default to SVG rendering
    return renderToSVG(processed, prepareDefaultContainer(container));
  }
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
