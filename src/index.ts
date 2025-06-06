/**
 * Devize Library Entry Point
 *
 * This file imports all visualization components to ensure they're registered,
 * and exports the public API of the library.
 */

// Import core functionality
import './core/define';
import './core/registry';
import './core/builder';

// Import all component types through their index files
import './primitives';
import './components';
import './charts';
export { buildViz } from './core/builder';
export { registerType, getType, hasType, getAllTypes, getRegisteredTypes } from './core/registry';
export { renderViz, updateViz, ensureSvg } from './core/renderer';

// Re-export core functionality
export * from './core/define';
export * from './core/registry';
export * from './core/builder';
export * from './core/componentUtils';

// Re-export all component types
export * from './primitives';
export * from './components';
export * from './charts';

// const Devize = {
//     registerType,
//     getType,
//     hasType,
//     getAllTypes,
//     getRegisteredTypes,
//     buildViz,
//     renderViz,
//     updateViz,
//     ensureSvg
//     };
