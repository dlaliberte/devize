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
import './ordinalScale';

// Define a generic scale interface
export interface Scale {
  domain: any[];
  range: any[];
  scale: (value: any) => any;
  invert?: (value: number) => any;
  ticks?: (count?: number) => any[];
  bandwidth?: () => number;
}

/**
 * Create a scale factory function that can be used directly in code
 *
 * @param type The type of scale to create ('linear', 'band', 'ordinal', etc.)
 * @param options Configuration options for the scale
 * @returns A Scale object with appropriate methods
 */
export function createScale(type: string, options: any): Scale {
  console.log(`Creating scale of type: ${type}`, options);

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

    case 'ordinal':
      scaleSpec = {
        type: 'ordinalScale',
        domain: options.domain,
        range: options.range,
        unknown: options.unknown
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
  if (scaleViz && typeof scaleViz === 'object') {
    // If the visualization is already a Scale object, return it directly
    if (typeof scaleViz.scale === 'function' &&
        Array.isArray(scaleViz.domain) &&
        Array.isArray(scaleViz.range)) {
      return scaleViz as Scale;
    }

    // Otherwise, try to extract the scale from the visualization
    if (typeof scaleViz.getProperty === 'function') {
      // Try to get the scale directly
      const scaleObj = scaleViz.getProperty('_scale');
      if (scaleObj && typeof scaleObj.scale === 'function') {
        return scaleObj;
      }
    }
  }

  // If we couldn't extract a proper scale object, create a minimal one
  console.warn(`Could not extract scale object from visualization, creating minimal scale`);

  // Create a minimal scale based on the type
  if (type === 'linear' || type === 'log' || type === 'time') {
    return createMinimalLinearScale(options);
  } else if (type === 'band') {
    return createMinimalBandScale(options);
  } else if (type === 'ordinal') {
    return createMinimalOrdinalScale(options);
  }

  // Default fallback
  return {
    domain: options.domain,
    range: options.range,
    scale: (value) => options.range[0]
  };
}

// Minimal linear scale implementation
function createMinimalLinearScale(options: {
  domain: [number, number];
  range: [number, number];
  clamp?: boolean;
}): Scale {
  const { domain, range, clamp = false } = options;

  const scale: Scale = {
    domain,
    range,
    scale: (value) => {
      // Simple linear mapping
      const [d0, d1] = domain;
      const [r0, r1] = range;
      let t = (value - d0) / (d1 - d0);

      // Apply clamping if needed
      if (clamp) {
        t = Math.max(0, Math.min(1, t));
      }

      return r0 + t * (r1 - r0);
    },
    invert: (value) => {
      // Simple inverse mapping
      const [d0, d1] = domain;
      const [r0, r1] = range;
      const t = (value - r0) / (r1 - r0);
      return d0 + t * (d1 - d0);
    },
    ticks: (count = 10) => {
      // Simple ticks implementation
      const [d0, d1] = domain;
      const step = (d1 - d0) / Math.max(1, count - 1);
      return Array.from({ length: count }, (_, i) => d0 + i * step);
    }
  };

  return scale;
}

// Minimal band scale implementation
function createMinimalBandScale(options: {
  domain: string[];
  range: [number, number];
  padding?: number;
  paddingInner?: number;
  paddingOuter?: number;
  align?: number;
}): Scale {
  const {
    domain,
    range,
    padding = 0.1,
    paddingInner = padding,
    paddingOuter = padding,
    align = 0.5
  } = options;

  const [r0, r1] = range;
  const n = domain.length;
  const step = n ? (r1 - r0) / (n - paddingInner + paddingOuter * 2) : 0;
  const bandWidth = step * (1 - paddingInner);
  const start = r0 + (r1 - r0 - step * (n - paddingInner)) * align;

  const scale: Scale = {
    domain,
    range,
    scale: (value) => {
      const index = domain.indexOf(value);
      if (index === -1) return NaN;
      return start + paddingOuter * step + index * step;
    },
    bandwidth: () => bandWidth,
    ticks: () => domain
  };

  return scale;
}

// Minimal ordinal scale implementation
function createMinimalOrdinalScale(options: {
  domain: string[];
  range: any[];
  unknown?: any;
}): Scale {
  const { domain, range, unknown = range[0] } = options;

  const scale: Scale = {
    domain,
    range,
    scale: (value) => {
      const index = domain.indexOf(value);
      if (index === -1) return unknown;
      return range[index % range.length];
    },
    ticks: () => domain
  };

  return scale;
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
    unknown: { default: null }
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

    // Return the scale object with a _scale property for easy extraction
    return {
      _scale: scale,
      ...scale
    };
  }
});
