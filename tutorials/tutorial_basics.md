# Devize Tutorial Part 1: Getting Started with Primitives and Basic Rendering

## Introduction

Welcome to the first part of the Devize tutorial series! In this tutorial, we'll introduce you to the core concepts of Devize and guide you through creating your first visualizations using primitive shapes and basic rendering techniques.

Devize is a declarative, constraint-based data visualization library that allows you to specify *what* you want to visualize rather than *how* to visualize it. This approach makes it easier to create complex visualizations with less code and more flexibility.

## Setting Up Devize

First, let's set up Devize in your project. You can install it using npm:

```bash
npm install devize
```

Or include it directly in your HTML:

```html
<script src="https://unpkg.com/devize/dist/devize.min.js"></script>
```

## Your First Visualization

Let's create a simple visualization - a colored rectangle. With Devize, you define visualizations using JavaScript objects that describe what you want to see:

```javascript
// Import the library (if using modules)
import { buildViz, renderViz } from 'devize';

// Create a container element
const container = document.getElementById('visualization-container');

// Create a simple rectangle visualization
const rectangleViz = buildViz({
  type: "rectangle",
  width: 200,
  height: 100,
  fill: "steelblue",
  stroke: "black",
  strokeWidth: 2
});

// Render the visualization to the container
renderViz(rectangleViz, container);
```

This creates a blue rectangle with a black border inside your container element. Notice how we're describing *what* we want (a rectangle with specific dimensions and colors) rather than *how* to create it (no DOM manipulation or SVG creation code).

## Working with Primitive Shapes

Devize provides several primitive visualization types that you can use as building blocks:

### Rectangles

```javascript
const rect = buildViz({
  type: "rectangle",
  x: 50,      // Position from left
  y: 50,      // Position from top
  width: 100,
  height: 80,
  fill: "coral",
  stroke: "darkred",
  strokeWidth: 2,
  cornerRadius: 10     // Rounded corners
});

renderViz(rect, container);
```

### Circles

```javascript
const circle = buildViz({
  type: "circle",
  cx: 150,    // Center x-coordinate
  cy: 100,    // Center y-coordinate
  r: 50,      // Radius
  fill: "lightgreen",
  stroke: "darkgreen",
  strokeWidth: 2
});

renderViz(circle, container);
```

### Lines

```javascript
const line = buildViz({
  type: "line",
  x1: 50,     // Start x-coordinate
  y1: 50,     // Start y-coordinate
  x2: 200,    // End x-coordinate
  y2: 150,    // End y-coordinate
  stroke: "purple",
  strokeWidth: 3
});

renderViz(line, container);
```

### Text

```javascript
const text = buildViz({
  type: "text",
  x: 100,
  y: 100,
  text: "Hello, Devize!",
  fontSize: 16,
  fontFamily: "Arial",
  fill: "navy",
  textAnchor: "middle"  // Center-align text
});

renderViz(text, container);
```

## Basic Positioning and Styling

In this initial version of Devize, we're using absolute positioning for simplicity. Later tutorials will introduce the constraint-based positioning system that makes Devize powerful.

### Styling Properties

Common styling properties for visualizations include:

- `fill`: The interior color (can be a color name, hex code, or RGB/RGBA value)
- `stroke`: The outline color
- `strokeWidth`: The width of the outline
- `opacity`: The transparency (0 to 1)
- `visible`: Whether the element is visible (true/false)

```javascript
const styledRect = buildViz({
  type: "rectangle",
  x: 50,
  y: 150,
  width: 150,
  height: 100,
  fill: "rgba(255, 165, 0, 0.7)",  // Semi-transparent orange
  stroke: "#336699",               // Hex color
  strokeWidth: 4,
  strokeDasharray: "5,3",          // Dashed line pattern
  opacity: 0.8                     // Overall transparency
});

renderViz(styledRect, container);
```

## Grouping Visualizations

The `group` primitive allows you to combine multiple visualizations into a single unit:

```javascript
const group = buildViz({
  type: "group",
  children: [
    {
      type: "rectangle",
      x: 10,
      y: 10,
      width: 80,
      height: 60,
      fill: "lightblue"
    },
    {
      type: "circle",
      cx: 120,
      cy: 40,
      r: 30,
      fill: "lightpink"
    },
    {
      type: "text",
      x: 70,
      y: 100,
      text: "Grouped Elements",
      fontSize: 14,
      textAnchor: "middle"
    }
  ]
});

renderViz(group, container);
```

## Simple Data Binding

One of the key features of Devize is data binding - connecting your data to visual properties. Let's create a simple bar chart using primitive shapes and data binding:

```javascript
// Sample data
const data = [
  { category: "A", value: 5 },
  { category: "B", value: 10 },
  { category: "C", value: 15 },
  { category: "D", value: 7 },
  { category: "E", value: 12 }
];

// Create a group with bars based on data
const barChart = buildViz({
  type: "group",
  children: data.map((item, index) => ({
    type: "rectangle",
    x: index * 60 + 20,  // Position each bar with some spacing
    y: 200 - item.value * 10,  // Position from the bottom (200px is our "baseline")
    width: 40,
    height: item.value * 10,  // Height based on data value
    fill: "steelblue",
    stroke: "navy",
    strokeWidth: 1
  }))
});

renderViz(barChart, container);
```

This creates a simple bar chart where each bar's height is determined by the corresponding data value.

## Adding Labels

Let's enhance our bar chart by adding labels:

```javascript
const labeledBarChart = buildViz({
  type: "group",
  children: [
    // First, add the bars
    ...data.map((item, index) => ({
      type: "rectangle",
      x: index * 60 + 20,
      y: 200 - item.value * 10,
      width: 40,
      height: item.value * 10,
      fill: "steelblue",
      stroke: "navy",
      strokeWidth: 1
    })),

    // Then, add category labels
    ...data.map((item, index) => ({
      type: "text",
      x: index * 60 + 40,  // Center of the bar
      y: 220,              // Below the baseline
      text: item.category,
      fontSize: 14,
      fontFamily: "Arial",
      fill: "black",
      textAnchor: "middle"
    })),

    // Finally, add value labels
    ...data.map((item, index) => ({
      type: "text",
      x: index * 60 + 40,  // Center of the bar
      y: 195 - item.value * 10,  // Above the bar
      text: item.value.toString(),
      fontSize: 12,
      fontFamily: "Arial",
      fill: "white",
      textAnchor: "middle"
    }))
  ]
});

renderViz(labeledBarChart, container);
```

## Updating Visualizations

Devize makes it easy to update visualizations when your data changes:

```javascript
// New data
const updatedData = [
  { category: "A", value: 8 },
  { category: "B", value: 4 },
  { category: "C", value: 12 },
  { category: "D", value: 16 },
  { category: "E", value: 6 }
];

// Create updated visualization
const updatedBarChart = buildViz({
  type: "group",
  children: updatedData.map((item, index) => ({
    type: "rectangle",
    x: index * 60 + 20,
    y: 200 - item.value * 10,
    width: 40,
    height: item.value * 10,
    fill: "steelblue",
    stroke: "navy",
    strokeWidth: 1
  }))
});

// Replace the previous visualization
renderViz(updatedBarChart, container);
```

## Creating a Simple Scatter Plot

Let's create another type of visualization - a scatter plot:

```javascript
// Sample data for scatter plot
const scatterData = [
  { x: 10, y: 40, size: 5, category: "Group 1" },
  { x: 20, y: 30, size: 8, category: "Group 1" },
  { x: 30, y: 60, size: 3, category: "Group 1" },
  { x: 40, y: 20, size: 10, category: "Group 2" },
  { x: 50, y: 50, size: 6, category: "Group 2" },
  { x: 60, y: 10, size: 9, category: "Group 2" },
  { x: 70, y: 70, size: 4, category: "Group 3" },
  { x: 80, y: 40, size: 7, category: "Group 3" }
];

// Color scale for categories
const colorScale = {
  "Group 1": "coral",
  "Group 2": "steelblue",
  "Group 3": "mediumseagreen"
};

// Create a scatter plot
const scatterPlot = buildViz({
  type: "group",
  children: scatterData.map(point => ({
    type: "circle",
    cx: point.x * 4,  // Scale x values to fit our container
    cy: 200 - point.y * 2,  // Scale and invert y values
    r: point.size * 2,  // Scale size values
    fill: colorScale[point.category],
    stroke: "white",
    strokeWidth: 1,
    opacity: 0.7
  }))
});

renderViz(scatterPlot, container);
```

## Creating a Custom Visualization Type

One of Devize's powerful features is the ability to define new visualization types. Let's create a simple labeled circle type:

```javascript
// Define a new visualization type
buildViz({
  type: "define",
  name: "labeledCircle",
  properties: {
    cx: { required: true },
    cy: { required: true },
    r: { default: 20 },
    fill: { default: "steelblue" },
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
        fill: "{{fill}}"
      },
      {
        type: "text",
        x: "{{cx}}",
        y: "{{cy}}",
        text: "{{label}}",
        fontSize: "{{fontSize}}",
        textAnchor: "middle",
        dominantBaseline: "middle",
        fill: "white"
      }
    ]
  }
});

// Use the new type
const labeledCircle = buildViz({
  type: "labeledCircle",
  cx: 150,
  cy: 100,
  r: 40,
  label: "Hello!"
});

renderViz(labeledCircle, container);
```

This defines a new `labeledCircle` type that combines a circle with centered text, then creates an instance of it.

## Next Steps

In this tutorial, we've covered the basics of creating visualizations with Devize using primitive shapes and simple data binding. We've created rectangles, circles, lines, and text elements, and combined them to create simple bar charts and scatter plots.

In the next tutorial, we'll introduce the constraint system, which is one of the most powerful features of Devize. This will allow you to create more complex visualizations with less code, and make them more responsive to changes in data and container size.

## Exercises

1. Modify the bar chart to use different colors for each bar based on its value.
2. Create a simple line chart using the `line` primitive and data binding.
3. Add a title and axis labels to the scatter plot.
4. Create a simple pie chart using circles and positioning them in a circular arrangement.
5. Define a custom "barWithLabel" visualization type that combines a rectangle with a label.

## References

- Related File: [src/core/devize.ts](../src/core/devize.ts)
- Related File: [src/core/creator.ts](../src/core/creator.ts)
- Related File: [src/core/renderer.ts](../src/core/renderer.ts)
- Related File: [src/primitives/rectangle.ts](../src/primitives/rectangle.ts)
- Related File: [src/primitives/circle.ts](../src/primitives/circle.ts)
- Related File: [src/primitives/line.ts](../src/primitives/line.ts)
- Related File: [src/primitives/text.ts](../src/primitives/text.ts)
- Related File: [src/primitives/group.ts](../src/primitives/group.ts)
- Design Document: [design/primitives.md](../design/primitives.md)
- Design Document: [design/devize_system.md](../design/devize_system.md)
- Design Document: [design/define.md](../design/define.md)
- User Documentation: [docs/primitives/shapes.md](../docs/primitives/shapes.md)
- Next Tutorial: [tutorials/tutorial_constraints.md](tutorial_constraints.md)

Happy visualizing with Devize!
