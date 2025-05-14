/**
 * Devize Core System
 *
 * Purpose: Main entry point for the Devize visualization library
 */

// Import core components
import { registerType, getType, hasType, getAllTypes, getRegisteredTypes } from './registry';
import { buildViz } from './builder';
import { renderViz, updateViz, ensureSvg } from './renderer';

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

// Track initialization state
let initialized = false;

/**
 * Initialize the library
 */
export function initializeLibrary() {
  if (initialized) {
    console.log('Library already initialized, skipping');
    return;
  }

  console.log('Starting library initialization');

  // Import core components
  try {
    import('./define').then(() => {
      console.log('Define module loaded successfully');

      // Load primitive types
      import('../primitives/shapes').then(() => console.log('Shape primitives loaded'));
      import('../primitives/text').then(() => console.log('Text primitives loaded'));
      import('../primitives/containers').then(() => console.log('Container primitives loaded'));

      initialized = true;
      console.log('Library initialization complete');
    }).catch(err => {
      console.error('Error loading define module:', err);
    });
  } catch (err) {
    console.error('Error during library initialization:', err);
  }
}

// Auto-initialize when imported in browser context
if (typeof window !== 'undefined') {
  initializeLibrary();
}

// Export core functions, adds these as properties of Devize
export {
  buildViz,
  renderViz,
  updateViz,
  registerType,
  getType,
  hasType,
  getAllTypes,
  ensureSvg,
  getRegisteredTypes
};
