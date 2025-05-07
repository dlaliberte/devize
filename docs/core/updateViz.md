# updateViz Function

## Overview

The `updateViz` function allows you to update an existing visualization with new properties without completely recreating it.

## Function Signature

```typescript
function updateViz(vizInstance: VizInstance, newSpec: VizSpec): VizInstance
```

### Parameters

- `vizInstance`: The visualization instance to update (returned from a previous `buildViz` call)
- `newSpec`: The new specification properties to apply

### Return Value

- `VizInstance`: The updated visualization instance

## Example

```javascript
// Create initial visualization
const myViz = buildViz({
  type: "circle",
  cx: 150,
  cy: 150,
  r: 40,
  fill: "#CC6666",
  container: document.getElementById("viz-container")
});

// Later, update the visualization
updateViz(myViz, {
  r: 60,
  fill: "#6699CC"
});
```

## Notes

- For rendering visualizations, the `updateViz` function removes the old visualization element and creates a new one with the updated specification
- For data transformation visualizations, it creates a new instance with the updated specification
- All properties from the original specification are preserved unless overridden in the new specification
