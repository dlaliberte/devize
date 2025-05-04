# dataExtract Component

## Purpose
The `dataExtract` component extracts values from a data array based on a specified field. It's useful for preparing data for visualization components like axes.

## Properties
- `data` (required): The data array to extract values from
- `field` (required): The field name to extract from each data item
- `as` (optional, default: 'values'): The name to assign to the extracted values in the output

## Examples

### Basic Usage
```javascript
{
  type: 'dataExtract',
  data: myDataArray,
  field: 'revenue',
  as: 'revenueValues'
}
```

### Using with Axis Component
```javascript
// Sample data
const salesData = [
  { product: "Product A", revenue: 420 },
  { product: "Product B", revenue: 650 },
  { product: "Product C", revenue: 340 },
  { product: "Product D", revenue: 570 }
];

// First extract the values
{
  type: 'dataExtract',
  data: salesData,
  field: 'product',
  as: 'productNames'
},
// Then use them in an axis
{
  type: 'axis',
  orientation: 'bottom',
  length: 500,
  values: props => props.productNames,
  title: 'Products'
}
```

## Implementation Details
The component extracts the specified field from each item in the data array and makes the resulting array available under the specified name in the props passed to child components.

```typescript
createViz({
  type: "define",
  name: "dataExtract",
  properties: {
    data: { required: true },
    field: { required: true },
    as: { default: 'values' }
  },
  implementation: props => {
    // Extract values from the data array
    const values = Array.isArray(props.data)
      ? props.data.map(d => d[props.field])
      : [];

    // Return an object with the extracted values
    return {
      [props.as]: values
    };
  }
}, document.createElement('div'));
```
