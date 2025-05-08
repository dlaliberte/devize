/**
 * Scale Component
 *
 * Purpose: Provides scale functionality for mapping data values to visual properties
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';

// Make sure define type is registered
registerDefineType();

// Import scale types to ensure they're registered
import './linearScale';
import './bandScale';

// Define a generic scale interface
export interface Scale {
  domain: [number, number] | string[];
  range: [number, number];
  scale: (value: any) => number | any;
  invert?: (value: number) => any;
  ticks?: (count?: number) => any[];
  bandwidth?: () => number;
}

// Create a scale factory function that can be used directly in code
export function createScale(type: string, options: any): Scale {
  console.log(`Creating scale of type: ${type}`, options);

  // For ordinal scale which is implemented directly
  if (type === 'ordinal') {
    return createOrdinalScale(options);
  }

  // Create the appropriate scale visualization based on type
  let scaleSpec;

  switch (type) {
    case 'linear':
      scaleSpec = {
        type: 'linearScale',
        domain: options.domain,
        range: options.range,
        padding: options.padding || 0,
        clamp: options.clamp || false,
        nice: options.nice || false
      };
      break;

    case 'band':
      scaleSpec = {
        type: 'bandScale',
        domain: options.domain,
        range: options.range,
        padding: options.padding || 0.1,
        paddingInner: options.paddingInner,
        paddingOuter: options.paddingOuter,
        align: options.align || 0.5
      };
      break;

    case 'log':
      // For now, use linear scale as placeholder
      console.warn('Log scale is not fully implemented yet, using linear scale as fallback');
      scaleSpec = {
        type: 'linearScale',
        domain: options.domain,
        range: options.range,
        clamp: options.clamp || false
      };
      break;

    case 'time':
      // For now, use linear scale as placeholder
      console.warn('Time scale is not fully implemented yet, using linear scale as fallback');
      scaleSpec = {
        type: 'linearScale',
        domain: options.domain,
        range: options.range,
        clamp: options.clamp || false
      };
      break;

    default:
      throw new Error(`Unknown scale type: ${type}`);
  }

  // Build the visualization
  const scaleViz = buildViz(scaleSpec);
  console.log(`Built scale visualization:`, scaleViz);

  // Extract the scale object from the visualization
  if (scaleViz && typeof scaleViz.getProperty === 'function') {
    try {
      // Try to get the implementation directly
      const implementation = scaleViz.getProperty('implementation');

      if (implementation) {
        console.log('Found implementation:', implementation);
        // If we have an implementation object with the required methods, use it
        if (implementation.domain && implementation.range && typeof implementation.scale === 'function') {
          return implementation as Scale;
        }
      }

      // If we couldn't get a complete implementation, build one from the properties
      const domain = scaleViz.getProperty('domain') || options.domain;
      const range = scaleViz.getProperty('range') || options.range;

      // Create a scale object with the available methods
      const scale: Scale = {
        domain,
        range,
        scale: (value) => {
          // Try to use the implementation's scale method if available
          if (implementation && typeof implementation.scale === 'function') {
            return implementation.scale(value);
          }

          // Fallback to a simple linear mapping
          if (Array.isArray(domain) && domain.length >= 2 && typeof domain[0] === 'number') {
            const [d0, d1] = domain as [number, number];
            const [r0, r1] = range as [number, number];
            const t = (value - d0) / (d1 - d0);
            return r0 + t * (r1 - r0);
          }

          // For non-numeric domains (like band scales), return a default value
          return range[0];
        }
      };

      // Add invert method if available
      if (implementation && typeof implementation.invert === 'function') {
        scale.invert = (value) => implementation.invert(value);
      } else if (type === 'linear') {
        // Add a default invert implementation for linear scales
        scale.invert = (value) => {
          const [d0, d1] = domain as [number, number];
          const [r0, r1] = range as [number, number];
          const t = (value - r0) / (r1 - r0);
          return d0 + t * (d1 - d0);
        };
      }

      // Add ticks method if available
      if (implementation && typeof implementation.ticks === 'function') {
        scale.ticks = (count) => implementation.ticks(count);
      } else if (type === 'linear') {
        // Add a default ticks implementation for linear scales
        scale.ticks = (count = 10) => {
          const [d0, d1] = domain as [number, number];
          const step = (d1 - d0) / Math.max(1, count - 1);
          return Array.from({ length: count }, (_, i) => d0 + i * step);
        };
      } else if (type === 'band') {
        // For band scales, return the domain as ticks
        scale.ticks = () => domain as string[];
      }

      // Add bandwidth method for band scales
      if (implementation && typeof implementation.bandwidth === 'function') {
        scale.bandwidth = () => implementation.bandwidth();
      } else if (type === 'band') {
        // Add a default bandwidth implementation for band scales
        scale.bandwidth = () => {
          const [r0, r1] = range as [number, number];
          const n = (domain as string[]).length;
          const padding = options.padding || 0.1;
          return (r1 - r0) / n * (1 - padding);
        };
      }

      return scale;
    } catch (error) {
      console.error('Error extracting scale from visualization:', error);
    }
  }

  // If we can't extract a proper scale object, create a minimal one
  console.warn(`Could not extract scale object from visualization, creating minimal scale`);

  // Create a minimal scale based on the type
  if (type === 'linear' || type === 'log' || type === 'time') {
    const scale: Scale = {
      domain: options.domain,
      range: options.range,
      scale: (value) => {
        // Simple linear mapping
        const [d0, d1] = options.domain;
        const [r0, r1] = options.range;
        const t = (value - d0) / (d1 - d0);
        return r0 + t * (r1 - r0);
      },
      invert: (value) => {
        // Simple inverse mapping
        const [d0, d1] = options.domain;
        const [r0, r1] = options.range;
        const t = (value - r0) / (r1 - r0);
        return d0 + t * (d1 - d0);
      },
      ticks: (count = 10) => {
        // Simple ticks implementation
        const [d0, d1] = options.domain;
        const step = (d1 - d0) / Math.max(1, count - 1);
        return Array.from({ length: count }, (_, i) => d0 + i * step);
      }
    };
    return scale;
  } else if (type === 'band') {
    const scale: Scale = {
      domain: options.domain,
      range: options.range,
      scale: (value) => {
        // Simple band mapping
        const domain = options.domain;
        const [r0, r1] = options.range;
        const index = domain.indexOf(value);
        if (index === -1) return NaN;
        const n = domain.length;
        const padding = options.padding || 0.1;
        const step = (r1 - r0) / n;
        return r0 + index * step + padding * step / 2;
      },
      bandwidth: () => {
        // Simple bandwidth calculation
        const [r0, r1] = options.range;
        const n = options.domain.length;
        const padding = options.padding || 0.1;
        return (r1 - r0) / n * (1 - padding);
      },
      ticks: () => options.domain
    };
    return scale;
  }

  // Default fallback
  return {
    domain: options.domain,
    range: options.range,
    scale: (value) => {
      // Very simple fallback
      return options.range[0];
    }
  };
}

// Ordinal scale implementation (not yet defined as a visualization type)
function createOrdinalScale(options: {
  domain: string[];
  range: any[];
  unknown?: any;
}): Scale {
  const { domain, range, unknown = range[0] } = options;

  const scale = (value: string): any => {
    const index = domain.indexOf(value);
    if (index === -1) return unknown; // Return unknown value for values not in domain
    return range[index % range.length];
  };

  const ticks = (): string[] => domain;

  return { domain, range, scale, ticks };
}

// Export a unified scale component that can create any type of scale
buildViz({
  type: "define",
  name: "scale",
  properties: {
    type: { required: true },
    domain: { required: true },
    range: { required: true },
    padding: { default: 0.1 },
    paddingInner: { default: null },
    paddingOuter: { default: null },
    align: { default: 0.5 },
    clamp: { default: false },
    nice: { default: false },
    unknown: { default: null },
    as: { default: 'scale' }
  },
  implementation: props => {
    // Create the scale using our factory function
    const scale = createScale(props.type, {
      domain: props.domain,
      range: props.range,
      padding: props.padding,
      paddingInner: props.paddingInner !== null ? props.paddingInner : props.padding,
      paddingOuter: props.paddingOuter !== null ? props.paddingOuter : props.padding,
      align: props.align,
      clamp: props.clamp,
      nice: props.nice,
      unknown: props.unknown
    });

    // Return the scale object
    return scale;
  }
});
