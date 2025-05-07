// First import the core modules
console.log('Main module initializing');
import './core/registry';
import './core/devize';
import './core/define';

// Then import visualization types
import './components/data/dataExtract';
import './charts/barChart';
import './charts/scatterPlot';

import { buildViz, updateViz } from './core/devize';

// Note: We don't need to explicitly import the primitives here
// because they are imported by the chart modules
console.log('All modules imported');

import { registerType } from './core/registry';

// Direct registration for testing
registerType({
  name: 'testType',
  requiredProps: [],
  optionalProps: {},
  generateConstraints: () => [],
  decompose: (spec) => spec
});

console.log('Test type registered');

// Export public API
export {
  buildViz,
  updateViz
};

// If you want to expose the library globally (for script tags)
if (typeof window !== 'undefined') {
  (window as any).Devize = {
    buildViz,
    updateViz,
    // Add other functions you want to expose
  };
}
