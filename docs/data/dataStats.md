# dataStats Component

## Purpose
The `dataStats` component calculates statistics from a data array based on a specified field. It's useful for computing values needed for scales, axes, and other visualization components.

## Properties
- `data` (required): The data array to calculate statistics from
- `field` (required): The field name to use for calculations
- `stats` (optional, default: ['min', 'max', 'mean']): The statistics to calculate
- `as` (optional, default: undefined): If provided, all statistics will be nested under this name

## Supported Statistics
- `min`: Minimum value
- `max`: Maximum value
- `mean`: Average value
- `sum`: Sum of all values
- `count`: Number of values
- `quantiles`: Quartiles (q1, median, q3)

## Examples

### Basic Usage
```javascript
{
  type: 'dataStats',
  data: salesData,
  field: 'revenue',
  stats: ['min', 'max', 'mean']
}
```

### Using with Y-Axis
```javascript
// Calculate statistics
{
  type: 'dataStats',
  data: salesData,
  field: 'revenue',
  stats: ['min', 'max'],
  as: 'revenueStats'
},
// Generate axis values
{
  type: 'compute',
  input: props => props.revenueStats,
  fn: stats => [0, stats.max * 0.25, stats.max * 0.5, stats.max * 0.75, stats.max],
  as: 'yAxisValues'
},
// Use in axis
{
  type: 'axis',
  orientation: 'left',
  length: 400,
  values: props => props.yAxisValues,
  title: 'Revenue'
}
```

## Implementation Details
The component calculates the requested statistics from the specified field in the data array and makes the results available in the props passed to child components.

```typescript
createViz({
  type: "define",
  name: "dataStats",
  properties: {
    data: { required: true },
    field: { required: true },
    stats: { default: ['min', 'max', 'mean'] },
    as: { default: undefined }
  },
  implementation: props => {
    // Extract values from the data array
    const values = Array.isArray(props.data)
      ? props.data.map(d => d[props.field])
      : [];

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

    // Return the results, either directly or nested
    return props.as ? { [props.as]: result } : result;
  }
}, document.createElement('div'));
```
