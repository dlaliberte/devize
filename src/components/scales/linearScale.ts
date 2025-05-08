/**
 * Linear Scale Component
 *
 * Purpose: Provides linear scale functionality for continuous data
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { Scale } from './scale';

// Make sure define type is registered
registerDefineType();

// Define a linear scale component
buildViz({
  type: "define",
  name: "linearScale",
  properties: {
    domain: { required: true },
    range: { required: true },
    padding: { default: 0 },
    clamp: { default: false },
    nice: { default: false }
  },
  implementation: props => {
    const [domainMin, domainMax] = props.domain;
    const [rangeMin, rangeMax] = props.range;

    // Apply "nice" adjustment to domain if requested
    let computedDomain = [...props.domain];
    if (props.nice) {
      // Simple implementation of "nice" - round to nearest 10
      computedDomain = [
        Math.floor(domainMin / 10) * 10,
        Math.ceil(domainMax / 10) * 10
      ];
    }

    const domainSize = computedDomain[1] - computedDomain[0];
    const rangeSize = rangeMax - rangeMin;

    // Apply padding if specified
    const paddedDomainMin = computedDomain[0] - domainSize * props.padding;
    const paddedDomainMax = computedDomain[1] + domainSize * props.padding;
    const paddedDomainSize = paddedDomainMax - paddedDomainMin;

    // Create the scale function
    const scale = (value) => {
      // Handle edge case of zero domain size
      if (paddedDomainSize === 0) {
        return rangeMin + rangeSize / 2;
      }

      // Calculate the scaled value
      let scaled = rangeMin + ((value - paddedDomainMin) / paddedDomainSize) * rangeSize;

      // Apply clamping if specified
      if (props.clamp) {
        scaled = Math.max(rangeMin, Math.min(rangeMax, scaled));
      }

      return scaled;
    };

    // Create the invert function
    const invert = (value) => {
      // Handle edge case of zero range size
      if (rangeSize === 0) {
        return paddedDomainMin + paddedDomainSize / 2;
      }

      const normalizedValue = (value - rangeMin) / rangeSize;
      return paddedDomainMin + normalizedValue * paddedDomainSize;
    };

    // Create the ticks function
    const ticks = (count = 10) => {
      // Handle edge case of zero domain size
      if (paddedDomainSize === 0) {
        return [paddedDomainMin];
      }

      const step = paddedDomainSize / Math.max(1, count - 1);
      return Array.from({ length: count }, (_, i) => paddedDomainMin + i * step);
    };

    // Return the scale object directly
    const scaleObj: Scale = {
      domain: computedDomain,
      range: props.range,
      scale,
      invert,
      ticks
    };

    return scaleObj;
  }
});
