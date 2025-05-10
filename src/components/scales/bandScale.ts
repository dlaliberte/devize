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
import { Scale } from './scale-interface';
import { AdditiveBlending } from 'three';

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
    let { domain, range, padding, align, paddingInner, paddingOuter } = props;
    const [rangeMin, rangeMax] = range;
    const n = domain.length;

    paddingInner = paddingInner != null ? paddingInner : padding;
    paddingOuter = paddingOuter != null ? paddingOuter : padding;


    // Calculate band width and step
    const width = rangeMax - rangeMin;
    const step = n === 0 ? 0 : width / Math.max(1, n - paddingInner + 2 * paddingOuter);
    const bandWidth = step * (1 - paddingInner);

    // Calculate the start position based on alignment
    // For align=0 (left), we want to start exactly at rangeMin + paddingOuter*step
    // For align=1 (right), we want the last band to end exactly at rangeMax - paddingOuter*step
    // For align=0.5 (center), we want to center the bands in the range
    const totalBandWidth = n * step - paddingInner * step;
    const remainingSpace = width - totalBandWidth;
    const start = rangeMin + (align * remainingSpace);

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

// Minimal band scale implementation
export function createMinimalBandScale(options: {
  domain: string[];
  range: [number, number];
  padding?: number;
  paddingInner?: number;
  paddingOuter?: number;
  align?: number;
}): Scale {
  const {
    domain, range, padding = 0.1, paddingInner = padding, paddingOuter = padding, align = 0.5
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

export function registerBandScaleComponent() {
  // Register the band scale component with the builder
  buildViz(bandScaleDefinition);
  console.log('Band scale component registered');
}
registerBandScaleComponent();
