/**
 * Coordinate Systems Index
 *
 * This file imports and re-exports all coordinate system components to ensure they're registered.
 */

// Import all coordinate system components
import './cartesianCoordinateSystem';
import './cartesian3DCoordinateSystem';
import './sphericalCoordinateSystem';
import './polarCoordinateSystem';

// Re-export specific items that should be available from this module
export * from './coordinateSystem';
export * from './cartesianCoordinateSystem';
export * from './cartesian3DCoordinateSystem';
export * from './sphericalCoordinateSystem';
export * from './polarCoordinateSystem';
