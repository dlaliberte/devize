import { createViz } from '../../core/creator';
import { registerDefineType } from '../../core/define';

// Make sure define type is registered
registerDefineType();

// Define a linear scale component
createViz({
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
      const normalizedValue = (value - rangeMin) / rangeSize;
      return paddedDomainMin + normalizedValue * paddedDomainSize;
    };

    // Create the ticks function
    const ticks = (count = 10) => {
      const step = (paddedDomainMax - paddedDomainMin) / (count - 1);
      return Array.from({ length: count }, (_, i) => paddedDomainMin + i * step);
    };

    // Return the scale object
    return {
      domain: computedDomain,
      range: props.range,
      scale,
      invert,
      ticks
    };
  }
});
