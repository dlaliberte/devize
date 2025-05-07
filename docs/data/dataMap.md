# dataMap Component

## Purpose
The `dataMap` component maps each item in a data array to a visualization component. It's useful for creating data-driven visualizations like bar charts, scatter plots, etc.

## Properties
- `data` (required): The data array to map
- `map` (required): A function that maps each data item to a visualization component
- `keyField` (optional): A field to use as a unique key for each item

## Examples

### Basic Usage
```javascript
{
  type: 'dataMap',
  data: salesData,
  map: (d, i) => ({
    type: 'rectangle',
    x: i * 50,
    y: 0,
    width: 40,
    height: d.revenue / 10,
    fill: 'steelblue'
  })
}
```

### Creating Bars for a Bar Chart
```javascript
{
  type: 'dataMap',
  data: props => props.data,
  map: (d, i, array, props) => {
    const xField = props.x.field;
    const yField = props.y.field;
    const chartWidth = props.dimensions.chartWidth;
    const chartHeight = props.dimensions.chartHeight;
    const yMax = props.yStats.max;

    // Calculate scales
    const barWidth = (chartWidth / array.length) * 0.8;
    const xScale = (index) => index * (chartWidth / array.length) + (chartWidth / array.length) * 0.5;
    const yScale = (value) => chartHeight - (value / yMax * chartHeight);

    // Calculate bar position and dimensions
    const barHeight = chartHeight - yScale(d[yField]);
    const barX = xScale(i) - barWidth / 2;
    const barY = yScale(d[yField]);

    return {
      type: 'rectangle',
      x: barX,
      y: barY,
      width: barWidth,
      height: barHeight,
      fill: 'steelblue',
      data: d,
      tooltip: props.tooltip
    };
  }
}
```

## Implementation Details
The component applies the map function to each item in the data array and returns the resulting array of visualization components.

```typescript
buildViz({
  type: "define",
  name: "dataMap",
  properties: {
    data: { required: true },
    map: { required: true },
    keyField: { default: undefined }
  },
  implementation: props => {
    // Get the data array, evaluating it if it's a function
    const dataArray = typeof props.data === 'function'
      ? props.data(props)
      : (Array.isArray(props.data) ? props.data : []);

    // Map each data item to a visualization component
    return {
      type: 'group',
      children: dataArray.map((d, i, array) => {
        const component = props.map(d, i, array, props);

        // Add a key if keyField is specified
        if (props.keyField && d[props.keyField]) {
          component.key = d[props.keyField];
        }

        return component;
      })
    };
  }
}, document.createElement('div'));
```
