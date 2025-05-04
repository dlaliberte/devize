# createViz Function

## Overview

`createViz` is the core function of the Devize library that creates visualizations from declarative specifications. It takes a visualization specification and a container element, and returns a visualization instance.

## Function Signature

```typescript
function createViz(spec: VizSpec, container: HTMLElement): VizInstance
```

### Parameters

- `spec`: A visualization specification object that describes what to render
- `container`: The HTML element where the visualization will be rendered

### Return Value

- `VizInstance`: An object representing the created visualization, containing:
  - `element`: The DOM element of the visualization
  - `spec`: The specification used to create the visualization
  - Additional properties specific to the visualization type

## Basic Usage

```javascript
const myViz = createViz({
  type: "rectangle",
  x: 50,
  y: 50,
  width: 100,
  height: 80,
  fill: "#6699CC",
  stroke: "#336699",
  strokeWidth: 2
}, document.getElementById("viz-container"));
```

## Error Handling

The `createViz` function performs validation on the provided specification and will throw errors for:

- Missing type property
- Unknown visualization types
- Missing required properties for a specific type

Always wrap your `createViz` calls in try-catch blocks in production code to handle potential errors gracefully.
```

## File: docs/core/updateViz.md
```markdown
# updateViz Function

## Overview

The `updateViz` function allows you to update an existing visualization with new properties without completely recreating it.

## Function Signature

```typescript
function updateViz(vizInstance: VizInstance, newSpec: VizSpec): VizInstance
```

### Parameters

- `vizInstance`: The visualization instance to update (returned from a previous `createViz` call)
- `newSpec`: The new specification properties to apply

### Return Value

- `VizInstance`: The updated visualization instance

## Example

```javascript
// Create initial visualization
const myViz = createViz({
  type: "circle",
  cx: 150,
  cy: 150,
  r: 40,
  fill: "#CC6666"
}, document.getElementById("viz-container"));

// Later, update the visualization
updateViz(myViz, {
  r: 60,
  fill: "#6699CC"
});
```

## Notes

- The `updateViz` function removes the old visualization element and creates a new one with the updated specification
- All properties from the original specification are preserved unless overridden in the new specification
