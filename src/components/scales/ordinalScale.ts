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
import { Scale } from './scale';

// Make sure define type is registered
registerDefineType();

// Define an ordinal scale component
buildViz({
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
    const scale = (value: string): any => {
      const index = domain.indexOf(value);
      if (index === -1) return unknown; // Return unknown value for values not in domain
      return range[index % range.length];
    };

    // Create the ticks function
    const ticks = (): string[] => domain;

    // Return the scale object directly
    const scaleObj: Scale = {
      domain,
      range,
      scale,
      ticks
    };

    return scaleObj;
  }
});
