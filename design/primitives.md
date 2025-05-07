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

## Future Enhancements

1. **Path Primitive**: Add a path primitive for complex shapes
2. **Image Primitive**: Add support for image elements
3. **Clipping**: Support for clipping regions
4. **Filters**: Visual filters like blur, shadow, etc.
5. **Animations**: Transition specifications for animations

## Conclusion

This design for primitive shapes provides a foundation for building more complex visualizations in Devize. By separating the definition from rendering and maintaining a functional approach, we enable better composability and reusability while simplifying the API.
