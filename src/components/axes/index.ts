/**
 * Axes Components Index
 *
 * This file imports and re-exports all axis components to ensure they're registered.
 */

// Import all axis components
import { registerAxisComponent } from './axis';
import { registerAxis3DComponent } from './axis3D';

// Register all components
registerAxisComponent();
registerAxis3DComponent();

// Re-export specific items that should be available from this module
export * from './axis';
export * from './axis3D';
