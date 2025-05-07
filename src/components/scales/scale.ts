// Base scale functionality
import { createViz } from '../../core/creator';
import './linearScale'; // Import to ensure the visualization types are registered
import './bandScale';   // Import to ensure the visualization types are registered

import { registerDefineType } from '../../core/define';

// Make sure define type is registered
registerDefineType();

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
  // Create the appropriate scale visualization based on type
  let scaleViz;

  switch (type) {
    case 'linear':
      scaleViz = createViz({
        type: 'linearScale',
        domain: options.domain,
        range: options.range,
        padding: options.padding || 0,
        clamp: options.clamp || false,
        nice: options.nice || false
      });
      break;

    case 'band':
      scaleViz = createViz({
        type: 'bandScale',
        domain: options.domain,
        range: options.range,
        padding: options.padding || 0.1,
        paddingInner: options.paddingInner,
        paddingOuter: options.paddingOuter,
        align: options.align || 0.5
      });
      break;

    case 'ordinal':
      // Implement ordinal scale
      return createOrdinalScale(options);

    case 'log':
      // For now, use linear scale as placeholder
      // TODO: Implement proper log scale
      console.warn('Log scale is not fully implemented yet, using linear scale as fallback');
      scaleViz = createViz({
        type: 'linearScale',
        domain: options.domain,
        range: options.range,
        clamp: options.clamp || false
      });
      break;

    case 'time':
      // For now, use linear scale as placeholder
      // TODO: Implement proper time scale
      console.warn('Time scale is not fully implemented yet, using linear scale as fallback');
      scaleViz = createViz({
        type: 'linearScale',
        domain: options.domain,
        range: options.range,
        clamp: options.clamp || false
      });
      break;

    default:
      throw new Error(`Unknown scale type: ${type}`);
  }

  // For ordinal scale which is implemented directly
  if (type === 'ordinal') {
    return scaleViz; // Already returned above
  }

  // For other scales, return the scale object from the visualization
  return scaleViz;
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
