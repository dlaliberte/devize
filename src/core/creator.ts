/**
 * Visualization Creator
 *
 * Purpose: Creates visualization objects from specifications
 */

import { getType, hasType } from './registry';

/**
 * Create a visualization object from a specification
 *
 * @param spec - The visualization specification
 * @returns A processed object with rendering functions
 */
export function createViz(spec) {
  // Handle null/undefined
  if (!spec) {
    throw new Error('Visualization specification cannot be null or undefined');
  }

  // If it's already a processed object with rendering functions, return it
  if (spec.renderSVG || spec.renderCanvas) {
    return spec;
  }

  // Handle missing type
  if (!spec.type) {
    throw new Error('Visualization specification must have a type');
  }

  // Special case for bootstrapping the 'define' type
  // This is needed because the 'define' type needs to define itself
  if (spec.type === 'define' && spec.name === 'define' && !hasType('define')) {
    // The define type will be registered by the define.ts module
    // Just return a placeholder for now
    return { type: 'group', children: [] };
  }

  // Get the visualization type
  const vizType = getType(spec.type);

  if (!vizType) {
    throw new Error(`Unknown visualization type: ${spec.type}`);
  }

  // Apply default values for optional properties
  const fullSpec = applyDefaults(spec, vizType);

  // Validate required properties
  validateProperties(fullSpec, vizType);

  // Process the visualization using its implementation
  return vizType.decompose(fullSpec);
}

/**
 * Apply default values for optional properties
 */
function applyDefaults(spec, vizType) {
  const result = { ...spec };

  // Apply defaults for any missing properties
  if (vizType.optionalProps) {
    for (const [propName, defaultValue] of Object.entries(vizType.optionalProps)) {
      if (result[propName] === undefined) {
        result[propName] = defaultValue;
      }
    }
  }

  return result;
}

/**
 * Validate required properties
 */
function validateProperties(spec, vizType) {
  // Check for required properties
  if (vizType.requiredProps) {
    for (const propName of vizType.requiredProps) {
      if (spec[propName] === undefined) {
        throw new Error(`Missing required property: ${propName} for visualization type: ${spec.type}`);
      }
    }
  }

  // Run custom validation if available
  if (vizType.validate) {
    vizType.validate(spec);
  }
}

/**
 * References:
 * - Related File: src/core/registry.ts
 * - Related File: src/core/renderer.ts
 * - Related File: src/core/define.ts
 * - Design Document: design/viz_creation_rendering.md
 * - Design Document: design/rendering.md
 * - Design Document: design/define.md
 */
