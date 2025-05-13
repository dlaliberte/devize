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
import { Scale } from './scale-interface';

// Make sure define type is registered
registerDefineType();

// LinearScale class implementation
export class LinearScale implements Scale {
  private domain: [number, number];
  private range: [number, number];
  private clamp: boolean;
  private padding: number;
  private paddedDomain: [number, number];

  constructor(options: {
    domain: [number, number];
    range: [number, number];
    padding?: number;
    clamp?: boolean;
    nice?: boolean;
  }) {
    this.domain = [...options.domain];
    this.range = [...options.range];
    this.clamp = options.clamp || false;
    this.padding = options.padding || 0;

    // Apply "nice" adjustment to domain if requested
    if (options.nice) {
      // Simple implementation of "nice" - round to nearest 10
      this.domain = [
        Math.floor(this.domain[0] / 10) * 10,
        Math.ceil(this.domain[1] / 10) * 10
      ];
    }

    // Calculate padded domain
    const domainSize = this.domain[1] - this.domain[0];
    this.paddedDomain = [
      this.domain[0] - domainSize * this.padding,
      this.domain[1] + domainSize * this.padding
    ];
  }

  scale(value: number): number {
    const [d0, d1] = this.paddedDomain;
    const [r0, r1] = this.range;

    // Handle edge case of zero domain size
    if (d1 === d0) {
      return r0 + (r1 - r0) / 2;
    }

    // Calculate the scaled value
    let t = (value - d0) / (d1 - d0);

    // Apply clamping if specified
    if (this.clamp) {
      t = Math.max(0, Math.min(1, t));
    }

    return r0 + t * (r1 - r0);
  }

  invert(value: number): number {
    const [d0, d1] = this.paddedDomain;
    const [r0, r1] = this.range;

    // Handle edge case of zero range size
    if (r1 === r0) {
      return d0 + (d1 - d0) / 2;
    }

    const t = (value - r0) / (r1 - r0);
    return d0 + t * (d1 - d0);
  }

  ticks(count: number = 10): number[] {
    const [d0, d1] = this.paddedDomain;

    // Handle edge case of zero domain size
    if (d1 === d0) {
      return [d0];
    }

    const step = (d1 - d0) / Math.max(1, count - 1);
    return Array.from({ length: count }, (_, i) => d0 + i * step);
  }

  // Getter for domain
  getDomain(): [number, number] {
    return [...this.domain];
  }

  // Getter for range
  getRange(): [number, number] {
    return [...this.range];
  }
}

// Define a linear scale component
export const linearScaleDefinition = {
  type: "define",
  name: "linearScale",
  properties: {
    domain: { required: true },
    range: { required: true },
    padding: { default: 0 },
    clamp: { default: false },
    nice: { default: false }
  },
  implementation: (props) => {
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
    const scaleFunc = (value: number) => {
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
    const invertFunc = (value: number) => {
      // Handle edge case of zero range size
      if (rangeSize === 0) {
        return paddedDomainMin + paddedDomainSize / 2;
      }

      const normalizedValue = (value - rangeMin) / rangeSize;
      return paddedDomainMin + normalizedValue * paddedDomainSize;
    };

    // Create the ticks function
    const ticksFunc = (count = 10) => {
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
      scale: scaleFunc,
      invert: invertFunc,
      ticks: ticksFunc
    };

    return scaleObj;
  }
};

// Export a function to create a linear scale directly
export function createLinearScale(
  domain: [number, number],
  range: [number, number],
  options?: {
    padding?: number,
    clamp?: boolean,
    nice?: boolean
  }
): Scale {
  return buildViz({
    type: 'linearScale',
    domain,
    range,
    padding: options?.padding ?? 0,
    clamp: options?.clamp ?? false,
    nice: options?.nice ?? false
  }) as Scale;
}


// Minimal linear scale implementation
export function createMinimalLinearScale(options: {
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

export function registerLinearScaleComponent() {
  // Register the linear scale component with the builder
  buildViz(linearScaleDefinition);
  console.log('Linear scale component registered');
}
