# Visualization Creation and Rendering in Devize

## Overview

This document clarifies the relationship between visualization creation (`createViz`) and visualization rendering (`renderViz`) in Devize, and explains how these core functions work together in the visualization pipeline.

## Core Functions

### 1. Visualization Creation (`createViz`)

`createViz` is the primary API function for creating visualizations:
- Takes a visualization specification
- Processes the specification into a renderable object
- Returns the processed visualization object
- Does NOT render to a container (no container parameter)

```javascript
// Create a visualization (without rendering)
const myViz = createViz({
  type: "rectangle",
  width: 100,
  height: 50,
  fill: "steelblue"
});
```

### 2. Visualization Rendering (`renderViz`)

`renderViz` (currently named `render` in the codebase) is responsible for rendering:
- Takes a visualization specification and a container
- Processes the specification using the same logic as `createViz`
- Selects the appropriate rendering backend based on the container
- Renders the visualization to the container
- Returns the rendered result

```javascript
// Render a visualization to a container
const renderedResult = renderViz({
  type: "circle",
  r: 30,
  fill: "coral"
}, document.getElementById('container'));
```

## The Relationship Between Creation and Rendering

The relationship between these functions is:

1. Both `createViz` and `renderViz` process visualization specifications
2. `createViz` stops after creating the renderable object
3. `renderViz` continues by selecting a backend and rendering to a container
4. `renderViz` uses the same processing logic as `createViz` internally

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ createViz       │────▶│ process       │────▶│ renderable     │
│ (creation only) │     │ specification │     │ object         │
└─────────────────┘     └───────────────┘     └────────────────┘

┌─────────────────┐     ┌───────────────┐     ┌────────────────┐     ┌────────────────┐
│ renderViz       │────▶│ process       │────▶│ renderable     │────▶│ render to      │
│ (with container)│     │ specification │     │ object         │     │ container      │
└─────────────────┘     └───────────────┘     └────────────────┘     └────────────────┘
```

## Implementation Details

### Processing Logic

Both `createViz` and `renderViz` use the same core processing logic:

1. Resolve the visualization type from the registry
2. Apply default values for optional properties
3. Validate required properties
4. Call the type's implementation function
5. Return the processed object with rendering functions

The key difference is that `renderViz` takes the additional step of calling the appropriate rendering function with the provided container.

### Refactoring Recommendation

Currently, the processing logic is in `processVisualization` in `src/core/processor.ts`. Since this logic is essentially what `createViz` should do, we recommend:

1. Rename `processVisualization` to `createViz`
2. Update `renderViz` (currently `render`) to use `createViz` internally
3. Ensure `createViz` doesn't accept a container parameter
4. Keep `renderViz` as the function that handles container-based rendering

### Type Registration

The "define" type has the side effect of registering new types:

1. When a "define" visualization is processed, it registers a new type
2. This registration makes the type available for subsequent visualizations
3. This side effect is essential to Devize's extensibility model

## Usage Patterns

### 1. Create and Render Separately

The most common pattern is to create and render separately:

```javascript
// Create a visualization
const myCircle = createViz({
  type: "circle",
  cx: 100,
  cy: 100,
  r: 50,
  fill: "steelblue"
});

// Later, render it to a container
renderViz(myCircle, document.getElementById('container'));
```

### 2. Direct Rendering

For simple cases, render directly:

```javascript
// Render directly to a container
renderViz({
  type: "rectangle",
  width: 200,
  height: 100,
  fill: "coral"
}, document.getElementById('container'));
```

### 3. Define and Use Types

Define new types and use them:

```javascript
// Define a new type
createViz({
  type: "define",
  name: "labeledCircle",
  properties: {
    cx: { required: true },
    cy: { required: true },
    r: { default: 20 },
    label: { required: true }
  },
  implementation: {
    type: "group",
    children: [
      {
        type: "circle",
        cx: "{{cx}}",
        cy: "{{cy}}",
        r: "{{r}}",
        fill: "steelblue"
      },
      {
        type: "text",
        x: "{{cx}}",
        y: "{{cy}}",
        text: "{{label}}",
        textAnchor: "middle",
        dominantBaseline: "middle",
        fill: "white"
      }
    ]
  }
});

// Use the new type
const labeledCircle = createViz({
  type: "labeledCircle",
  cx: 150,
  cy: 150,
  r: 40,
  label: "Hello!"
});

// Render it
renderViz(labeledCircle, document.getElementById('container'));
```

### 4. Combined Definition and Usage

Define and use in a single specification:

```javascript
// Define and use in one specification
renderViz({
  type: "group",
  children: [
    // Define a new type
    {
      type: "define",
      name: "labeledCircle",
      // ... properties and implementation
    },

    // Use the new type
    {
      type: "labeledCircle",
      cx: 100,
      cy: 100,
      label: "Hello!"
    }
  ]
}, document.getElementById('container'));
```

## Processing Order and Type Registration

When processing a specification that both defines and uses types:

1. Processing happens in a depth-first order
2. The "define" type registers new types during processing
3. Types must be defined before they are used
4. In a group, place definitions before usages

## Best Practices

### 1. Separate Creation from Rendering

Keep visualization creation separate from rendering:
- Create visualizations with `createViz`
- Render them with `renderViz`
- This separation allows for more flexible usage patterns

### 2. Reuse Processed Visualizations

Once a visualization is processed with `createViz`, it can be rendered multiple times:

```javascript
const myViz = createViz({ type: "circle", r: 30 });

// Render to multiple containers
renderViz(myViz, container1);
renderViz(myViz, container2);
```

### 3. Define Types in Separate Files

For better organization, define types in separate files:

```javascript
// In circle-types.js
createViz({
  type: "define",
  name: "labeledCircle",
  // ... properties and implementation
});

// In main.js
import './circle-types.js';

renderViz({
  type: "labeledCircle",
  // ... properties
}, container);
```

## Conclusion

The separation of `createViz` and `renderViz` provides a clean architecture that separates visualization creation from rendering. This design allows for more flexible usage patterns, better reuse of visualizations, and a clearer mental model of the visualization pipeline.

## References

- Related File: [src/core/devize.ts](../src/core/devize.ts)
- Related File: [src/core/renderer.ts](../src/core/renderer.ts)
- Related File: [src/core/processor.ts](../src/core/processor.ts)
- Related File: [src/core/define.ts](../src/core/define.ts)
- Related File: [src/core/registry.ts](../src/core/registry.ts)
- Design Document: [design/define.md](define.md)
- Design Document: [design/rendering.md](rendering.md)
- User Documentation: [docs/core/visualization.md](../docs/core/visualization.md)
