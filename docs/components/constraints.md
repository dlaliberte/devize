# Constraints

Constraints in Devize help control the layout and appearance of visualizations.

## Using Constraints

Constraints are specified in the `constraints` array of a visualization specification:

```javascript
buildViz({
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
}, document.getElementById("viz-container"));
```

## Common Constraint Types

### fitToContainer

Makes the visualization fit within its container element.

```javascript
{ type: "fitToContainer", priority: "high" }
```

### aspectRatio

Maintains a specific aspect ratio for the visualization.

```javascript
{ type: "aspectRatio", value: 1.5 }
```

### rightOf

Positions one element to the right of another.

```javascript
{
  type: "rightOf",
  element: "element2",
  reference: "element1",
  gap: 20
}
```

### alignMiddle

Aligns the vertical centers of multiple elements.

```javascript
{
  type: "alignMiddle",
  elements: ["element1", "element2", "element3"]
}
```

### equalSize

Makes multiple elements have the same size.

```javascript
{
  type: "equalSize",
  elements: ["element1", "element2", "element3"]
}
```

### barWidthRatio

Controls the width of bars in a bar chart relative to the available space.

```javascript
{ type: "barWidthRatio", value: 0.7 }
```

## Constraint Priorities

Constraints can have different priorities:

- `"low"`: Lowest priority, easily overridden
- `"medium"`: Default priority
- `"high"`: High priority, overrides lower priorities
- `"required"`: Must be satisfied, cannot be overridden

Example:

```javascript
{
  type: "fitToContainer",
  priority: "high"
}
```
