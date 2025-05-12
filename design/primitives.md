# Devize Shape Primitives Design

## Overview

This document outlines the design for primitive shape visualizations in Devize. These primitives serve as the fundamental building blocks for creating more complex visualizations through composition.

## Design Principles

1. **Functional First**: Shape primitives should be pure data transformations that don't directly render to the DOM.
2. **Container Independence**: Primitives should not require container elements except at the final rendering step.
3. **Composability**: All primitives should be designed for easy composition with other visualizations.
4. **Consistency**: All primitives should follow the same interface patterns.

## Architecture

### Separation of Concerns

Each primitive shape follows a two-phase approach:
1. **Definition Phase**: Creating a visualization specification object
2. **Rendering Phase**: Converting the specification to visual output (only at top level)

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ Visualization   │     │ Processing &  │     │ Rendering      │
│ Specification   │───▶│ Composition   │────▶│ (top level     │
└─────────────────┘     └───────────────┘     │  only)         │
                                              └────────────────┘
```

### Implementation Pattern

All primitive shapes follow this implementation pattern:

```javascript
// Definition (no container)
const shapeSpec = buildViz({
  type: "rectangle",
  width: 100,
  height: 50,
  // other properties...
});

// Composition (no container)
const compositeSpec = buildViz({
  type: "group",
  children: [shapeSpec, otherShapeSpec]
});

// Rendering (container only at top level)
renderViz(compositeSpec, document.getElementById("container"));
```

## Primitive Shapes

### Rectangle

A rectangle primitive that can be used for bars, backgrounds, etc.

**Properties:**
- `x`: X coordinate of the top-left corner
- `y`: Y coordinate of the top-left corner
- `width`: Width of the rectangle
- `height`: Height of the rectangle
- `fill`: Fill color
- `stroke`: Stroke color
- `strokeWidth`: Width of the stroke
- `cornerRadius`: Radius for rounded corners

### Circle

A circle primitive for points, nodes, etc.

**Properties:**
- `cx`: X coordinate of the center
- `cy`: Y coordinate of the center
- `r`: Radius of the circle
- `fill`: Fill color
- `stroke`: Stroke color
- `strokeWidth`: Width of the stroke

### Line

A line primitive for connections, axes, etc.

**Properties:**
- `x1`: X coordinate of the start point
- `y1`: Y coordinate of the start point
- `x2`: X coordinate of the end point
- `y2`: Y coordinate of the end point
- `stroke`: Stroke color
- `strokeWidth`: Width of the stroke
- `strokeDasharray`: Pattern of dashes and gaps

### Text

A text primitive for labels, annotations, etc.

**Properties:**
- `x`: X coordinate
- `y`: Y coordinate
- `text`: Text content
- `fontSize`: Font size in pixels
- `fontFamily`: Font family
- `fill`: Text color
- `textAnchor`: Text alignment ("start", "middle", "end")
- `dominantBaseline`: Vertical alignment

### Path

A path primitive for complex shapes and curves.

**Properties:**
- `d`: SVG path data string
- `fill`: Fill color
- `stroke`: Stroke color
- `strokeWidth`: Width of the stroke
- `strokeDasharray`: Pattern of dashes and gaps

### Polygon

A polygon primitive for creating custom closed shapes with straight sides.

**Properties:**
- `points`: Array of points defining the vertices of the polygon
- `fill`: Fill color
- `stroke`: Stroke color
- `strokeWidth`: Width of the stroke
- `closed`: Whether the polygon should be closed (default: true)

### Shape

A versatile shape primitive that renders predefined shapes with customizable dimensions.

**Properties:**
- `shape`: Type of shape ('circle', 'square', 'triangle', 'diamond', 'cross', 'star', 'rect')
- `x`: X coordinate of the center
- `y`: Y coordinate of the center
- `width`: Width of the shape
- `height`: Height of the shape (allows for non-uniform scaling)
- `fill`: Fill color
- `stroke`: Stroke color
- `strokeWidth`: Width of the stroke
- `rotation`: Rotation angle in degrees
- `data`: Optional data to associate with the shape
- `tooltip`: Whether to show tooltip on hover

## Relationships Between Shape Primitives

While there is some overlap between our shape primitives, each serves a specific purpose:

1. **Basic Primitives** (Rectangle, Circle, Line): Fundamental SVG elements with simple properties.

2. **Path**: Low-level primitive for complex shapes defined by path commands.

3. **Polygon**: Mid-level primitive for custom shapes defined by vertices.

4. **Shape**: High-level primitive for predefined shapes with a simple API.

The choice between these primitives depends on your needs:
- Use basic primitives for simple geometric elements
- Use path for complex custom shapes requiring precise control
- Use polygon for custom straight-sided shapes
- Use shape for common predefined shapes with minimal configuration

## Rendering Implementation

The rendering process is separated from the definition to maintain the functional approach:

```javascript
// Internal implementation (simplified)
function renderViz(vizSpec, container) {
  // Create appropriate DOM element based on type
  const element = createDOMElement(vizSpec.type);

  // Apply properties
  applyProperties(element, vizSpec);

  // Handle children if any
  if (vizSpec.children) {
    vizSpec.children.forEach(childSpec => {
      const childElement = renderViz(childSpec);
      element.appendChild(childElement);
    });
  }

  // Only append to container if provided (top level)
  if (container) {
    container.appendChild(element);
  }

  return element;
}
```

## Composition Examples

### Simple Bar Chart

```javascript
function createBarChart(data) {
  return buildViz({
    type: "group",
    children: data.map((item, index) => ({
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
}

// Usage
const barChartSpec = createBarChart(myData);
renderViz(barChartSpec, document.getElementById("chart-container"));
```

### Labeled Circle

```javascript
function createLabeledCircle(cx, cy, r, label) {
  return buildViz({
    type: "group",
    children: [
      {
        type: "circle",
        cx: cx,
        cy: cy,
        r: r,
        fill: "steelblue",
        stroke: "navy",
        strokeWidth: 1
      },
      {
        type: "text",
        x: cx,
        y: cy,
        text: label,
        fontSize: 12,
        textAnchor: "middle",
        dominantBaseline: "middle",
        fill: "white"
      }
    ]
  });
}
```

### Scatter Plot with Different Shapes

```javascript
function createScatterPlot(data) {
  return buildViz({
    type: "group",
    children: data.map(item => ({
      type: "shape",
      shape: item.category === 'A' ? 'circle' :
             item.category === 'B' ? 'triangle' : 'square',
      x: item.x,
      y: item.y,
      width: item.size * 2,
      height: item.size * 2,
      fill: item.color,
      stroke: "#fff",
      strokeWidth: 1,
      data: item,
      tooltip: true
    }))
  });
}
```

## Future Enhancements

1. **Custom Shapes**: Support for user-defined shape types
2. **Image Primitive**: Add support for image elements
3. **Clipping**: Support for clipping regions
4. **Filters**: Visual filters like blur, shadow, etc.
5. **Animations**: Transition specifications for animations
6. **3D Shapes**: Support for basic 3D shape primitives

## Conclusion

This design for primitive shapes provides a foundation for building more complex visualizations in Devize. By separating the definition from rendering and maintaining a functional approach, we enable better composability and reusability while simplifying the API. The hierarchy of shape primitives from basic (rectangle, circle) to high-level (shape) provides flexibility for different use cases.
