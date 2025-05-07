import { buildViz } from '../../core/creator';

import { registerDefineType } from '../../core/define';

// Make sure define type is registered
registerDefineType();

// Define a band scale component (useful for bar charts)
buildViz({
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
    const totalPadding = (n - 1) * paddingInner + 2 * paddingOuter;
    const step = width / Math.max(1, n - paddingInner + 2 * paddingOuter);
    const bandWidth = step * (1 - paddingInner);

    // Calculate the start position based on alignment
    const start = rangeMin + align * (width - (n * step - paddingInner * step));

    // Create the scale function
    const scale = (value) => {
      const index = domain.indexOf(value);
      if (index === -1) return NaN;
      return start + (paddingOuter * step) + (index * step);
    };

    // Create the bandwidth function
    const bandwidth = () => bandWidth;

    // Create the ticks function
    const ticks = () => domain;

    // Return the scale object
    return {
      domain,
      range: props.range,
      scale,
      bandwidth,
      ticks
    };
  }
});
