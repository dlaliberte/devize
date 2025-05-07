/**
 * Devize Core System
 *
 * Purpose: Main entry point for the Devize visualization library
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

// Main entry point for the Devize library
import { registerType, getType, hasType, getAllTypes } from './registry';
import { createViz } from './creator';
import { renderViz, updateViz } from './renderer';
import { VisualizationType, VizSpec } from './types';

// Data registry for storing named data sources
const dataRegistry: Record<string, any> = {};

/**
 * Register data for use in visualizations
 * @param name The name to register the data under
 * @param data The data to register
 */
export function registerData(name: string, data: any): void {
  dataRegistry[name] = data;
}

/**
 * Get registered data
 * @param name The name of the registered data
 * @returns The registered data or undefined if not found
 */
export function getData(name: string): any {
  return dataRegistry[name];
}

/**
 * Ensure an SVG element exists in a container
 * @param container The container element
 * @returns The SVG element
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
 * Initialize the Devize library
 * This function ensures that all core components are loaded and initialized
 */
export function initializeLibrary() {
  console.log('Initializing Devize library');

  // Import the define module first to bootstrap the type system
  // This is a special case - we need to ensure define.ts is loaded
  // before any other modules that use it
  import('./define');

  // Now we can load primitive types
  // These will be loaded asynchronously, but that's fine because
  // they'll register themselves with the type registry
  import('../primitives/rectangle');
  import('../primitives/circle');
  import('../primitives/line');
  import('../primitives/text');
  import('../primitives/group');
  import('../primitives/layer');

  // Load component definitions
  import('../components/scales/linearScale');
  import('../components/scales/bandScale');

  console.log('Library initialization complete');
}

// Auto-initialize when imported in browser environments
if (typeof window !== 'undefined') {
  initializeLibrary();
}

// Export core functions
export {
  createViz,
  renderViz,
  updateViz,
  registerType,
  getType,
  hasType,
  getAllTypes
};

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
