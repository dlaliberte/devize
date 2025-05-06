# Devize Tutorial Part 2: Constraints and Composition

## Introduction

Welcome to the second part of the Devize tutorial series! In this tutorial, we'll explore two powerful features of Devize: the constraint system and compositional patterns. These features allow you to create more complex and responsive visualizations with less code.

In the previous tutorial, we used absolute positioning to place elements. While this works for simple cases, it becomes cumbersome for complex visualizations and doesn't adapt well to different screen sizes or data changes. The constraint system solves these problems by allowing you to specify relationships between elements rather than absolute positions.

## Understanding Constraints

Constraints in Devize define relationships between elements that must be satisfied. Instead of saying "place this rectangle at x=100, y=50," you can say "place this rectangle to the right of that circle with 10 pixels of space between them."

### Basic Constraint Types

Devize provides several types of constraints:

1. **Positional Constraints**: Define how elements are positioned relative to each other
2. **Dimensional Constraints**: Define size relationships between elements
3. **Distributional Constraints**: Define how elements are distributed in space
4. **Aesthetic Constraints**: Define visual properties like aspect ratios

Let's see how to use these constraints in practice.

## Container Fitting

One of the most basic constraints is fitting a visualization to its container:

```javascript
import { createViz } from 'devize';

const container = document.getElementById('visualization-container');

const responsiveRect = createViz({
  type: "rectangle",
  fill: "steelblue",
  stroke: "navy",
  strokeWidth: 2,
  constraints: [
    { type: "fitToContainer" }
  ]
}, container);
```

This rectangle will automatically resize to fit its container. If the container size changes, the rectangle will adjust accordingly.

You can also specify padding:

```javascript
const paddedRect = createViz({
  type: "rectangle",
  fill: "coral",
  stroke: "darkred",
  strokeWidth: 2,
  constraints: [
    { type: "fitToContainer", padding: 20 }
  ]
}, container);
```

## Relative Positioning

Relative positioning constraints allow you to position elements in relation to other elements:

```javascript
const composedViz = createViz({
  type: "group",
  children: [
    {
      id: "blueRect",
      type: "rectangle",
      width: 100,
      height: 80,
      fill: "steelblue",
      constraints: [
        { type: "position", x: 50, y: 50 }  // Absolute position for the first element
      ]
    },
    {
      id: "greenCircle",
      type: "circle",
      r: 40,
      fill: "lightgreen",
      constraints: [
        { type: "rightOf", element: "blueRect", gap: 20 },
        { type: "alignMiddleY", element: "blueRect" }
      ]
    },
    {
      id: "redRect",
      type: "rectangle",
      width: 80,
      height: 60,
      fill: "indianred",
      constraints: [
        { type: "below", element: "blueRect", gap: 30 },
        { type: "alignCenterX", element: "blueRect" }
      ]
    }
  ]
}, container);
```

In this example:
- The blue rectangle is positioned at (50, 50)
- The green circle is positioned to the right of the blue rectangle with a 20-pixel gap
- The green circle is aligned vertically with the blue rectangle
- The red rectangle is positioned below the blue rectangle with a 30-pixel gap
- The red rectangle is centered horizontally with the blue rectangle

## Size Constraints

Size constraints allow you to define relationships between the dimensions of elements:

```javascript
const sizeConstrainedViz = createViz({
  type: "group",
  children: [
    {
      id: "mainRect",
      type: "rectangle",
      fill: "steelblue",
      constraints: [
        { type: "width", value: 200 },
        { type: "height", value: 150 },
        { type: "position", x: 50, y: 50 }
      ]
    },
    {
      id: "proportionalRect",
      type: "rectangle",
      fill: "coral",
      constraints: [
        { type: "rightOf", element: "mainRect", gap: 30 },
        { type: "alignTopEdge", element: "mainRect" },
        { type: "proportionalWidth", element: "mainRect", ratio: 0.5 },
        { type: "proportionalHeight", element: "mainRect", ratio: 0.5 }
      ]
    },
    {
      id: "aspectRatioRect",
      type: "rectangle",
      fill: "mediumseagreen",
      constraints: [
        { type: "below", element: "mainRect", gap: 30 },
        { type: "alignLeftEdge", element: "mainRect" },
        { type: "width", value: 120 },
        { type: "aspectRatio", value: 16/9 }
      ]
    }
  ]
}, container);
```

In this example:
- The main rectangle has fixed dimensions of 200×150 pixels
- The coral rectangle is half the width and height of the main rectangle
- The green rectangle has a fixed width of 120 pixels and an aspect ratio of 16:9

## Distribution Constraints

Distribution constraints allow you to arrange multiple elements with equal spacing:

```javascript
// Sample data
const data = [
  { category: "A", value: 5 },
  { category: "B", value: 10 },
  { category: "C", value: 15 },
  { category: "D", value: 7 },
  { category: "E", value: 12 }
];

const distributedBars = createViz({
  type: "group",
  constraints: [
    { type: "fitToContainer", padding: 20 }
  ],
  children: [
    // First, create a container for the bars
    {
      id: "barContainer",
      type: "group",
      constraints: [
        { type: "fitToContainer" }
      ],
      children: data.map((item, index) => ({
        id: `bar-${index}`,
        type: "rectangle",
        height: item.value * 10,
        fill: "steelblue",
        stroke: "navy",
        strokeWidth: 1,
        constraints: [
          // We'll set the width and position using distribution constraints
          { type: "alignBottomEdge", element: "barContainer" }
        ]
      }))
    }
  ]
}, container);

// Add distribution constraints
updateViz(distributedBars, {
  children: [
    {
      id: "barContainer",
      constraints: [
        { type: "fitToContainer" },
        {
          type: "distributeHorizontally",
          elements: data.map((_, index) => `bar-${index}`),
          padding: 10,
          widthRatio: 0.8  // Bars take up 80% of available space
        }
      ]
    }
  ]
});
```

This creates a bar chart where the bars are automatically distributed horizontally with equal spacing, and each bar takes up 80% of its allocated space.

## Compositional Patterns

Now that we understand basic constraints, let's explore how to compose visualizations to create more complex ones.

### Groups and Layouts

The `group` type in Devize allows you to create hierarchical structures of visualizations:

```javascript
const dashboard = createViz({
  type: "group",
  constraints: [
    { type: "fitToContainer" }
  ],
  children: [
    {
      id: "header",
      type: "group",
      constraints: [
        { type: "alignTopEdge", element: "parent" },
        { type: "alignLeftEdge", element: "parent" },
        { type: "alignRightEdge", element: "parent" },
        { type: "height", value: 50 }
      ],
      children: [
        {
          type: "rectangle",
          constraints: [
            { type: "fitToContainer" }
          ],
          fill: "#f0f0f0",
          stroke: "#cccccc",
          strokeWidth: 1
        },
        {
          type: "text",
          text: "Dashboard Title",
          fontSize: 20,
          fontFamily: "Arial",
          fill: "#333333",
          constraints: [
            { type: "centerIn", element: "parent" }
          ]
        }
      ]
    },
    {
      id: "mainContent",
      type: "group",
      constraints: [
        { type: "below", element: "header", gap: 10 },
        { type: "alignLeftEdge", element: "parent" },
        { type: "alignRightEdge", element: "parent" },
        { type: "alignBottomEdge", element: "parent" }
      ],
      children: [
        {
          id: "leftPanel",
          type: "group",
          constraints: [
            { type: "alignTopEdge", element: "parent" },
            { type: "alignLeftEdge", element: "parent" },
            { type: "alignBottomEdge", element: "parent" },
            { type: "proportionalWidth", element: "parent", ratio: 0.3 }
          ],
          children: [
            {
              type: "rectangle",
              constraints: [
                { type: "fitToContainer" }
              ],
              fill: "#e6f7ff",
              stroke: "#91d5ff",
              strokeWidth: 1
            },
            {
              type: "text",
              text: "Left Panel",
              fontSize: 16,
              fontFamily: "Arial",
              fill: "#333333",
              constraints: [
                { type: "centerIn", element: "parent" }
              ]
            }
          ]
        },
        {
          id: "rightPanel",
          type: "group",
          constraints: [
            { type: "alignTopEdge", element: "parent" },
            { type: "rightOf", element: "leftPanel", gap: 10 },
            { type: "alignRightEdge", element: "parent" },
            { type: "alignBottomEdge", element: "parent" }
          ],
          children: [
            {
              type: "rectangle",
              constraints: [
                { type: "fitToContainer" }
              ],
              fill: "#fff7e6",
              stroke: "#ffd591",
              strokeWidth: 1
            },
            {
              type: "text",
              text: "Right Panel",
              fontSize: 16,
              fontFamily: "Arial",
              fill: "#333333",
              constraints: [
                { type: "centerIn", element: "parent" }
              ]
            }
          ]
        }
      ]
    }
  ]
}, container);
```

This creates a dashboard layout with a header and two panels. The constraints ensure that the layout adapts to the container size.

## Next Steps

In this tutorial, we've explored the constraint system and compositional patterns in Devize. We've learned how to use constraints to create responsive visualizations that adapt to their containers and maintain relationships between elements.

In the next tutorial, we'll dive into the type system and extension mechanism, which will allow us to create reusable visualization templates and extend existing visualization types to create new ones.

## Exercises

1. Create a responsive bar chart that adapts to its container size using constraints.
2. Build a simple dashboard with a header, sidebar, and main content area using groups and constraints.
3. Create a scatter plot where the points are distributed based on their data values using constraints.
4. Implement a simple grid layout using distribution constraints.
5. Build a visualization that maintains a specific aspect ratio regardless of container size.

Happy visualizing with Devize!
