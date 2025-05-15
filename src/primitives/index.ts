/**
 * Primitives Index
 *
 * This file imports and re-exports all primitive components to ensure they're registered.
 */

// Import all primitive components
import './circle';
import './ellipse';
import './group';
import './group3D';
import './line';
import './path';
import './polygon';
import './polyline';
import './rect';
import './text';

// Re-export specific items that should be available from this module
export * from './circle';
export * from './ellipse';
export * from './group';
export * from './group3D';
export * from './line';
export * from './path';
export * from './polygon';
export * from './polyline';
export * from './rect';
export * from './text';
