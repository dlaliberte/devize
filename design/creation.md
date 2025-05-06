# Visualization Creation in Devize

## Overview

This document outlines the design of Devize's visualization creation system, focusing on the `createViz` function which is the core API for creating visualization objects. This function processes visualization specifications into renderable objects that can later be rendered to various backends.

## Core Function: `createViz`

### Purpose

`createViz` is the primary API function for creating visualizations in Devize. It:
- Takes a visualization specification
- Processes the specification into a renderable object
- Returns the processed visualization object with rendering functions
- Does NOT render to a container (no container parameter)

### Signature

```typescript
function createViz(spec: VisualizationSpec): RenderableVisualization
```

Where:
- `VisualizationSpec` is an object describing the visualization
- `RenderableVisualization` is a processed object with rendering functions

## Implementation Architecture

### Core Components

1. **Type Registry**: Provides access to registered visualization types
2. **Property Processor**: Handles default values and validation
3. **Implementation Executor**: Calls the type's implementation function
4. **Rendering Function Generator**: Creates backend-specific rendering functions

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ Visualization   │     │ Type Registry │     │ Property       │
│ Specification   │────▶│ Lookup        │────▶│ Processor      │
└─────────────────┘     └───────────────┘     └────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ Renderable      │◄────│ Rendering     │◄────│ Implementation │
│ Visualization   │     │ Function Gen  │     │ Executor       │
└─────────────────┘     └───────────────┘     └────────────────┘
```

## Processing Flow

The processing flow in `createViz` follows these steps:

1. **Input Check**: If the input is already a processed object with rendering functions, return it
2. **Type Resolution**: Look up the visualization type in the registry
3. **Default Application**: Apply default values for any missing optional properties
4. **Validation**: Ensure all required properties are present and valid
5. **Implementation Execution**: Call the type's implementation function to produce a renderable object
6. **Return**: Return the processed object with rendering functions

## Relationship with Other Components

### Relationship with `renderViz`

`renderViz` uses `createViz` internally:
1. `renderViz` calls `createViz` to process the visualization specification
2. `renderViz` then selects the appropriate backend based on the container
3. `renderViz` calls the rendering function with the container
4. This separation allows for a clean division of responsibilities

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ renderViz       │────▶│ createViz     │────▶│ renderable     │
│ (with container)│     │               │     │ object         │
└─────────────────┘     └───────────────┘     └────────────────┘
        │                                              │
        │                                              │
        ▼                                              ▼
┌─────────────────┐                          ┌────────────────┐
│ select backend  │                          │ call rendering │
│ based on        │─────────────────────────▶│ function with  │
│ container       │                          │ container      │
└─────────────────┘                          └────────────────┘
```

### Relationship with Type Registry

`createViz` depends on the type registry:
1. It looks up visualization types by name
2. It uses the type's properties for validation and defaults
3. It calls the type's implementation function

### Relationship with "define" Type

The "define" type has a special relationship with `createViz`:
1. When `createViz` processes a "define" visualization, it registers a new type
2. This registration makes the type available for subsequent calls to `createViz`
3. This allows for extending the visualization system with new types

## Usage Examples

### Basic Usage

```javascript
// Create a simple rectangle visualization
const rectangle = createViz({
  type: "rectangle",
  x: 10,
  y: 20,
  width: 100,
  height: 50,
  fill: "steelblue"
});

// Later, render it
renderViz(rectangle, document.getElementById('container'));
```

### Creating Composite Visualizations

```javascript
// Create a group with multiple children
const group = createViz({
  type: "group",
  children: [
    {
      type: "circle",
      cx: 100,
      cy: 100,
      r: 50,
      fill: "coral"
    },
    {
      type: "text",
      x: 100,
      y: 100,
      text: "Hello!",
      textAnchor: "middle",
      dominantBaseline: "middle"
    }
  ]
});

// Later, render it
renderViz(group, document.getElementById('container'));
```

### Defining and Using Custom Types

```javascript
// Define a new visualization type
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

// Later, render it
renderViz(labeledCircle, document.getElementById('container'));
```

## Design Considerations

### 1. Immutability

`createViz` treats input specifications as immutable:
- It creates a copy of the specification before applying defaults
- It does not modify the original specification
- This ensures that the same specification can be used multiple times

### 2. Idempotence

`createViz` is idempotent for processed objects:
- If given an already processed object, it returns it unchanged
- This allows for passing the same object through multiple processing steps

### 3. Error Handling

`createViz` provides clear error messages:
- Unknown visualization types
- Missing required properties
- Invalid property values (via type-specific validation)

### 4. Performance Considerations

For performance, `createViz` could be enhanced with:
- Caching of processed visualizations
- Lazy evaluation of complex properties
- Optimized property validation

## Future Enhancements

1. **Type Checking**: Add TypeScript interfaces for better type checking
2. **Caching**: Add caching of processed visualizations for performance
3. **Async Support**: Support for asynchronous visualization processing
4. **Validation Enhancement**: More sophisticated property validation
5. **Debugging Support**: Better debugging information for visualization creation

## References

- Related File: [src/core/creator.ts](../src/core/creator.ts)
- Related File: [src/core/renderer.ts](../src/core/renderer.ts)
- Related File: [src/core/registry.ts](../src/core/registry.ts)
- Related File: [src/core/define.ts](../src/core/obsolete-define.ts)
- Design Document: [design/viz_creation_rendering.md](viz_creation_rendering.md)
- Design Document: [design/rendering.md](rendering.md)
- Design Document: [design/define.md](define.md)
- User Documentation: [docs/core/visualization.md](../docs/core/visualization.md)
