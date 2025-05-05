// Data statistics component
import { createViz } from '../../core/devize';

createViz({
  type: "define",
  name: "dataStats",
  properties: {
    data: { required: true },
    field: { required: true },
    stats: { default: ['min', 'max', 'mean', 'median', 'sum', 'count'] },
    as: { default: 'stats' }
  },
  implementation: props => {
    // Extract values from the data array
    const values = Array.isArray(props.data)
      ? props.data.map(d => d[props.field])
      : [];

    // Calculate statistics
    const result: any = {};

    // Handle empty arrays
    if (values.length === 0) {
      if (props.stats.includes('min')) result.min = 0;
      if (props.stats.includes('max')) result.max = 100;
      if (props.stats.includes('mean')) result.mean = 0;
      if (props.stats.includes('median')) result.median = 0;
      if (props.stats.includes('sum')) result.sum = 0;
      if (props.stats.includes('count')) result.count = 0;

      // Return the result with a default key
      return {
        [props.as]: result
      };
    }

    // Calculate requested statistics
    if (props.stats.includes('min')) {
      result.min = Math.min(...values);
    }
    if (props.stats.includes('max')) {
      result.max = Math.max(...values);
    }
    if (props.stats.includes('mean')) {
      result.mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    if (props.stats.includes('median')) {
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      result.median = sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    }
    if (props.stats.includes('sum')) {
      result.sum = values.reduce((sum, val) => sum + val, 0);
    }
    if (props.stats.includes('count')) {
      result.count = values.length;
    }

    // Return the result with the specified key
    return {
      [props.as]: result
    };
  }
});
