# Devize Tutorial Part 4: Data Handling and Transformations

## Introduction

Welcome to the fourth part of the Devize tutorial series! In this tutorial, we'll focus on data handling in Devize, including data sources, data binding, and transformations.

Effective data visualization requires flexible and powerful data handling capabilities. Devize provides a comprehensive set of features for working with data, from simple data binding to complex transformations.

## Data Binding Basics

Data binding is the process of connecting your data to visual properties. In Devize, data binding is declarative, meaning you specify what data should be connected to what visual properties.

### Simple Data Binding

```javascript
import { createViz } from 'devize';

// Sample data
const data = [
  { category: "A", value: 5 },
  { category: "B", value: 10 },
  { category: "C", value: 15 },
  { category: "D", value: 7 },
  { category: "E", value: 12 }
];

// Create a simple bar chart with data binding
const barChart = createViz({
  type: "group",
  children: data.map((item, index) => ({
    type: "rectangle",
    x: index * 60 + 20,
    y: 200 - item.value * 10,
    width: 40,
    height: item.value * 10,
    fill: "steelblue"
  }))
}, container);
```

### Field Specifications

For more complex visualizations, Devize uses field specifications to bind data to visual properties:

```javascript
const scatterPlot = createViz({
  type: "scatterPlot",
  data: populationData,
  x: { field: "income", type: "quantitative" },
  y: { field: "lifeExpectancy", type: "quantitative" },
  size: { field: "population", type: "quantitative" },
  color: { field: "region", type: "categorical" }
}, container);
```

Field specifications can include:
- `field`: The name of the data field to bind to
- `type`: The data type (quantitative, categorical, ordinal, temporal)
- `scale`: The scale to use (linear, log, ordinal, etc.)
- `domain`: The input domain for the scale
- `range`: The output range for the scale

### Data Mapping

For more control over how data is mapped to visual elements, you can use the `dataMap` type:

```javascript
const customBarChart = createViz({
  type: "group",
  constraints: [
    { type: "fitToContainer", padding: 20 }
  ],
  children: [
    {
      type: "dataMap",
      data: salesData,
      template: (item, index, array) => ({
        type: "rectangle",
        x: index * (400 / array.length),
        y: 200 - item.revenue / 10,
        width: (400 / array.length) * 0.8,
        height: item.revenue / 10,
        fill: item.profit > 0 ? "green" : "red",
        tooltip: `Product: ${item.product}\nRevenue: $${item.revenue}\nProfit: $${item.profit}`
      })
    }
  ]
}, container);
```

## Data Sources

Devize supports multiple types of data sources:

### Inline Data

```javascript
const vizWithInlineData = createViz({
  type: "barChart",
  data: {
    type: "inline",
    values: [
      { product: "A", revenue: 420 },
      { product: "B", revenue: 650 },
      { product: "C", revenue: 340 }
    ]
  },
  x: { field: "product" },
  y: { field: "revenue" }
}, container);
```

### Referenced Data

```javascript
// Register data
registerData("salesData", [
  { product: "A", revenue: 420 },
  { product: "B", revenue: 650 },
  { product: "C", revenue: 340 }
]);

// Create visualization with referenced data
const vizWithReferencedData = createViz({
  type: "barChart",
  data: {
    type: "reference",
    name: "salesData"
  },
  x: { field: "product" },
  y: { field: "revenue" }
}, container);
```

### URL Data

```javascript
const vizWithUrlData = createViz({
  type: "barChart",
  data: {
    type: "url",
    url: "https://example.com/data/sales.json",
    format: "json"
  },
  x: { field: "product" },
  y: { field: "revenue" }
}, container);
```

## Data Transformations

Devize provides several built-in transformations for common operations:

### Filtering

```javascript
const filteredViz = createViz({
  type: "barChart",
  data: salesData,
  transforms: [
    { type: "filter", test: "d => d.revenue > 400" }
  ],
  x: { field: "product" },
  y: { field: "revenue" }
}, container);
```

### Aggregation

```javascript
const aggregatedViz = createViz({
  type: "barChart",
  data: salesByRegion,
  transforms: [
    {
      type: "aggregate",
      groupBy: "region",
      ops: ["sum"],
      fields: ["revenue"]
    }
  ],
  x: { field: "region" },
  y: { field: "sum_revenue" }
}, container);
```

### Sorting

```javascript
const sortedViz = createViz({
  type: "barChart",
  data: salesData,
  transforms: [
    { type: "sort", field: "revenue", order: "descending" }
  ],
  x: { field: "product" },
  y: { field: "revenue" }
}, container);
```

### Binning

```javascript
const histogramViz = createViz({
  type: "barChart",
  data: measurementData,
  transforms: [
    {
      type: "bin",
      field: "value",
      bins: 10,
      as: ["bin_start", "bin_end", "count"]
    }
  ],
  x: { field: "bin_start" },
  y: { field: "count" }
}, container);
```

### Joining Data

```javascript
const joinedViz = createViz({
  type: "scatterPlot",
  data: {
    type: "inline",
    values: salesData
  },
  transforms: [
    {
      type: "lookup",
      from: {
        type: "inline",
        values: productDetails,
        key: "productId"
      },
      lookup: "productId",
      as: ["category", "manufacturer", "launchDate"]
    }
  ],
  x: { field: "revenue" },
  y: { field: "profit" },
  color: { field: "category" }
}, container);
```

## Derived Fields

You can create new fields derived from existing ones:

```javascript
const derivedFieldViz = createViz({
  type: "barChart",
  data: salesData,
  transforms: [
    {
      type: "formula",
      expr: "d.revenue - d.cost",
      as: "profit"
    },
    {
      type: "formula",
      expr: "d.profit / d.revenue * 100",
      as: "profitMargin"
    }
  ],
  x: { field: "product" },
  y: { field: "profitMargin" }
}, container);
```

## Data Update Patterns

Devize makes it easy to update visualizations when data changes:

### Updating Referenced Data

```javascript
// Initial visualization
registerData("salesData", initialSalesData);

const salesViz = createViz({
  type: "barChart",
  data: {
    type: "reference",
    name: "salesData"
  },
  x: { field: "product" },
  y: { field: "revenue" }
}, container);

// Later, update the data
updateData("salesData", newSalesData);
// The visualization will automatically update
```

### Explicit Updates

```javascript
// Initial visualization
const stockViz = createViz({
  type: "lineChart",
  data: initialStockData,
  x: { field: "date" },
  y: { field: "price" }
}, container);

// Later, update the visualization with new data
updateViz(stockViz, {
  data: newStockData
});
```

## Advanced Data Binding

### Conditional Binding

You can use expressions to conditionally bind data to visual properties:

```javascript
const conditionalViz = createViz({
  type: "scatterPlot",
  data: salesData,
  x: { field: "revenue" },
  y: { field: "profit" },
  size: {
    expr: "d.revenue > 1000 ? 15 : 5"
  },
  color: {
    expr: "d.profit > 0 ? 'green' : d.profit > -100 ? 'orange' : 'red'"
  }
}, container);
```

### Multi-Series Data

For multi-series data, you can use the `series` field specification:

```javascript
const multiSeriesViz = createViz({
  type: "lineChart",
  data: timeSeriesData,
  x: { field: "date" },
  y: { field: "value" },
  series: { field: "category" },
  color: { field: "category" }
}, container);
```

### Nested Data

Devize can handle nested data structures:

```javascript
const nestedDataViz = createViz({
  type: "treemap",
  data: hierarchicalData,
  size: { field: "value" },
  color: { field: "category" },
  hierarchy: {
    field: "children",
    levels: ["region", "country", "city"]
  }
}, container);
```

## Next Steps

In this tutorial, we've explored data handling in Devize, including data binding, data sources, and transformations. We've learned how to connect data to visual properties, transform data for visualization, and update visualizations when data changes.

In the next tutorial, we'll dive into interactivity and animation, learning how to create dynamic and interactive visualizations.

## Exercises

1. Create a bar chart that filters data based on a threshold value.
2. Build a scatter plot that uses data from a URL source.
3. Create a visualization that joins data from two different sources.
4. Implement a chart that uses derived fields to calculate and visualize profit margins.
5. Build a multi-series line chart that updates when the data changes.

Happy visualizing with Devize!
