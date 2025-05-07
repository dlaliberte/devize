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

buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product", type: "ordinal" },
  y: { field: "revenue", type: "quantitative" },
  color: "#3366CC",
  constraints: [
    { type: "fitToContainer", priority: "high" },
    { type: "barWidthRatio", value: 0.7 }
  ],
  container: document.getElementById("viz-container")
});
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
| container | HTMLElement | Container element for rendering | Required |
| orientation | string | "vertical" or "horizontal" | "vertical" |
| barPadding | number | Padding between bars (in pixels) | 2 |
| barCornerRadius | number | Radius for rounded bar corners | 0 |
| animate | boolean | Whether to animate the bars | false |
| animationDuration | number | Duration of animations (in ms) | 500 |

## Axis Configuration

Both `x` and `y` properties accept configuration objects with the following properties:

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| field | string | Data field to use | Required |
| type | string | "ordinal", "quantitative", "temporal" | Required |
| domain | array | Custom domain for the axis | Auto |
| range | array | Custom range for the axis | Auto |
| axis | object | Axis appearance configuration | {} |

### Axis Appearance

```javascript
axis: {
  title: "Revenue ($)",
  titleFontSize: 14,
  titleFontWeight: "bold",
  titlePadding: 10,
  labelFontSize: 12,
  labelAngle: 0,
  labelPadding: 5,
  gridLines: true,
  gridLineStroke: "#CCCCCC",
  gridLineStrokeWidth: 1,
  gridLineDashArray: "none",
  tickSize: 5,
  tickPadding: 3
}
```

## Color Configuration

The `color` property can be a simple string for a single color, or an object for more complex color mappings:

```javascript
// Simple color
color: "#3366CC"

// Color mapping by field
color: {
  field: "product",
  scale: "categorical",
  range: ["#3366CC", "#DC3912", "#FF9900", "#109618"]
}

// Color mapping by value
color: {
  field: "revenue",
  scale: "sequential",
  range: ["#EFEFEF", "#3366CC"]
}
```

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

## Customization Example

```javascript
buildViz({
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
    range: ["#3366CC", "#DC3912", "#FF9900", "#109618"]
  },
  title: {
    text: "Product Revenue",
    fontSize: 18,
    fontWeight: "bold",
    align: "center"
  },
  barCornerRadius: 3,
  animate: true,
  constraints: [
    { type: "fitToContainer", priority: "high" },
    { type: "barWidthRatio", value: 0.7 },
    { type: "aspectRatio", value: 1.5 }
  ],
  container: document.getElementById("viz-container")
});
```

## Horizontal Bar Chart

To create a horizontal bar chart, set the `orientation` property to "horizontal":

```javascript
buildViz({
  type: "barChart",
  orientation: "horizontal",
  data: salesData,
  x: { field: "revenue", type: "quantitative" },
  y: { field: "product", type: "ordinal" },
  color: "#3366CC",
  container: document.getElementById("viz-container")
});
```

## Interactions

You can add interactions to the bar chart:

```javascript
buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product", type: "ordinal" },
  y: { field: "revenue", type: "quantitative" },
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

## Tooltips

Add tooltips to display additional information when hovering over bars:

```javascript
buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product", type: "ordinal" },
  y: { field: "revenue", type: "quantitative" },
  color: "#3366CC",
  tooltip: {
    fields: ["product", "revenue"],
    format: {
      revenue: value => `$${value}`
    },
    title: "Sales Data"
  },
  container: document.getElementById("viz-container")
});
```

## Implementation Details

The bar chart is implemented as a composite visualization that includes:

1. A data processing component to prepare the data
2. Axes for the x and y dimensions
3. Rectangle elements for each bar
4. Optional title and legend components

Under the hood, it uses the constraint system to position all elements correctly and handle different orientations and sizes.
