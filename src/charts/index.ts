/**
 * Charts Index
 *
 * This file imports and re-exports all chart components to ensure they're registered.
 */

// Import all chart components
import './barChart';
import './lineChart';
import './pieChart';
import './scatterPlot';
// import './areaChart';
// import './heatmap';
// import './histogram';
// import './boxPlot';
import './surfaceGraph';

// Re-export specific items that should be available from this module
export * from './barChart';
export * from './lineChart';
export * from './pieChart';
export * from './scatterPlot';
// export * from './areaChart';
// export * from './heatmap';
// export * from './histogram';
// export * from './boxPlot';
export * from './surfaceGraph';
