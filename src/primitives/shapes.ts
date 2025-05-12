/**
 * Primitive Shape Visualizations
 *
 * This file imports and exports all shape primitives.
 */

// Import individual shape primitives to ensure they're registered
import './rectangle';
import './circle';
import './line';
import './path';
import './polygon';
import './text';
import './shape';  // Import our new shape primitive

// Re-export utility functions
export { getShapePath, createShape } from './shape';

console.log('Shape primitives loaded');
