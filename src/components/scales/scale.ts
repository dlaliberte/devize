// Base scale functionality
import { createViz } from '../../core/devize';

// Define a generic scale interface
export interface Scale {
  domain: [number, number] | string[];
  range: [number, number];
  scale: (value: any) => number;
  invert?: (value: number) => any;
  ticks?: (count?: number) => any[];
  bandwidth?: () => number;
}

// Create a scale factory function that can be used directly in code
export function createScale(type: string, options: any): Scale {
  switch (type) {
    case 'linear':
      return createLinearScale(options);
    case 'band':
      return createBandScale(options);
    case 'ordinal':
      return createOrdinalScale(options);
    case 'log':
      return createLogScale(options);
    case 'time':
      return createTimeScale(options);
    default:
      throw new Error(`Unknown scale type: ${type}`);
  }
}

// Linear scale implementation
function createLinearScale(options: {
  domain: [number, number];
  range: [number, number];
  clamp?: boolean;
}): Scale {
  const { domain, range, clamp = false } = options;

  const scale = (value: number): number => {
    // Simple linear interpolation
    const domainExtent = domain[1] - domain[0];
    const rangeExtent = range[1] - range[0];

    let normalizedValue = (value - domain[0]) / domainExtent;

    if (clamp) {
      normalizedValue = Math.max(0, Math.min(1, normalizedValue));
    }

    return range[0] + normalizedValue * rangeExtent;
  };

  const invert = (value: number): number => {
    const domainExtent = domain[1] - domain[0];
    const rangeExtent = range[1] - range[0];

    const normalizedValue = (value - range[0]) / rangeExtent;
    return domain[0] + normalizedValue * domainExtent;
  };

  const ticks = (count = 5): number[] => {
    const step = (domain[1] - domain[0]) / (count - 1);
    return Array.from({ length: count }, (_, i) => domain[0] + i * step);
  };

  return { domain, range, scale, invert, ticks };
}

// Band scale implementation
function createBandScale(options: {
  domain: string[];
  range: [number, number];
  padding?: number;
  paddingInner?: number;
  paddingOuter?: number;
  align?: number;
}): Scale & { bandwidth: () => number } {
  const {
    domain,
    range,
    padding = 0.1,
    paddingInner = padding,
    paddingOuter = padding,
    align = 0.5
  } = options;

  const n = domain.length;
  const [start, stop] = range;
  const width = stop - start;

  // Calculate band width and step
  const totalPadding = (n - 1) * paddingInner + 2 * paddingOuter;
  const step = width / Math.max(1, n - paddingInner + 2 * paddingOuter);
  const bandWidth = step * (1 - paddingInner);

  const scale = (value: string): number => {
    const index = domain.indexOf(value);
    if (index === -1) return NaN;

    return start + (paddingOuter * step) + (index * step);
  };

  // Additional methods specific to band scales
  const bandwidth = (): number => bandWidth;

  const ticks = (): string[] => domain;

  return {
    domain,
    range,
    scale,
    ticks,
    bandwidth
  };
}

// Ordinal scale implementation (simplified)
function createOrdinalScale(options: {
  domain: string[];
  range: any[];
}): Scale {
  const { domain, range } = options;

  const scale = (value: string): any => {
    const index = domain.indexOf(value);
    if (index === -1) return range[0]; // Default to first range value
    return range[index % range.length];
  };

  const ticks = (): string[] => domain;

  return { domain, range, scale, ticks };
}

// Log scale implementation (placeholder)
function createLogScale(options: any): Scale {
  // Simple implementation for now
  return createLinearScale(options);
}

// Time scale implementation (placeholder)
function createTimeScale(options: any): Scale {
  // Simple implementation for now
  return createLinearScale(options);
}

// Export the scale component for use in visualizations
createViz({
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
    as: { default: 'scale' }
  },

  implementation: props => {
    const scale = createScale(props.type, {
      domain: props.domain,
      range: props.range,
      padding: props.padding,
      paddingInner: props.paddingInner !== null ? props.paddingInner : props.padding,
      paddingOuter: props.paddingOuter !== null ? props.paddingOuter : props.padding,
      align: props.align,
      clamp: props.clamp
    });

    return {
      [props.as]: scale
    };
  }
});
