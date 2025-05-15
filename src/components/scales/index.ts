/**
 * Scale Components Index
 *
 * This file imports and re-exports all scale components to ensure they're registered.
 */

// Import all scale components
import './linearScale';
import './logScale';
import './timeScale';
import './bandScale';
import './ordinalScale';
import './colorScale';

// Re-export specific items that should be available from this module
export * from './scale';
export * from './linearScale';
export * from './logScale';
export * from './timeScale';
export * from './bandScale';
export * from './ordinalScale';
export * from './colorScale';
