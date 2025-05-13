# Devize Tutorial Part 3: Visualization Templates and Type Extensions

## Introduction

Welcome to the third part of the Devize tutorial series! In this tutorial, we'll explore how to create reusable visualization templates and extend visualization types to create custom visualizations.

In the previous tutorials, we covered primitive shapes, basic data binding, and the constraint system. Now, we'll build on these foundations to create more sophisticated and reusable visualization structures.

## Visualization Templates

Visualization templates allow you to create reusable visualization structures that can be applied to different data. This is a powerful feature that enables you to separate the structure of a visualization from its data.

### Creating a Template

```javascript
import { buildVizTemplate, renderVizTemplate } from 'devize';

// Create a bar chart template
const barChartTemplate = buildVizTemplate({
  type: "group",
  constraints: [
    { type: "fitToContainer", padding: 20 }
  ],
  data: {
    type: "reference",
    name: "chartData"
  },
  children: [
    {
      id: "barContainer",
      type: "group",
      constraints: [
        { type: "fitToContainer" }
      ],
      children: {
        type: "dataMap",
        data: { $ref: "chartData" },
        template: (item, index, array) => ({
          id: `bar-${index}`,
          type: "rectangle",
          height: { $expr: "item.value * 10" },
          fill: "steelblue",
          stroke: "navy",
          strokeWidth: 1,
          constraints: [
            { type: "alignBottomEdge", element: "barContainer" }
          ]
        }),
        constraints: [
          {
            type: "distributeHorizontally",
            elements: { $expr: "array.map((_, i) => `bar-${i}`)" },
            padding: 10,
            widthRatio: 0.8
          }
        ]
      }
    }
  ]
});
```

TODO: Add examples of extending templates for specific use cases.

### Rendering Templates with Different Data

Once you have a template, you can render it with different data sources:

```javascript
// Sample data sets
const salesData = [
  { category: "A", value: 5 },
  { category: "B", value: 10 },
  { category: "C", value: 15 },
  { category: "D", value: 7 },
  { category: "E", value: 12 }
];

const marketingData = [
  { category: "X", value: 8 },
  { category: "Y", value: 12 },
  { category: "Z", value: 6 }
];

// Render the template with different data
const salesChart = renderVizTemplate(
  barChartTemplate,
  document.getElementById('sales-chart'),
  { chartData: salesData }
);

const marketingChart = renderVizTemplate(
  barChartTemplate,
  document.getElementById('marketing-chart'),
  { chartData: marketingData }
);
```

This creates two bar charts using the same template but with different data. The charts will automatically adapt to the data, showing the correct number of bars with the appropriate heights.

### Template Expressions

Templates can include expressions that are evaluated at render time:

```javascript
const dynamicTemplate = buildVizTemplate({
  type: "group",
  constraints: [
    { type: "fitToContainer", padding: 20 }
  ],
  data: {
    type: "reference",
    name: "chartData"
  },
  children: {
    type: "dataMap",
    data: { $ref: "chartData" },
    template: (item, index, array) => ({
      id: `bar-${index}`,
      type: "rectangle",
      height: { $expr: "item.value * 10" },
      fill: { $expr: "item.value > 10 ? 'darkred' : 'steelblue'" },
      stroke: "navy",
      strokeWidth: 1,
      constraints: [
        { type: "alignBottomEdge", element: "barContainer" }
      ]
    })
  }
});
```

In this example, the height of each bar is calculated from the data value, and the fill color changes based on whether the value is greater than 10.

## Type Extensions

Devize allows you to extend existing visualization types to create new ones. This is a powerful feature that enables you to build custom visualizations while reusing existing functionality.

### Basic Type Extension

```javascript
import { extendType, buildViz } from 'devize';

// Extend the rectangle type to create a "card" type
extendType("rectangle", {
  name: "card",

  // Add new properties
  optionalProps: {
    title: null,
    content: null,
    padding: 10
  },

  // Override decomposition
  decompose(spec, solvedConstraints) {
    // Get the base rectangle with its position and size
    const baseRect = {
      type: "rectangle",
      x: spec.x,
      y: spec.y,
      width: spec.width,
      height: spec.height,
      fill: spec.fill || "white",
      stroke: spec.stroke || "#cccccc",
      strokeWidth: spec.strokeWidth || 1,
      rx: spec.rx || 5,
      ry: spec.ry || 5
    };

    // If no title or content, just return the rectangle
    if (!spec.title && !spec.content) {
      return baseRect;
    }

    // Otherwise, create a group with the rectangle and text elements
    const padding = spec.padding || 10;

    const children = [baseRect];

    if (spec.title) {
      children.push({
        type: "text",
        x: spec.x + padding,
        y: spec.y + padding + 15,  // Adjust for text height
        text: spec.title,
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: "Arial",
        fill: "#333333"
      });
    }

    if (spec.content) {
      children.push({
        type: "text",
        x: spec.x + padding,
        y: spec.y + padding + (spec.title ? 40 : 15),  // Adjust based on whether there's a title
        text: spec.content,
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#666666"
      });
    }

    return {
      type: "group",
      children: children
    };
  }
});

// Use the new card type
const card = buildViz({
  type: "card",
  x: 50,
  y: 50,
  width: 200,
  height: 150,
  title: "Important Information",
  content: "This is a card with some content.",
  fill: "#f9f9f9"
}, container);
```

This extends the rectangle type to create a new "card" type that includes a title and content.

### Extending Chart Types

You can also extend chart types to create customized versions:

```javascript
// Extend the bar chart type to create a horizontal bar chart
extendType("barChart", {
  name: "horizontalBarChart",

  // Add new properties
  optionalProps: {
    barHeight: null
  },

  // Override constraint generation
  generateConstraints(spec, context) {
    const constraints = [];

    // Add horizontal-specific constraints
    constraints.push({
      type: "orientation",
      value: "horizontal"
    });

    return constraints;
  },

  // Enhance decomposition
  enhanceDecomposition: true,
  decompose(spec, solvedConstraints, baseResult) {
    // Modify the base result to make it horizontal
    // For example, swap x and y axes

    // Find and modify the axes
    const xAxis = baseResult.children.find(c => c.type === "axis" && c.orientation === "bottom");
    const yAxis = baseResult.children.find(c => c.type === "axis" && c.orientation === "left");

    if (xAxis) xAxis.orientation = "left";
    if (yAxis) yAxis.orientation = "bottom";

    // Modify other components as needed

    return baseResult;
  }
});

// Use the horizontal bar chart
const horizontalBarChart = buildViz({
  type: "horizontalBarChart",
  data: salesData,
  x: { field: "revenue" },
  y: { field: "product" }
}, container);
```

### Creating Custom Chart Types

You can create entirely new chart types by composing existing types:

```javascript
// Register a new chart type
registerType({
  name: "dualAxisChart",

  // Required properties
  requiredProps: ["data", "x", "y1", "y2"],

  // Optional properties with defaults
  optionalProps: {
    color1: "steelblue",
    color2: "indianred",
    padding: 20
  },

  // Decomposition into primitives
  decompose(spec, solvedConstraints) {
    return {
      type: "group",
      constraints: [
        { type: "fitToContainer", padding: spec.padding }
      ],
      children: [
        // X-axis
        {
          type: "axis",
          orientation: "bottom",
          scale: spec.x.scale,
          domain: spec.x.domain
        },
        // Left Y-axis
        {
          type: "axis",
          orientation: "left",
          scale: spec.y1.scale,
          domain: spec.y1.domain,
          tickColor: spec.color1
        },
        // Right Y-axis
        {
          type: "axis",
          orientation: "right",
          scale: spec.y2.scale,
          domain: spec.y2.domain,
          tickColor: spec.color2
        },
        // Line for first measure
        {
          type: "line",
          data: spec.data,
          x: { field: spec.x.field },
          y: { field: spec.y1.field },
          stroke: spec.color1,
          strokeWidth: 2
        },
        // Line for second measure
        {
          type: "line",
          data: spec.data,
          x: { field: spec.x.field },
          y: { field: spec.y2.field, scale: spec.y2.scale },
          stroke: spec.color2,
          strokeWidth: 2,
          strokeDasharray: "5,5"
        }
      ]
    };
  }
});

// Use the dual axis chart
const dualAxisChart = buildViz({
  type: "dualAxisChart",
  data: timeSeriesData,
  x: { field: "date", type: "temporal" },
  y1: { field: "temperature", type: "quantitative" },
  y2: { field: "precipitation", type: "quantitative" },
  color1: "orangered",
  color2: "royalblue"
}, container);
```

## Creating Standard Chart Types

Now that we understand templates and type extensions, let's create some standard chart types using Devize.

### Bar Chart

```javascript
const barChart = buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product", type: "ordinal" },
  y: { field: "revenue", type: "quantitative" },
  color: { field: "category", type: "categorical" },
  constraints: [
    { type: "fitToContainer", padding: 20 }
  ]
}, container);
```

### Line Chart

```javascript
const lineChart = buildViz({
  type: "lineChart",
  data: timeSeriesData,
  x: { field: "date", type: "temporal" },
  y: { field: "value", type: "quantitative" },
  color: { field: "series", type: "categorical" },
  constraints: [
    { type: "fitToContainer", padding: 20 }
  ]
}, container);
```

### Scatter Plot

```javascript
const scatterPlot = buildViz({
  type: "scatterPlot",
  data: populationData,
  x: { field: "income", type: "quantitative" },
  y: { field: "lifeExpectancy", type: "quantitative" },
  size: { field: "population", type: "quantitative" },
  color: { field: "region", type: "categorical" },
  constraints: [
    { type: "fitToContainer", padding: 20 }
  ]
}, container);
```

### Pie Chart

```javascript
const pieChart = buildViz({
  type: "pieChart",
  data: marketShareData,
  value: { field: "share", type: "quantitative" },
  color: { field: "company", type: "categorical" },
  constraints: [
    { type: "fitToContainer", padding: 20 }
  ]
}, container);
```

### Primitive Types Overview

1. Basic Shapes

  Rectangle
  Circle
  Ellipse
  Polygon
  Arc

2. Lines and Paths

Line
Polyline
Path
Curve (Bezier, etc.)

3. Text and Labels

Text
TextPath
Label (text with background)
Title (styled text for headings)

4. Containers and Grouping

Group
Layer
ClipPath
Mask

5. Data Visualization Elements

Axis
Legend
Grid
Tooltip

6. Data Mapping and Collections

DataMap
Repeat
Stack
Flow

7. Interaction Elements

Button
Slider
Checkbox
Dropdown


## Next Steps

In this tutorial, we've explored visualization templates and type extensions in Devize. We've learned how to create reusable templates, extend existing types, and create custom chart types.

In the next tutorial, we'll dive deeper into data handling, including data sources, transformations, and advanced data binding techniques.

## Exercises

1. Create a template for a scatter plot that can be reused with different datasets.
2. Extend the "circle" type to create a "bubble" type with additional properties like label and tooltip.
3. Create a custom chart type that combines a bar chart and a line chart.
4. Extend the "barChart" type to create a "stackedBarChart" type.
5. Create a template for a dashboard that includes multiple chart types.

Happy visualizing with Devize!
