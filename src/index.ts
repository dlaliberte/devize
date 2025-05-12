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

// Import visualization types
import './components/data/dataExtract';
import './charts/barChart';
import './charts/lineChart';
import './charts/scatterPlot';
import './charts/pieChart';
import './components/axis';
import './components/legend';

// Note: Commenting out primitive imports until we confirm the correct paths
// If these files don't exist yet, they should be created according to the architecture
// or the imports should be adjusted to match the actual file structure
// import './primitives/shape';
// import './primitives/text';
// import './primitives/container';

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
