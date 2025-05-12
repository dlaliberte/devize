# Line Chart

The line chart is a visualization type that displays data points connected by straight line segments, typically used to show trends over time or other continuous dimensions.

## Basic Usage

```javascript
// Sample data
const salesData = [
  { month: "Jan", sales: 420 },
  { month: "Feb", sales: 650 },
  { month: "Mar", sales: 340 },
  { month: "Apr", sales: 570 },
  { month: "May", sales: 690 }
];

buildViz({
  type: "lineChart",
  data: salesData,
  x: { field: "month" },
  y: { field: "sales" },
  color: "#3366CC",
  title: "Monthly Sales",
  container: document.getElementById("viz-container")
});
```

## Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| data | array | Array of data objects | Required |
| x | object | X-axis configuration | Required |
| y | object | Y-axis configuration | Required |
| color | string/object | Line color or color mapping | "#3366CC" |
| title | string/object | Chart title configuration | None |
| margin | object | Chart margins | `{ top: 40, right: 30, bottom: 60, left: 60 }` |
| tooltip | boolean/object | Tooltip configuration | false |
| grid | boolean | Whether to show grid lines | false |
| width | number | Chart width in pixels | 800 |
| height | number | Chart height in pixels | 400 |
| curve | string | Line curve type | "linear" |
| showLine | boolean | Whether to show the line | true |
| showPoints | boolean | Whether to show data points | true |
| pointSize | number | Size of data points | 4 |
| lineWidth | number | Width of the line | 2 |
| fillArea | boolean | Whether to fill the area under the line | false |
| fillOpacity | number | Opacity of the area fill | 0.2 |
| legend | object | Legend configuration | `{ enabled: true, position: 'top-right' }` |

## Axis Configuration

Both `x` and `y` properties accept configuration objects with the following properties:

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| field | string | Data field to use | Required |
| title | string | Axis title | Same as field name |
| type | string | "linear", "time", "ordinal" | Auto-detected |
| domain | array | Custom domain for the axis | Auto |
| format | function | Function to format axis labels | None |
| grid | boolean | Whether to show grid lines for this axis | false |
| tickCount | number | Approximate number of ticks to show | Auto |
| tickValues | array | Specific tick values to show | Auto |

## Color Configuration

The `color` property can be a simple string for a single color, or an object for data-driven coloring:

```javascript
// Simple color
color: "#3366CC"

// Color mapping by field (for multi-series)
color: {
  field: "category",
  scale: "categorical",
  range: ["#3366CC", "#DC3912", "#FF9900", "#109618"]
}
```

## Curve Types

The `curve` property controls how line segments are connected:

| Value | Description |
|-------|-------------|
| "linear" | Straight line segments between points |
| "cardinal" | Smooth curve with cardinal spline interpolation |
| "step" | Step line (horizontal first, then vertical) |

## Title Configuration

The `title` property can be a simple string or an object for more control:

```javascript
// Simple title
title: "Monthly Sales"

// Detailed title configuration
title: {
  text: "Monthly Sales",
  fontSize: 18,
  fontWeight: "bold",
  fontFamily: "Arial",
  color: "#333333",
  align: "center",
  padding: 20
}
```

## Multi-Series Line Charts

You can create multi-series line charts in two ways:

### 1. Using a categorical field:

```javascript
const salesData = [
  { month: "Jan", product: "A", sales: 420 },
  { month: "Feb", product: "A", sales: 650 },
  { month: "Jan", product: "B", sales: 320 },
  { month: "Feb", product: "B", sales: 550 }
];

buildViz({
  type: "lineChart",
  data: salesData,
  x: { field: "month" },
  y: { field: "sales" },
  color: { field: "product" },
  title: "Sales by Product",
  container: document.getElementById("viz-container")
});
```

### 2. Using explicit series configurations:

```javascript
buildViz({
  type: "lineChart",
  series: [
    {
      name: "Product A",
      data: productAData,
      x: { field: "month" },
      y: { field: "sales" },
      color: "#3366CC"
    },
    {
      name: "Product B",
      data: productBData,
      x: { field: "month" },
      y: { field: "sales" },
      color: "#DC3912",
      curve: "cardinal"
    }
  ],
  x: { field: "month", title: "Month" },
  y: { title: "Sales ($)" },
  title: "Sales by Product",
  container: document.getElementById("viz-container")
});
```

## Area Charts

To create an area chart, set the `fillArea` property to `true`:

```javascript
buildViz({
  type: "lineChart",
  data: salesData,
  x: { field: "month" },
  y: { field: "sales" },
  color: "#3366CC",
  fillArea: true,
  fillOpacity: 0.3,
  title: "Monthly Sales",
  container: document.getElementById("viz-container")
});
```

## Customization Example

```javascript
buildViz({
  type: "lineChart",
  data: salesData,
  x: {
    field: "date",
    title: "Date",
    type: "time",
    format: date => date.toLocaleDateString()
  },
  y: {
    field: "sales",
    title: "Sales ($)",
    domain: [0, 1000],
    grid: true
  },
  color: {
    field: "category",
    range: ["#3366CC", "#DC3912", "#FF9900"]
  },
  curve: "cardinal",
  showPoints: true,
  pointSize: 6,
  lineWidth: 3,
  fillArea: true,
  fillOpacity: 0.2,
  title: {
    text: "Sales Trends by Category",
    fontSize: 20,
    fontWeight: "bold",
    align: "center"
  },
  tooltip: {
    fields: ["date", "sales", "category"],
    format: {
      date: date => date.toLocaleDateString(),
      sales: value => `$${value.toLocaleString()}`
    }
  },
  grid: true,
  width: 900,
  height: 500,
  margin: { top: 50, right: 50, bottom: 70, left: 70 },
  legend: {
    enabled: true,
    position: "top-right",
    title: "Category"
  },
  container: document.getElementById("viz-container")
});
```

## Interactions

You can add interactions to the line chart:

```javascript
buildViz({
  type: "lineChart",
  data: salesData,
  x: { field: "month" },
  y: { field: "sales" },
  color: "#3366CC",
  interactions: [
    {
      type: "hover",
      target: "point",
      effect: {
        fill: "#FF9900",
        stroke: "#CC6600",
        strokeWidth: 2,
        r: 8
      }
    },
    {
      type: "hover",
      target: "line",
      effect: {
        stroke: "#FF9900",
        strokeWidth: 4
      }
    },
    {
      type: "click",
      target: "point",
      action: (data) => {
        console.log("Clicked:", data);
        // You could update other visualizations here
      }
    }
  ],
  container: document.getElementById("viz-container")
});
```

## Implementation Details

The line chart is implemented as a composite visualization that includes:

1. A data processing component to prepare the data
2. Axes for the x and y dimensions
3. Path elements for the lines
4. Circle elements for the data points
5. Optional area fills under the lines
6. Optional legends, grid lines, and tooltips

Under the hood, it uses the constraint system to position all elements correctly and handle different scales and curve types.
