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
import { createViz } from 'devize';

// Create a container element
const container = document.getElementById('visualization-container');

// Create a simple rectangle visualization
const rectangleViz = createViz({
  type: "rectangle",
  width: 200,
  height: 100,
  fill: "steelblue",
  stroke: "black",
  strokeWidth: 2
}, container);
```

This creates a blue rectangle with a black border inside your container element. Notice how we're describing *what* we want (a rectangle with specific dimensions and colors) rather than *how* to create it (no DOM manipulation or SVG creation code).

## Working with Primitive Shapes

Devize provides several primitive visualization types that you can use as building blocks:

### Rectangles

```javascript
const rect = createViz({
  type: "rectangle",
  x: 50,      // Position from left
  y: 50,      // Position from top
  width: 100,
  height: 80,
  fill: "coral",
  stroke: "darkred",
  strokeWidth: 2,
  rx: 10,     // Rounded corners (x-radius)
  ry: 10      // Rounded corners (y-radius)
}, container);
```

### Circles

```javascript
const circle = createViz({
  type: "circle",
  cx: 150,    // Center x-coordinate
  cy: 100,    // Center y-coordinate
  r: 50,      // Radius
  fill: "lightgreen",
  stroke: "darkgreen",
  strokeWidth: 2
}, container);
```

### Lines

```javascript
const line = createViz({
  type: "line",
  x1: 50,     // Start x-coordinate
  y1: 50,     // Start y-coordinate
  x2: 200,    // End x-coordinate
  y2: 150,    // End y-coordinate
  stroke: "purple",
  strokeWidth: 3
}, container);
```

### Text

```javascript
const text = createViz({
  type: "text",
  x: 100,
  y: 100,
  text: "Hello, Devize!",
  fontSize: 16,
  fontFamily: "Arial",
  fill: "navy",
  textAnchor: "middle"  // Center-align text
}, container);
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
const styledRect = createViz({
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
}, container);
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

// Create a group to hold our bars
const barChart = createViz({
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
}, container);
```

This creates a simple bar chart where each bar's height is determined by the corresponding data value.

## Adding Labels

Let's enhance our bar chart by adding labels:

```javascript
const labeledBarChart = createViz({
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
}, container);
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

// Update the visualization
updateViz(barChart, {
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
const scatterPlot = createViz({
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
}, container);
```

## Next Steps

In this tutorial, we've covered the basics of creating visualizations with Devize using primitive shapes and simple data binding. We've created rectangles, circles, lines, and text elements, and combined them to create simple bar charts and scatter plots.

In the next tutorial, we'll introduce the constraint system, which is one of the most powerful features of Devize. This will allow you to create more complex visualizations with less code, and make them more responsive to changes in data and container size.

## Exercises

1. Modify the bar chart to use different colors for each bar based on its value.
2. Create a simple line chart using the `line` primitive and data binding.
3. Add a title and axis labels to the scatter plot.
4. Create a simple pie chart using the `path` primitive (hint: you'll need to calculate the arc paths).
5. Experiment with different styling options for the visualizations.

Happy visualizing with Devize!
