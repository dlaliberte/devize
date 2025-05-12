# Bar Chart

A bar chart displays categorical data with rectangular bars whose heights or lengths are proportional to the values they represent. In Devize, bar charts are powerful tools for comparing values across categories.

## Overview

Bar charts excel at showing comparisons between discrete categories. They can be used to visualize:

- Comparisons across categories (e.g., sales by product)
- Time series data with discrete intervals (e.g., monthly revenue)
- Part-to-whole relationships when stacked (e.g., market share by company)

## Basic Usage

Here's a simple example of creating a bar chart with Devize:

```javascript
// Sample data
const salesData = [
  { product: "Product A", revenue: 420 },
  { product: "Product B", revenue: 650 },
  { product: "Product C", revenue: 340 },
  { product: "Product D", revenue: 570 },
  { product: "Product E", revenue: 320 }
];

buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" },
  color: "#3366CC",
  title: "Product Revenue",
  container: document.getElementById("viz-container")
});
```

This creates a basic bar chart with blue bars showing revenue for each product.

## Core Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| data | array | Array of data objects | Required |
| x | object | X-axis configuration (typically categories) | Required |
| y | object | Y-axis configuration (typically values) | Required |
| color | string/object | Bar color or color mapping | "#3366CC" |
| title | string/object | Chart title configuration | None |
| margin | object | Chart margins | `{ top: 40, right: 30, bottom: 60, left: 60 }` |
| tooltip | boolean/object | Tooltip configuration | false |
| grid | boolean | Whether to show grid lines | false |
| width | number | Chart width in pixels | 800 |
| height | number | Chart height in pixels | 400 |
| barPadding | number | Padding between bars (0-1) | 0.2 |
| legend | object | Legend configuration | `{ enabled: true, position: 'top-right' }` |

## Axis Configuration

Both `x` and `y` properties accept configuration objects with the following properties:

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| field | string | Data field to use | Required |
| title | string | Axis title | Same as field name |
| domain | array | Custom domain for the axis | Auto |
| format | function | Function to format axis labels | None |
| grid | boolean | Whether to show grid lines for this axis | false |
| tickCount | number | Approximate number of ticks to show | Auto |
| tickValues | array | Specific tick values to show | Auto |

For more details on axis configuration, see the [Axis Component documentation](../components/axis.md).

## Color Configuration

The `color` property can be a simple string for a single color, or an object for data-driven coloring:

```javascript
// Simple color
color: "#3366CC"

// Color mapping by field
color: {
  field: "category",
  scale: "categorical",
  range: ["#3366CC", "#DC3912", "#FF9900", "#109618"]
}
```

For more information on color scales and mappings, see the [Color Scales documentation](../scales/colorScales.md).

## Title Configuration

The `title` property can be a simple string or an object for more control:

```javascript
// Simple title
title: "Product Revenue"

// Detailed title configuration
title: {
  text: "Product Revenue",
  fontSize: 18,
  fontWeight: "bold",
  fontFamily: "Arial",
  color: "#333333",
  align: "center",
  padding: 20
}
```

## Tooltip Configuration

Tooltips provide additional information when users hover over bars. The `tooltip` property can be a boolean or an object for more control:

```javascript
// Simple tooltip
tooltip: true

// Detailed tooltip configuration
tooltip: {
  fields: ["product", "revenue", "profit"],
  format: {
    revenue: value => `${value.toLocaleString()}`,
    profit: value => `${value.toLocaleString()}`
  },
  title: d => d.product
}
```

For more details on tooltip configuration, see the [Tooltip documentation](../components/tooltip.md).

## Grouped Bar Charts

You can create grouped bar charts by using a categorical field for color:

```javascript
const salesData = [
  { product: "Product A", category: "Electronics", revenue: 420 },
  { product: "Product B", category: "Electronics", revenue: 650 },
  { product: "Product C", category: "Clothing", revenue: 340 },
  { product: "Product D", category: "Clothing", revenue: 570 },
  { product: "Product E", category: "Food", revenue: 320 }
];

buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" },
  color: { field: "category" },
  title: "Product Revenue by Category",
  container: document.getElementById("viz-container")
});
```

This creates a bar chart where bars are grouped by category and colored accordingly.

## Stacked Bar Charts

To create stacked bar charts, use the `stack` property:

```javascript
buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" },
  color: { field: "category" },
  stack: true,
  title: "Product Revenue by Category (Stacked)",
  container: document.getElementById("viz-container")
});
```

This creates a bar chart where bars for each product are stacked by category.

## Horizontal Bar Charts

For horizontal bar charts, set the `orientation` property to "horizontal":

```javascript
buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" },
  orientation: "horizontal",
  color: "#3366CC",
  title: "Product Revenue",
  container: document.getElementById("viz-container")
});
```

This creates a horizontal bar chart where bars extend from left to right.

## Customization Example

Here's a more comprehensive example showing various customization options:

```javascript
buildViz({
  type: "barChart",
  data: salesData,
  x: {
    field: "product",
    title: "Product Name",
    format: name => name.toUpperCase()
  },
  y: {
    field: "revenue",
    title: "Revenue ($)",
    domain: [0, 1000],
    grid: true
  },
  color: {
    field: "category",
    range: ["#3366CC", "#DC3912", "#FF9900"]
  },
  title: {
    text: "Product Revenue by Category",
    fontSize: 20,
    fontWeight: "bold",
    align: "center"
  },
  tooltip: {
    fields: ["product", "revenue", "category"],
    format: {
      revenue: value => `${value.toLocaleString()}`
    }
  },
  grid: true,
  width: 900,
  height: 500,
  margin: { top: 50, right: 50, bottom: 70, left: 70 },
  barPadding: 0.1,
  legend: {
    enabled: true,
    position: "top-right",
    title: "Category"
  },
  container: document.getElementById("viz-container")
});
```

## Interactions

You can add interactions to the bar chart to make it more engaging:

```javascript
buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" },
  color: "#3366CC",
  interactions: [
    {
      type: "hover",
      target: "bar",
      effect: {
        fill: "#FF9900",
        stroke: "#CC6600",
        strokeWidth: 2
      }
    },
    {
      type: "click",
      target: "bar",
      action: (data) => {
        console.log("Clicked:", data);
        // You could update other visualizations here
      }
    }
  ],
  container: document.getElementById("viz-container")
});
```

For more details on interactions, see the [Interactions documentation](../core/interactions.md).

## Responsive Bar Charts

To create responsive bar charts that adapt to container size:

```javascript
buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" },
  color: "#3366CC",
  responsive: true,
  aspectRatio: 16/9,  // Optional aspect ratio constraint
  container: document.getElementById("viz-container")
});
```

For more information on responsive visualizations, see the [Responsive Visualizations guide](../guides/responsive.md).

## Related Chart Types

- **[Column Chart](./columnChart.md)**: Vertical bars (essentially the same as a bar chart)
- **[Histogram](./histogram.md)**: For showing distribution of numerical data
- **[Line Chart](./lineChart.md)**: For showing trends over continuous dimensions
- **[Scatter Plot](./scatterPlot.md)**: For showing relationships between two variables

## Implementation Details

The bar chart is implemented as a composite visualization that includes:

1. A data processing component to prepare the data
2. Axes for the x and y dimensions
3. Rectangle elements for the bars
4. Optional legends, grid lines, and tooltips

Under the hood, it uses the constraint system to position all elements correctly and handle different scales and orientations.

## See Also

- [Data Binding](../guides/data-binding.md)
- [Scales and Axes](../guides/scales-and-axes.md)
- [Color Palettes](../guides/color-palettes.md)
- [Chart Layout](../guides/chart-layout.md)
- [Accessibility](../guides/accessibility.md)
