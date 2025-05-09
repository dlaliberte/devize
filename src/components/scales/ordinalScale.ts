/**
 * Ordinal Scale Component
 *
 * Purpose: Provides ordinal scale functionality for categorical data
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { Scale } from './scale-interface';

// Make sure define type is registered
registerDefineType();

// Define an ordinal scale component
export const ordinalScaleDefinition = {
  type: "define",
  name: "ordinalScale",
  properties: {
    domain: { required: true },
    range: { required: true },
    unknown: { default: undefined }
  },
  implementation: props => {
    const domain = props.domain;
    const range = props.range;
    const unknown = props.unknown !== undefined ? props.unknown : range[0];

    // Create the scale function
    const scaleFunc = (value: string): any => {
      const index = domain.indexOf(value);
      if (index === -1) return unknown; // Return unknown value for values not in domain
      return range[index % range.length];
    };

    // Create the ticks function
    const ticksFunc = (): string[] => domain;

    // Return the scale object directly
    const scaleObj: Scale = {
      domain,
      range,
      scale: scaleFunc,
      ticks: ticksFunc
    };

    return scaleObj;
  }
};

// Register the ordinal scale type
buildViz(ordinalScaleDefinition);

// Export a function to create an ordinal scale directly
export function createOrdinalScale(domain: string[], range: any[], unknown?: any): Scale {
  return buildViz({
    type: 'ordinalScale',
    domain,
    range,
    unknown
  }) as Scale;
}// Minimal ordinal scale implementation
export function createMinimalOrdinalScale(options: {
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
