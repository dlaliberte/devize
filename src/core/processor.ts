/**
 * Visualization Processor
 *
 * Purpose: Processes visualization specifications into renderable objects
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { getVizType } from './registry';

/**
 * Process a visualization specification into a renderable object
 *
 * @param spec - The visualization specification
 * @returns A processed object with rendering functions
 */
export function processVisualization(spec) {
  // If it's already a processed object with rendering functions, return it
  if (spec.renderSVG || spec.renderCanvas) {
    return spec;
  }

  // Get the visualization type
  const vizType = getVizType(spec.type);

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
 * - Design Document: design/rendering.md
 * - Design Document: design/primitive_implementation.md
 */
