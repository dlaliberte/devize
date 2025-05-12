# Pie Chart

A pie chart is a circular statistical graphic divided into slices to illustrate numerical proportions. In Devize, pie charts provide an intuitive way to show part-to-whole relationships.

## Overview

Pie charts are ideal for showing the relative sizes of data categories as parts of a whole. They're particularly effective when:

- You want to show proportions or percentages of a total
- You have a relatively small number of categories (typically less than 7)
- The differences between values are significant enough to be visually distinguishable
- You want to emphasize a particular segment's contribution to the whole

## Basic Usage

Here's a simple example of creating a pie chart with Devize:

```javascript
// Sample data
const marketShareData = [
  { company: "Company A", share: 35 },
  { company: "Company B", share: 25 },
  { company: "Company C", share: 20 },
  { company: "Company D", share: 15 },
  { company: "Others", share: 5 }
];

buildViz({
  type: "pieChart",
  data: marketShareData,
  value: { field: "share" },
  category: { field: "company" },
  title: "Market Share Distribution",
  container: document.getElementById("viz-container")
});
```

This creates a basic pie chart showing the market share distribution across different companies.

## Core Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| data | array | Array of data objects | Required |
| value | object | Value configuration (determines slice size) | Required |
| category | object | Category configuration (determines slice identity) | Required |
| color | string/object | Slice color or color mapping | Auto |
| title | string/object | Chart title configuration | None |
| margin | object | Chart margins | `{ top: 40, right: 30, bottom: 40, left: 30 }` |
| tooltip | boolean/object | Tooltip configuration | false |
| width | number | Chart width in pixels | 400 |
| height | number | Chart height in pixels | 400 |
| innerRadius | number/string | Inner radius for donut charts (0 or "0%" for pie) | 0 |
| outerRadius | number/string | Outer radius | "90%" |
| cornerRadius | number | Rounded corners for slices | 0 |
| padAngle | number | Padding between slices in radians | 0 |
| startAngle | number | Starting angle in radians | 0 |
| endAngle | number | Ending angle in radians | 2π |
| sort | boolean/function | Whether/how to sort slices | true |
| legend | object | Legend configuration | `{ enabled: true, position: 'right' }` |
| labels | object | Slice label configuration | `{ enabled: true, type: 'percent' }` |

## Value and Category Configuration

The `value` and `category` properties accept configuration objects with the following properties:

```javascript
value: {
  field: "share",       // Required: Data field for slice size
  format: v => `${v}%`  // Optional: Format function for display
}

category: {
  field: "company",     // Required: Data field for slice identity
  title: "Company"      // Optional: Title for legend
}
```

## Color Configuration

The `color` property can be a simple string for a single color, or an object for data-driven coloring:

```javascript
// Auto-assigned colors from default palette
color: "auto"

// Color mapping by category
color: {
  field: "company",
  scale: "categorical",
  range: ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"]
}
```

For more information on color scales and mappings, see the [Color Scales documentation](../scales/colorScales.md).

## Title Configuration

The `title` property can be a simple string or an object for more control:

```javascript
// Simple title
title: "Market Share Distribution"

// Detailed title configuration
title: {
  text: "Market Share Distribution",
  fontSize: 18,
  fontWeight: "bold",
  fontFamily: "Arial",
  color: "#333333",
  align: "center",
  padding: 20
}
```

## Donut Charts

To create a donut chart, set the `innerRadius` property:

```javascript
buildViz({
  type: "pieChart",
  data: marketShareData,
  value: { field: "share" },
  category: { field: "company" },
  innerRadius: "50%",  // Creates a donut chart
  title: "Market Share Distribution",
  container: document.getElementById("viz-container")
});
```

You can specify the inner radius as a percentage of the outer radius (e.g., "50%") or as an absolute pixel value (e.g., 100).

## Slice Labels

The `labels` property controls the display of labels on or near the slices:

```javascript
labels: {
  enabled: true,
  type: "percent",  // "percent", "value", "category", or "all"
  format: {
    percent: value => `${Math.round(value * 100)}%`,
    value: value => value.toLocaleString(),
    category: value => value
  },
  position: "inside",  // "inside", "outside", or "centroid"
  fontSize: 12,
  fontWeight: "normal",
  fontFamily: "Arial",
  color: "#ffffff",  // For inside labels
  minSliceAngle: 15  // Only show labels for slices larger than this angle (in degrees)
}
```

## Legend Configuration

The `legend` property controls the display of the chart legend:

```javascript
legend: {
  enabled: true,
  position: "right",  // "right", "left", "top", "bottom", or {x, y}
  orientation: "vertical",  // "vertical" or "horizontal"
  title: "Companies",
  itemSpacing: 10,
  symbolSize: 15,
  fontSize: 12,
  fontFamily: "Arial"
}
```

For more details on legend configuration, see the [Legend documentation](../components/legend.md).

## Tooltip Configuration

Tooltips provide additional information when users hover over slices. The `tooltip` property can be a boolean or an object for more control:

```javascript
// Simple tooltip
tooltip: true

// Detailed tooltip configuration
tooltip: {
  fields: ["company", "share"],
  format: {
    share: value => `${value}% market share`
  },
  title: d => d.company
}
```

For more details on tooltip configuration, see the [Tooltip documentation](../components/tooltip.md).

## Sorting Slices

By default, slices are sorted in descending order by value. You can customize this behavior:

```javascript
// Disable sorting (use data order)
sort: false

// Custom sort function
sort: (a, b) => a.value - b.value  // Ascending order
```

## Customization Example

Here's a more comprehensive example showing various customization options:

```javascript
buildViz({
  type: "pieChart",
  data: marketShareData,
  value: {
    field: "share",
    format: value => `${value}%`
  },
  category: {
    field: "company",
    title: "Companies"
  },
  color: {
    field: "company",
    range: ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"]
  },
  title: {
    text: "Market Share Distribution",
    fontSize: 20,
    fontWeight: "bold",
    align: "center"
  },
  tooltip: {
    fields: ["company", "share", "revenue"],
    format: {
      share: value => `${value}%`,
      revenue: value => `$${value.toLocaleString()}`
    }
  },
  width: 500,
  height: 500,
  innerRadius: "40%",
  outerRadius: "90%",
  cornerRadius: 5,
  padAngle: 0.02,
  startAngle: -Math.PI / 2,  // Start from top (12 o'clock position)
  endAngle: Math.PI * 1.5,
  labels: {
    enabled: true,
    type: "percent",
    position: "inside",
    color: "#ffffff",
    fontWeight: "bold",
    minSliceAngle: 20
  },
  legend: {
    enabled: true,
    position: "right",
    title: "Companies",
    orientation: "vertical"
  },
  container: document.getElementById("viz-container")
});
```

## Interactions

You can add interactions to the pie chart to make it more engaging:

```javascript
buildViz({
  type: "pieChart",
  data: marketShareData,
  value: { field: "share" },
  category: { field: "company" },
  interactions: [
    {
      type: "hover",
      target: "slice",
      effect: {
        offset: 15,  // Pull slice out from center
        opacity: 1,
        stroke: "#ffffff",
        strokeWidth: 2
      }
    },
    {
      type: "click",
      target: "slice",
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

## Responsive Pie Charts

To create responsive pie charts that adapt to container size:

```javascript
buildViz({
  type: "pieChart",
  data: marketShareData,
  value: { field: "share" },
  category: { field: "company" },
  responsive: true,
  aspectRatio: 1,  // Keep it circular
  container: document.getElementById("viz-container")
});
```

For more information on responsive visualizations, see the [Responsive Visualizations guide](../guides/responsive.md).

## Related Chart Types

- **[Donut Chart](#donut-charts)**: A pie chart with an inner radius
- **[Bar Chart](./barChart.md)**: An alternative for comparing categories
- **[Treemap](./treemap.md)**: For hierarchical part-to-whole relationships
- **[Stacked Bar Chart](./barChart.md#stacked-bar-charts)**: Another way to show part-to-whole relationships

## Accessibility Considerations

Pie charts can be challenging for some users to interpret accurately. Consider these accessibility best practices:

1. Keep the number of slices small (ideally 5-7 maximum)
2. Use clear, high-contrast colors
3. Include descriptive labels and a legend
4. Consider including the actual values in tooltips or labels
5. For complex proportional data, consider using a bar chart as an alternative

For more information on creating accessible visualizations, see the [Accessibility Guide](../guides/accessibility.md).

## Implementation Details

The pie chart is implemented as a composite visualization that includes:

1. A polar coordinate system for positioning slices
2. Path elements for each slice
3. Text elements for labels
4. A legend component
5. Optional tooltips

Under the hood, it uses the constraint system to position all elements correctly and handle different configurations.

## See Also

- [Polar Coordinate System](../components/polarCoordinateSystem.md)
- [Legend](../components/legend.md)
- [Color Scales](../scales/colorScales.md)
- [Data Binding](../guides/data-binding.md)
- [Chart Layout](../guides/chart-layout.md)
