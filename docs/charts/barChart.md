# Bar Chart

The bar chart is a common visualization type for comparing quantities across categories.

## Basic Usage

```javascript
// Sample data
const salesData = [
  { product: "Product A", revenue: 420 },
  { product: "Product B", revenue: 650 },
  { product: "Product C", revenue: 340 },
  { product: "Product D", revenue: 570 }
];

createViz({
  type: "barChart",
  data: salesData,
  x: { field: "product", type: "ordinal" },
  y: { field: "revenue", type: "quantitative" },
  color: "#3366CC",
  constraints: [
    { type: "fitToContainer", priority: "high" },
    { type: "barWidthRatio", value: 0.7 }
  ]
}, document.getElementById("viz-container"));
```

## Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| data | array | Array of data objects | Required |
| x | object | X-axis configuration | Required |
| y | object | Y-axis configuration | Required |
| color | string/object | Bar color or color mapping | "#3366CC" |
| title | string/object | Chart title configuration | None |
| constraints | array | Array of constraint specifications | [] |

## Customization

````javascript
createViz({
  type: "barChart",
  data: salesData,
  x: {
    field: "product",
    type: "ordinal",
    axis: {
      title: "Products",
      titleFontSize: 14,
      labelAngle: -45,
      labelFontSize: 12
    }
  },
  y: {
    field: "revenue",
    type: "quantitative",
    axis: {
      title: "Revenue ($)",
      titleFontSize: 14,
      gridLines: true
    }
  },
  color: {
    field: "product",
    scale: "categorical",
    range: ["#
