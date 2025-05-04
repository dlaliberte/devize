import { createViz } from '../../core/devize';

// Define a linear scale component
createViz({
  type: "define",
  name: "linearScale",
  properties: {
    domain: { required: true },
    range: { required: true },
    padding: { default: 0 },
    clamp: { default: false }
  },
  implementation: props => {
    const [domainMin, domainMax] = props.domain;
    const [rangeMin, rangeMax] = props.range;
    const domainSize = domainMax - domainMin;

    // Apply padding if specified
    const paddedDomainMin = domainMin - domainSize * props.padding;
    const paddedDomainMax = domainMax + domainSize * props.padding;
    const paddedDomainSize = paddedDomainMax - paddedDomainMin;

    const rangeSize = rangeMax - rangeMin;

    // Return a scale function
    return value => {
      // Calculate the scaled value
      let scaled = rangeMin + ((value - paddedDomainMin) / paddedDomainSize) * rangeSize;

      // Apply clamping if specified
      if (props.clamp) {
        scaled = Math.max(rangeMin, Math.min(rangeMax, scaled));
      }

      return scaled;
    };
  }
}, document.createElement('div'));
