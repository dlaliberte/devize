# Devize Tutorial: Getting Started

This tutorial will guide you through using Devize, a declarative, constraint-based data visualization library. We'll start with the basics and gradually build more complex visualizations.

## 1. Installation and Setup

First, let's install Devize:

```bash
npm install devize
```

Then import it in your project:

```typescript
import { buildViz, renderViz, registerType } from 'devize';
```

## 2. Creating Your First Visualization

Let's start with a simple point visualization:

```typescript
// Sample data
const data = [
  { x: 100, y: 100, label: "Point A" },
  { x: 200, y: 150, label: "Point B" },
  { x: 300, y: 50, label: "Point C" }
];

// Create a simple point visualization
const pointViz = buildViz({
  type: "pointGroup",
  data: data,
  x: { field: "x" },
  y: { field: "y" },
  color: "#3366CC",
  size: 8,
  constraints: [
    { type: "fitToContainer", priority: "high" }
  ]
});

// Render it to a container
renderViz(pointViz, document.getElementById("viz-container"));
```

This creates a simple visualization with three points positioned according to their x and y values.

## 3. Adding Text Labels

Let's enhance our visualization by adding text labels:

```typescript
// Create a visualization with points and labels
const labeledPointViz = buildViz({
  type: "group",
  children: [
    {
      type: "pointGroup",
      data: data,
      x: { field: "x" },
      y: { field: "y" },
      color: "#3366CC",
      size: 8
    },
    {
      type: "textGroup",
      data: data,
      x: { field: "x" },
      y: { field: "y" },
      text: { field: "label" },
      offset: { x: 5, y: -10 },
      fontSize: 12,
      fontFamily: "Arial"
    }
  ],
  constraints: [
    { type: "fitToContainer", priority: "high" }
  ]
});

// Render it to a container
renderViz(labeledPointViz, document.getElementById("viz-container"));
```

Here, we've created a group containing two visualizations: a point group and a text group. Both use the same data, but the text group displays labels offset slightly from each point.

## 4. Working with Shapes

Now, let's create a visualization with different shapes:

```typescript
// Create a visualization with different shapes
const shapesViz = buildViz({
  type: "group",
  children: [
    {
      type: "rectangle",
      x: 50,
      y: 50,
      width: 100,
      height: 80,
      fill: "#6699CC",
      stroke: "#336699",
      strokeWidth: 2,
      cornerRadius: 5
    },
    {
      type: "circle",
      cx: 250,
      cy: 80,
      r: 40,
      fill: "#CC6666",
      stroke: "#994444",
      strokeWidth: 2
    },
    {
      type: "line",
      x1: 50,
      y1: 200,
      x2: 350,
      y2: 200,
      stroke: "#666666",
      strokeWidth: 3,
      strokeDasharray: "5,5"
    }
  ],
  constraints: [
    { type: "fitToContainer", priority: "high" }
  ]
});

// Render it to a container
renderViz(shapesViz, document.getElementById("viz-container"));
```

This creates a visualization with three different shapes: a rectangle, a circle, and a line.

## 5. Using Constraints for Layout

Let's explore how constraints can help with layout:

```typescript
// Create a visualization with constrained layout
const constrainedViz = buildViz({
  type: "group",
  children: [
    {
      id: "rect1",
      type: "rectangle",
      x: 50,
      y: 50,
      width: 100,
      height: 80,
      fill: "#6699CC"
    },
    {
      id: "rect2",
      type: "rectangle",
      width: 100,
      height: 80,
      fill: "#CC6666"
    }
  ],
  constraints: [
    { type: "fitToContainer", priority: "high" },
    {
      type: "rightOf",
      element: "rect2",
      reference: "rect1",
      gap: 20
    },
    {
      type: "alignMiddle",
      elements: ["rect1", "rect2"]
    }
  ]
});

// Render it to a container
renderViz(constrainedViz, document.getElementById("viz-container"));
```

In this example, we've used constraints to position the second rectangle to the right of the first one, with a 20-pixel gap, and aligned their vertical centers.

## 6. Creating a Simple Bar Chart

Now, let's create a simple bar chart:

```typescript
// Sample data
const salesData = [
  { product: "Product A", revenue: 420 },
  { product: "Product B", revenue: 650 },
  { product: "Product C", revenue: 340 },
  { product: "Product D", revenue: 570 }
];

// Create a bar chart
const barChart = buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product", type: "ordinal" },
  y: { field: "revenue", type: "quantitative" },
  color: "#3366CC",
  constraints: [
    { type: "fitToContainer", priority: "high" },
    { type: "barWidthRatio", value: 0.7 }
  ]
});

// Render it to a container
renderViz(barChart, document.getElementById("viz-container"));
```

This creates a simple bar chart showing revenue by product. Under the hood, the `barChart` type is a composite visualization that includes axes, bars, and possibly labels.

## 7. Customizing Visualizations

Let's customize our bar chart:

```typescript
// Create a customized bar chart
const customBarChart = buildViz({
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
  constraints: [
    { type: "fitToContainer", priority: "high" },
    { type: "barWidthRatio", value: 0.7 },
    { type: "aspectRatio", value: 1.5 }
  ]
});

// Render it to a container
renderViz(customBarChart, document.getElementById("viz-container"));
```

Here, we've customized the axes, added colors, a title, and specified an aspect ratio constraint.

## 8. Creating a Scatter Plot

Let's create a scatter plot:

```typescript
// Sample data
const populationData = [
  { country: "USA", gdp: 65000, population: 331, continent: "North America" },
  { country: "China", gdp: 17000, population: 1444, continent: "Asia" },
  { country: "Japan", gdp: 42000, population: 126, continent: "Asia" },
  { country: "Germany", gdp: 51000, population: 83, continent: "Europe" },
  { country: "UK", gdp: 46000, population: 68, continent: "Europe" },
  { country: "India", gdp: 7000, population: 1393, continent: "Asia" },
  { country: "Brazil", gdp: 14000, population: 214, continent: "South America" }
];

// Create a scatter plot
const scatterPlot = buildViz({
  type: "scatterPlot",
  data: populationData,
  x: {
    field: "gdp",
    type: "quantitative",
    axis: {
      title: "GDP per Capita ($)",
      titleFontSize: 14
    }
  },
  y: {
    field: "population",
    type: "quantitative",
    axis: {
      title: "Population (millions)",
      titleFontSize: 14
    }
  },
  size: {
    field: "population",
    scale: "sqrt",
    range: [5, 30]
  },
  color: {
    field: "continent",
    type: "categorical"
  },
  tooltip: {
    fields: ["country", "gdp", "population"]
  },
  constraints: [
    { type: "fitToContainer", priority: "high" },
    { type: "aspectRatio", value: 1.5 }
  ]
});

// Render it to a container
renderViz(scatterPlot, document.getElementById("viz-container"));
```

This creates a scatter plot with points sized according to population and colored by continent.

## 9. Composing Multiple Visualizations

Let's create a dashboard with multiple visualizations:

```typescript
// Create a dashboard with multiple visualizations
const dashboard = buildViz({
  type: "dashboard",
  layout: { type: "grid", columns: 2, rows: 2, gap: 20 },
  views: [
    {
      id: "view1",
      type: "barChart",
      data: salesData,
      x: { field: "product" },
      y: { field: "revenue" },
      title: "Revenue by Product"
    },
    {
      id: "view2",
      type: "pieChart",
      data: salesData,
      value: { field: "revenue" },
      color: { field: "product" },
      title: "Revenue Distribution"
    },
    {
      id: "view3",
      type: "scatterPlot",
      data: populationData,
      x: { field: "gdp" },
      y: { field: "population" },
      color: { field: "continent" },
      title: "GDP vs Population"
    },
    {
      id: "view4",
      type: "lineChart",
      data: timeSeriesData,
      x: { field: "date" },
      y: { field: "value" },
      title: "Time Series Data"
    }
  ],
  constraints: [
    { type: "fitToContainer", priority: "high" },
    { type: "equalSize", elements: ["view1", "view2", "view3", "view4"] }
  ]
});

// Render it to a container
renderViz(dashboard, document.getElementById("dashboard-container"));
```

This creates a 2x2 grid dashboard with four different visualizations.

## 10. Adding Interactivity

Let's add some basic interactivity:

```typescript
// Create an interactive visualization
const interactiveViz = buildViz({
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
  constraints: [
    { type: "fitToContainer", priority: "high" }
  ]
});

// Render it to a container
renderViz(interactiveViz, document.getElementById("viz-container"));
```

This adds hover and click interactions to the bars in our bar chart.

## 11. Creating Custom Visualization Types

Finally, let's create a custom visualization type:

```typescript
// Define a custom radial bar chart type
const radialBarChartType = {
  name: "radialBarChart",

  requiredProps: ["data", "angle", "radius"],

  optionalProps: {
    color: "#3366CC",
    innerRadius: 50,
    startAngle: 0,
    endAngle: 360
  },

  generateConstraints(spec, context) {
    const constraints = [];

    // Add constraints for the chart container
    constraints.push({
      type: "containerFit",
      element: "chart",
      container: context.container
    });

    // Add constraints for the radial bars
    // ...

    return constraints;
  },

  decompose(spec, solvedConstraints) {
    const { data, angle, radius, color, innerRadius, startAngle, endAngle } = spec;

    // Calculate positions and dimensions for the radial bars
    // ...

    // Return the decomposed visualization
    return {
      type: "group",
      children: [
        // Center circle
        {
          type: "circle",
          cx: centerX,
          cy: centerY,
          r: innerRadius,
          fill: "#FFFFFF",
          stroke: "#CCCCCC"
        },
        // Radial bars
        ...data.map((d, i) => ({
          type: "path",
          d: generateRadialBarPath(d, i),
          fill: Array.isArray(color) ? color[i % color.length] : color,
          stroke: "#FFFFFF",
          strokeWidth: 1
        })),
        // Labels
        ...data.map((d, i) => ({
          type: "text",
          x: calculateLabelX(d, i),
          y: calculateLabelY(d, i),
          text: d[angle.field],
          fontSize: 12,
          textAnchor: "middle"
        }))
      ]
    };
  }
};

// Register the custom type
registerType(radialBarChartType);

// Create a visualization using the custom type
const radialBarChart = buildViz({
  type: "radialBarChart",
  data: salesData,
  angle: { field: "product" },
  radius: { field: "revenue" },
  color: ["#3366CC", "#DC3912", "#FF9900", "#109618"],
  innerRadius: 50,
  constraints: [
    { type: "fitToContainer", priority: "high" },
    { type: "aspectRatio", value: 1 }
  ]
});

// Render it to a container
renderViz(radialBarChart, document.getElementById("viz-container"));
```

This defines and uses a custom radial bar chart visualization type.


12. Defining Custom Visualizations Declaratively
One of the most powerful features of Devize is the ability to define new visualization types declaratively using the define type. This allows you to create reusable visualization components without writing explicit code.

12.1 Basic Definition
Let's create a simple labeled circle visualization:

```javascript
// Define a new visualization type
buildViz({
  type: "define",
  name: "labeledCircle",
  properties: {
    cx: { required: true },
    cy: { required: true },
    r: { required: true, default: 10 },
    fill: { default: "steelblue" },
    stroke: { default: "navy" },
    strokeWidth: { default: 1 },
    label: { required: true },
    fontSize: { default: 12 }
  },
  implementation: {
    type: "group",
    children: [
      {
        type: "circle",
        cx: "{{cx}}",
        cy: "{{cy}}",
        r: "{{r}}",
        fill: "{{fill}}",
        stroke: "{{stroke}}",
        strokeWidth: "{{strokeWidth}}"
      },
      {
        type: "text",
        x: "{{cx}}",
        y: "{{cy}}",
        text: "{{label}}",
        fontSize: "{{fontSize}}",
        textAnchor: "middle",
        dominantBaseline: "middle",
        fill: "black"
      }
    ]
  }
}, document.getElementById("definitions-container"));

// Now use the new visualization type
const labeledCircleViz = buildViz({
  type: "labeledCircle",
  cx: 100,
  cy: 100,
  r: 30,
  fill: "coral",
  label: "Hello!",
  fontSize: 14
}, document.getElementById("viz-container"));
```

12.2 Extending Existing Types
You can also extend existing visualization types:

```javascript
// Define a horizontal bar chart by extending the standard bar chart
buildViz({
  type: "define",
  name: "horizontalBarChart",
  extend: "barChart",
  properties: {
    barHeight: { default: 20 }
  },
  implementation: {
    orientation: "horizontal"
  }
}, document.getElementById("definitions-container"));

// Use the new horizontal bar chart
const horizontalBarChart = buildViz({
  type: "horizontalBarChart",
  data: salesData,
  x: { field: "revenue" },
  y: { field: "product" },
  barHeight: 25,
  color: "#3366CC"
}, document.getElementById("viz-container"));
```

12.3 Benefits of Declarative Definition
This declarative approach to defining visualizations offers several advantages:

1. Reusability: Define once, use anywhere
2. Composability: Build complex visualizations from simpler ones
3. Consistency: Ensure consistent property handling
4. Separation of concerns: Clearly separate interface from implementation
5. Extensibility: Easily extend and customize existing visualizations

Many of Devize's built-in visualizations like axes, legends, and chart types are defined using this same mechanism, making the library highly extensible and consistent.
