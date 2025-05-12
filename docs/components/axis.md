# Axis Component

The Axis component provides a visual representation of scales in Devize visualizations, displaying tick marks, labels, and titles to help users interpret data values.

## Overview

Axes are essential elements in most data visualizations, providing the reference system that allows viewers to understand the scale and meaning of visual elements. In Devize, the Axis component is highly customizable and can be used with various scale types.

Axes can be oriented horizontally (bottom, top) or vertically (left, right), and they support different scale types including linear, logarithmic, time, and categorical (band) scales.

## Basic Usage

Here's a simple example of creating an axis with Devize:

```javascript
buildViz({
  type: "axis",
  orientation: "bottom",
  scale: {
    type: "linear",
    domain: [0, 100],
    range: [0, 400]
  },
  length: 400,
  title: "Values",
  container: document.getElementById("axis-container")
});
```

This creates a horizontal axis at the bottom with a linear scale from 0 to 100, rendered across 400 pixels.

## Core Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| orientation | string | Position of the axis ("top", "right", "bottom", "left") | "bottom" |
| scale | object/string | Scale configuration or reference to a registered scale | Required |
| length | number | Length of the axis in pixels | Required |
| title | string/object | Axis title configuration | None |
| tickSize | number | Length of tick marks in pixels | 6 |
| tickPadding | number | Padding between ticks and labels in pixels | 3 |
| tickCount | number | Approximate number of ticks to display | Auto |
| tickValues | array | Specific values to show ticks for | Auto |
| tickFormat | function | Function to format tick labels | None |
| transform | string | SVG transform to position the axis | None |
| grid | boolean/object | Whether to show grid lines | false |
| labelRotation | number | Rotation angle for tick labels in degrees | 0 |

## Scale Configuration

The `scale` property can be a reference to a registered scale or an inline scale configuration:

```javascript
// Reference to a registered scale
scale: "myLinearScale"

// Inline scale configuration
scale: {
  type: "linear",
  domain: [0, 100],
  range: [0, 400]
}
```

For more details on scales, see the [Scales documentation](../scales/scales.md).

## Orientation

The `orientation` property determines where the axis is positioned relative to the visualization:

| Value | Description |
|-------|-------------|
| "bottom" | Horizontal axis with ticks and labels below |
| "top" | Horizontal axis with ticks and labels above |
| "left" | Vertical axis with ticks and labels to the left |
| "right" | Vertical axis with ticks and labels to the right |

## Title Configuration

The `title` property can be a simple string or an object for more control:

```javascript
// Simple title
title: "Values"

// Detailed title configuration
title: {
  text: "Values (in units)",
  fontSize: 14,
  fontWeight: "bold",
  fontFamily: "Arial",
  color: "#333333",
  padding: 10,
  rotation: 0  // Useful for vertical axes
}
```

## Tick Configuration

Ticks are the marks and labels that indicate values along the axis. You can customize them in several ways:

```javascript
buildViz({
  type: "axis",
  orientation: "bottom",
  scale: {
    type: "linear",
    domain: [0, 100],
    range: [0, 400]
  },
  length: 400,
  // Custom tick configuration
  tickSize: 8,
  tickPadding: 5,
  tickCount: 5,  // Approximate number of ticks
  tickValues: [0, 25, 50, 75, 100],  // Exact tick values (overrides tickCount)
  tickFormat: value => `$${value}`,  // Format tick labels
  labelRotation: 45,  // Rotate labels for better fit
  container: document.getElementById("axis-container")
});
```

## Grid Lines

Grid lines extend from the axis ticks across the visualization area, making it easier to read values. Enable them with the `grid` property:

```javascript
// Simple grid lines
grid: true

// Customized grid lines
grid: {
  stroke: "#e0e0e0",
  strokeWidth: 1,
  strokeDasharray: "3,3",
  length: 300  // Length of grid lines in pixels
}
```

## Axis in Charts

Most chart components in Devize (like bar charts, line charts, scatter plots) automatically create and configure axes based on your data. However, you can customize these axes through the chart's configuration:

```javascript
buildViz({
  type: "lineChart",
  data: timeSeriesData,
  x: {
    field: "date",
    title: "Date",
    tickCount: 5,
    tickFormat: date => date.toLocaleDateString(),
    grid: true
  },
  y: {
    field: "value",
    title: "Value ($)",
    domain: [0, 100],
    tickFormat: value => `$${value}`
  },
  // ... other chart properties
});
```

For more information on how axes are used in charts, see the documentation for specific chart types like [Bar Chart](../charts/barChart.md), [Line Chart](../charts/lineChart.md), and [Scatter Plot](../charts/scatterPlot.md).

## Examples

### Time Axis

```javascript
buildViz({
  type: "axis",
  orientation: "bottom",
  scale: {
    type: "time",
    domain: [new Date(2023, 0, 1), new Date(2023, 11, 31)],
    range: [0, 500]
  },
  length: 500,
  title: "Date",
  tickCount: 12,
  tickFormat: date => date.toLocaleDateString('en-US', { month: 'short' }),
  labelRotation: 45,
  container: document.getElementById("time-axis-container")
});
```

### Categorical Axis

```javascript
buildViz({
  type: "axis",
  orientation: "bottom",
  scale: {
    type: "band",
    domain: ["Category A", "Category B", "Category C", "Category D", "Category E"],
    range: [0, 400],
    padding: 0.2
  },
  length: 400,
  title: "Categories",
  labelRotation: 30,
  container: document.getElementById("categorical-axis-container")
});
```

### Logarithmic Axis

```javascript
buildViz({
  type: "axis",
  orientation: "left",
  scale: {
    type: "log",
    domain: [1, 10000],
    range: [300, 0]
  },
  length: 300,
  title: "Log Scale",
  tickFormat: value => value.toExponential(0),
  grid: true,
  container: document.getElementById("log-axis-container")
});
```

## Accessibility Considerations

When using axes in your visualizations, consider these accessibility best practices:

1. Always provide meaningful axis titles that describe what the values represent
2. Use sufficient color contrast for axis lines, ticks, and labels
3. Consider using grid lines to make value comparisons easier
4. Ensure tick labels are large enough to be readable
5. Use ARIA attributes when appropriate for screen readers

For more information on creating accessible visualizations, see the [Accessibility Guide](../guides/accessibility.md).

## Implementation Details

The Axis component is implemented as a composite visualization that includes:

1. A line element for the axis line
2. Tick marks rendered as line elements
3. Text elements for tick labels
4. A text element for the axis title
5. Optional grid lines as path elements

Under the hood, it uses the constraint system to position all elements correctly based on the orientation and scale.

## See Also

- [Scales](../scales/scales.md)
- [Linear Scale](../scales/linearScale.md)
- [Band Scale](../scales/bandScale.md)
- [Time Scale](../scales/timeScale.md)
- [Chart Layout](../guides/chart-layout.md)
- [Bar Chart](../charts/barChart.md)
- [Line Chart](../charts/lineChart.md)
