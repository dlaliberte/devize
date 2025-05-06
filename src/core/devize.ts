/**
 * Devize Core System
 *
 * Purpose: Main entry point for the Devize visualization library
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

// Export core functions from their respective modules
export { createViz } from './creator';
export { renderViz } from './renderer';
export { registerType, getType, hasType } from './registry';

// Import primitive definitions
import { defineShapePrimitives } from '../primitives/shapes';
import { defineTextPrimitives } from '../primitives/text';
import { defineContainerPrimitives } from '../primitives/containers';

// Data registry for storing named datasets
const dataRegistry = new Map();

/**
 * Register data for use in visualizations
 *
 * @param name - The name to register the data under
 * @param data - The data to register
 */
export function registerData(name: string, data: any): void {
  dataRegistry.set(name, data);
}

/**
 * Get registered data
 *
 * @param name - The name of the data to retrieve
 * @returns The registered data or undefined if not found
 */
export function getData(name: string): any {
  return dataRegistry.get(name);
}

/**
 * Update an existing visualization
 *
 * @param vizInstance - The visualization instance to update
 * @param newSpec - The new specification
 * @returns The updated visualization instance
 */
export function updateViz(vizInstance: any, newSpec: any): any {
  if (!vizInstance || !vizInstance.spec) {
    throw new Error('Invalid visualization instance');
  }

  // Create a new visualization with the updated spec
  return createViz({ ...vizInstance.spec, ...newSpec });
}

/**
 * Helper function to ensure an SVG element exists
 *
 * @param container - The container element
 * @returns The SVG element
 */
export function ensureSvg(container: HTMLElement): SVGElement {
  let svg = container.querySelector('svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    container.appendChild(svg);
  }
  return svg as SVGElement;
}

/**
 * Initialize the library by loading primitive definitions
 */
export function initializeLibrary() {
  console.log('Devize library initializing');

  // Import and initialize the define module first
  import('./define');

  // Define primitive types
  defineShapePrimitives();
  defineTextPrimitives();
  defineContainerPrimitives();

  // Load component definitions
  import('../components/axis');
  import('../components/legend');

  console.log('Devize library initialization complete');
}

// Auto-initialize when imported
initializeLibrary();

/**
 * References:
 * - Related File: src/core/creator.ts
 * - Related File: src/core/renderer.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/define.ts
 * - Related File: src/primitives/shapes.ts
 * - Related File: src/primitives/text.ts
 * - Related File: src/primitives/containers.ts
 * - Design Document: design/viz_creation_rendering.md
 * - Design Document: design/rendering.md
 * - Design Document: design/define.md
 * - User Documentation: docs/getting_started.md
 */
