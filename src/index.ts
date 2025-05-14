// Initialize core modules first
console.log('Devize library initializing');
import './core/registry';
import './core/define';

// Import core components
import {
  buildViz,
  renderViz,
  updateViz,
  initializeLibrary,
  registerType,
  hasType,
  getType,
  registerData,
  getData,
  ensureSvg
} from './core/devize';

// Initialize the library
initializeLibrary();

// TODO: We should instead import these from components/index.ts
// Import visualization types
import './components/data/dataExtract';
import './charts/barChart';
import './charts/lineChart';
import './charts/scatterPlot';
import './charts/pieChart';
import './charts/surfaceGraph';
import './components/axis';
import './components/legend';
import { colorScaleDefinition, createColorScale } from './components/scales/colorScale';

// Add this import to the top of the file
import { surfaceGraphDefinition, createSurfaceGraph } from './charts/surfaceGraph';

// Make sure to export the surfaceGraph component

export {
  // ... other exports
  surfaceGraphDefinition,
  createSurfaceGraph
};
// Add to exports
export {
  // ... other exports
  colorScaleDefinition,
  createColorScale
};

// Add this to the initialization section to ensure the component is registered
  // This should not be needed.
// buildViz(surfaceGraphDefinition);

console.log('All modules imported');

// Export public API
export {
  buildViz,
  renderViz,
  updateViz,
  registerType,
  hasType,
  getType,
  registerData,
  getData,
  ensureSvg
};

// If you want to expose the library globally (for script tags)
if (typeof window !== 'undefined') {
  (window as any).Devize = {
    buildViz,
    renderViz,
    updateViz,
    registerType,
    hasType,
    getType,
    registerData,
    getData,
    ensureSvg
  };
}

console.log('Devize library initialization complete');
