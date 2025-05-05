import { createViz } from '../../core/devize';

// Define a band scale component (useful for bar charts)
createViz({
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

    // Calculate band width and step
    const width = rangeMax - rangeMin;
    const totalPadding = (n - 1) * paddingInner + 2 * paddingOuter;
    const step = width / Math.max(1, n - paddingInner + 2 * paddingOuter);
    const bandWidth = step * (1 - paddingInner);

    // Return an object with scale function and bandwidth
    return {
      scale: value => {
        const index = domain.indexOf(value);
        if (index === -1) return null;
        return rangeMin + (paddingOuter * step) + (index * step);
      },
      bandwidth: () => bandWidth,
      domain: domain,
      ticks: () => domain
    };
  }
});
