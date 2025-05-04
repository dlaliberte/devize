import { createViz } from '../../core/devize';

// Define a band scale component (useful for bar charts)
createViz({
  type: "define",
  name: "bandScale",
  properties: {
    domain: { required: true },
    range: { required: true },
    padding: { default: 0.1 },
    outerPadding: { default: 0 }
  },
  implementation: props => {
    const domain = props.domain;
    const [rangeMin, rangeMax] = props.range;
    const n = domain.length;
    const step = (rangeMax - rangeMin) / Math.max(1, n - props.padding + props.outerPadding * 2);
    const bandWidth = step * (1 - props.padding);

    // Return an object with scale function and bandwidth
    return {
      scale: value => {
        const index = domain.indexOf(value);
        if (index === -1) return null;
        return rangeMin + props.outerPadding * step + index * step;
      },
      bandwidth: bandWidth
    };
  }
}, document.createElement('div'));
