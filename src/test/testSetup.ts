/**
 * Test Setup Utilities
 *
 * Provides functions to reliably initialize the visualization library for testing
 */

import { initializeLibrary } from '../core/devize';
import { registerDefineType } from '../core/define';
import { registry } from '../core/registry';

// Import all primitive registrations
import { registerCirclePrimitive } from '../primitives/circle';
import { registerRectanglePrimitive } from '../primitives/rectangle';
import { registerTextPrimitive } from '../primitives/text';
import { registerGroupPrimitive } from '../primitives/group';
import { registerLinePrimitive } from '../primitives/line';

/**
 * Initialize the library with all standard primitives
 */
export function initializeTestEnvironment() {
  // First reset the registry to ensure a clean state
  (registry as any).types = new Map();

  // Initialize the core library
  initializeLibrary();

  // Make sure define type is registered
  registerDefineType();

  // Register all primitives explicitly
  registerCirclePrimitive();
  registerRectanglePrimitive();
  registerTextPrimitive();
  registerGroupPrimitive();

  console.log('✅ Test environment initialized with all standard primitives');
}

/**
 * Check if a specific primitive is registered
 */
export function isPrimitiveRegistered(name: string): boolean {
  return registry.hasType(name);
}

/**
 * Ensure specific primitives are registered
 */
export function ensurePrimitivesRegistered(primitives: string[]) {
  for (const primitive of primitives) {
    if (!isPrimitiveRegistered(primitive)) {
      switch (primitive) {
        case 'circle':
          registerCirclePrimitive();
          break;
        case 'line':
          registerLinePrimitive();
          break;
        case 'rectangle':
          registerRectanglePrimitive();
          break;
        case 'text':
          registerTextPrimitive();
          break;
        case 'group':
          registerGroupPrimitive();
          break;
        default:
          throw new Error(`Unknown primitive: ${primitive}`);
      }
    }
  }
}
