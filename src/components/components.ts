/**
 * Components initialization module
 *
 * This module imports and initializes all higher-level components
 * beyond the core primitives.
 */

// Import scale components
import './scales/linearScale';
import './scales/bandScale';
import './scales/ordinalScale';
import './scales/logScale';
import './scales/timeScale';

// Import visualization components
import './axes/axis';
import './legend';
import './grid';

// Import chart components
import './charts/barChart';
import './charts/lineChart';
import './charts/scatterPlot';
import './charts/pieChart';
import './charts/surfaceGraph';

/**
 * Initialize all components
 * This function ensures all components are properly registered
 */
export function initializeComponents() {
  console.log('Components initialization complete');
}

// Auto-initialize when imported
initializeComponents();

/**
 * References:
 * - Related File: src/core/devize.ts
 * - Related File: src/core/registry.ts
 * - Design Document: design/devize_system.md
 * - Design Document: design/component_implementation.md
 */
