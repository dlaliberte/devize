/**
 * Band Scale Component
 *
 * Purpose: Provides band scale functionality for categorical data
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { Scale } from './scale';

// Make sure define type is registered
registerDefineType();

// Define a band scale component
export const bandScaleDefinition = {
  type: "define",
  name: "bandScale",
  properties: {
    domain: { required: true },
    range: { required: true },
    padding: { default: 0.1 },
    paddingInner: { default: null },
    paddingOuter: { default: null },
    align: { default: 0.5 }
  },
  implementation: props => {
    const domain = props.domain;
    const [rangeMin, rangeMax] = props.range;
    const n = domain.length;
    const padding = props.padding;
    const paddingInner = props.paddingInner !== null ? props.paddingInner : padding;
    const paddingOuter = props.paddingOuter !== null ? props.paddingOuter : padding;
    const align = props.align;

    // Calculate band width and step
    const width = rangeMax - rangeMin;
    const step = n === 0 ? 0 : width / Math.max(1, n - paddingInner + 2 * paddingOuter);
    const bandWidth = step * (1 - paddingInner);

    // Calculate the start position based on alignment
    const start = rangeMin + align * (width - (n * step - paddingInner * step));

    // Create the scale function
    const scaleFunc = (value) => {
      const index = domain.indexOf(value);
      if (index === -1) return NaN;
      return start + (paddingOuter * step) + (index * step);
    };

    // Create the bandwidth function
    const bandwidthFunc = () => bandWidth;

    // Create the ticks function
    const ticksFunc = () => domain;

    // Return the scale object directly
    const scaleObj: Scale = {
      domain,
      range: props.range,
      scale: scaleFunc,
      bandwidth: bandwidthFunc,
      ticks: ticksFunc
    };

    return scaleObj;
  }
};

// Register the band scale type
buildViz(bandScaleDefinition);

// Export a function to create a band scale directly
export function createBandScale(
  domain: string[],
  range: [number, number],
  options?: {
    padding?: number,
    paddingInner?: number,
    paddingOuter?: number,
    align?: number
  }
): Scale {
  return buildViz({
    type: 'bandScale',
    domain,
    range,
    padding: options?.padding ?? 0.1,
    paddingInner: options?.paddingInner ?? null,
    paddingOuter: options?.paddingOuter ?? null,
    align: options?.align ?? 0.5
  }) as Scale;
}
