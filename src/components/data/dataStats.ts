import { createViz } from '../../core/devize';

// Define a dataStats component that calculates statistics from data
createViz({
  type: "define",
  name: "dataStats",
  properties: {
    data: { required: true },
    field: { required: true },
    stats: { default: ['min', 'max', 'mean'] }
  },
  implementation: props => {
    // Extract values from the data array
    const values = props.data.map(d => d[props.field]);

    // Calculate statistics
    const result: Record<string, any> = {};

    if (props.stats.includes('min')) {
      result.min = Math.min(...values);
    }

    if (props.stats.includes('max')) {
      result.max = Math.max(...values);
    }

    if (props.stats.includes('mean')) {
      result.mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    }

    if (props.stats.includes('sum')) {
      result.sum = values.reduce((sum, v) => sum + v, 0);
    }

    if (props.stats.includes('count')) {
      result.count = values.length;
    }

    if (props.stats.includes('quantiles')) {
      const sorted = [...values].sort((a, b) => a - b);
      result.q1 = sorted[Math.floor(sorted.length * 0.25)];
      result.median = sorted[Math.floor(sorted.length * 0.5)];
      result.q3 = sorted[Math.floor(sorted.length * 0.75)];
    }

    return result;
  }
}, document.createElement('div'));
