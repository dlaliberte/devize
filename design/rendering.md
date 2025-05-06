# Devize Rendering System Design

## Overview

This document outlines the design of Devize's top-level rendering system, which is responsible for taking visualization specifications and rendering them to various backends (SVG, Canvas, etc.). It also covers the design of the group container, which is a fundamental primitive for composing visualizations.

## Top-Level Rendering Architecture

### Core Components

1. **Renderer**: The main entry point for rendering visualizations
2. **Visualization Processor**: Processes visualization specifications into renderable objects
3. **Backend Adapters**: Specific implementations for different rendering targets (SVG, Canvas, WebGL)
4. **Group Container**: Special primitive for composing multiple visualizations

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ Visualization   │     │ Visualization │     │ Rendering      │
│ Specification   │────▶│ Processor     │────▶│ Functions      │
└─────────────────┘     └───────────────┘     └────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ Container       │◄────│ Top-Level     │◄────│ Backend        │
│ Element         │     │ Renderer      │     │ Adapters       │
└─────────────────┘     └───────────────┘     └────────────────┘
```

## Top-Level Renderer Design

The top-level renderer is responsible for:
1. Processing visualization specifications
2. Selecting the appropriate backend
3. Calling rendering functions with the container
4. Managing the rendering lifecycle

### Renderer Responsibilities

The renderer performs several key functions:

1. **Specification Processing**: Converts raw visualization specifications into renderable objects with rendering functions
2. **Backend Detection**: Determines the appropriate rendering backend based on the container type
3. **Container Preparation**: Ensures the container is ready for rendering (e.g., creating an SVG element if needed)
4. **Rendering Execution**: Calls the appropriate rendering function with the container
5. **Error Handling**: Manages errors during the rendering process

### Visualization Processor

The processor is responsible for converting visualization specifications into renderable objects:

1. **Type Resolution**: Looks up the visualization type in the registry
2. **Property Validation**: Ensures all required properties are present
3. **Default Application**: Applies default values for missing optional properties
4. **Implementation Execution**: Calls the type's implementation function to produce a renderable object

## Group Container Design

The group container is a special primitive that composes multiple visualizations:

### Group Container Responsibilities

1. **Child Processing**: Processes all child visualization specifications
2. **Transformation Management**: Handles positioning and transformation of the group
3. **Recursive Rendering**: Renders all children in the appropriate context
4. **Context Management**: Manages rendering context state (e.g., saving/restoring Canvas context)

## Rendering Flow

The rendering flow in Devize follows these steps:

1. **Specification Creation**: User creates a visualization specification
2. **Top-Level Rendering**: The `render` function is called with the spec and a container
3. **Specification Processing**: The processor converts the spec into a renderable object
4. **Backend Selection**: The renderer selects the appropriate backend based on the container
5. **Rendering Execution**: The rendering function is called with the container
6. **Recursive Rendering**: For composite visualizations like groups, child elements are rendered recursively

### Example Flow

```javascript
// User creates a visualization specification
const spec = {
  type: "group",
  children: [
    {
      type: "rectangle",
      x: 10,
      y: 10,
      width: 100,
      height: 50,
      fill: "steelblue"
    },
    {
      type: "circle",
      cx: 150,
      cy: 35,
      r: 25,
      fill: "coral"
    }
  ]
};

// User calls the render function with a container
const container = document.getElementById('visualization');
render(spec, container);

// Internally:
// 1. The processor processes the group specification
// 2. The group implementation processes its children
// 3. The renderer calls the appropriate rendering function
// 4. The group's rendering function renders each child
// 5. Each child's rendering function renders to the provided container
```

## Design Considerations

### 1. Separation of Concerns

The rendering system maintains a strict separation between:
- Visualization specification (what to render)
- Processing logic (how to prepare for rendering)
- Rendering functions (how to render to a specific backend)

### 2. Backend Agnosticism

The design allows for multiple rendering backends:
- SVG for vector graphics
- Canvas for pixel-based rendering
- WebGL for hardware-accelerated rendering (future)

### 3. Recursive Composition

The rendering system supports recursive composition through:
- The group container primitive
- Consistent rendering function interfaces
- Child processing in composite visualizations

### 4. Lazy Evaluation

The system uses lazy evaluation:
- Specifications are only processed when rendering is requested
- Rendering functions are only called when needed
- This allows for efficient updates and reuse

### 5. Container Isolation

A key design principle is that visualization definitions do not accept or use containers directly:
- Only the top-level renderer and the rendering functions it calls accept containers
- This ensures a clean separation between definition and rendering
- It also allows for reuse of visualization definitions in different contexts

## Future Enhancements

1. **Caching**: Add caching of processed visualizations for performance
2. **Incremental Updates**: Support for updating only changed parts of a visualization
3. **Animation**: Built-in support for animated transitions
4. **WebGL Support**: Add WebGL backend for high-performance rendering
5. **Server-Side Rendering**: Support for rendering on the server

## References

- Related File: [src/core/renderer.ts](../src/core/renderer.ts)
- Related File: [src/core/processor.ts](../src/core/processor.ts)
- Related File: [src/core/registry.ts](../src/core/registry.ts)
- Related File: [src/primitives/group.ts](../src/primitives/group.ts)
- Design Document: [design/primitive_implementation.md](primitive_implementation.md)
- Design Document: [design/define.md](define.md)
- User Documentation: [docs/core/rendering.md](../docs/core/rendering.md)
- User Documentation: [docs/primitives/group.md](../docs/primitives/group.md)
