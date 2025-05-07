# buildViz Function

## Overview

`buildViz` is the core function of the Devize library that creates visualizations from declarative specifications. It takes a visualization specification and returns a visualization instance.

## Function Signature

```typescript
function buildViz(spec: VizSpec): VizInstance
```

### Parameters

- `spec`: A visualization specification object that describes what to render or transform
  - For rendering visualizations, include a `container` property with the target HTML element

### Return Value

- `VizInstance`: An object representing the created visualization, which may contain:
  - `element`: The DOM element of the visualization (for rendering visualizations)
  - `data`: Transformed data (for data transformation visualizations)
  - `spec`: The specification used to create the visualization
  - Additional properties specific to the visualization type

## Visualization Types

Devize supports two primary types of visualizations:

### 1. Rendering Visualizations

These visualizations produce visual output and require a container element:

```javascript
const myViz = buildViz({
  type: "rectangle",
  x: 50,
  y: 50,
  width: 100,
  height: 80,
  fill: "#6699CC",
  stroke: "#336699",
  strokeWidth: 2,
  container: document.getElementById("viz-container")
});
```

### 2. Data Transformation Visualizations

These visualizations transform data without producing visual output:

```javascript
// Sample data
const salesData = [
  { product: "Product A", revenue: 420 },
  { product: "Product B", revenue: 650 },
  { product: "Product C", revenue: 340 },
  { product: "Product D", revenue: 570 }
];

// Extract product names from data
const extractedData = buildViz({
  type: "dataExtract",
  data: salesData,
  field: "product",
  as: "productNames"
});

// Use the extracted data in a rendering visualization
const axisViz = buildViz({
  type: "axis",
  orientation: "bottom",
  length: 500,
  values: extractedData.data.productNames,
  title: "Products",
  container: document.getElementById("viz-container")
});
```

## Functional Approach

When possible, visualizations should be designed with a functional approach:

```javascript
// Transform data
const transformedData = buildViz({
  type: "dataTransform",
  data: rawData,
  operations: [
    { type: "filter", test: d => d.value > 0 },
    { type: "sort", field: "value", order: "descending" }
  ]
});

// Use transformed data in visualization
const barChart = buildViz({
  type: "barChart",
  data: transformedData.data,
  x: { field: "category" },
  y: { field: "value" },
  container: document.getElementById("viz-container")
});
```

## Composition

Visualizations can be composed together:

```javascript
// Create a complete visualization pipeline
const dashboard = buildViz({
  type: "group",
  children: [
    {
      type: "dataExtract",
      data: salesData,
      field: "product",
      as: "categories"
    },
    {
      type: "dataExtract",
      data: salesData,
      field: "revenue",
      as: "values"
    },
    {
      type: "barChart",
      categories: props => props.categories,
      values: props => props.values,
      title: "Sales Revenue"
    }
  ],
  container: document.getElementById("viz-container")
});
```

## Error Handling

The `buildViz` function performs validation on the provided specification and will throw errors for:

- Missing type property
- Unknown visualization types
- Missing required properties for a specific type
- Missing container for rendering visualizations

Always wrap your `buildViz` calls in try-catch blocks in production code to handle potential errors gracefully.
